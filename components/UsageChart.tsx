import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart } from 'recharts';
import { ProcessedConsumptionData, PriceTier } from '../types';

interface UsageChartProps {
  data: any[];
  xAxisDataKey: string;
  lineDataKey: string;
  showArea: boolean;
}

const PRICE_TIER_COLORS: { [key in PriceTier]: string } = {
  [PriceTier.LOW]: '#10b981', // Emerald 500
  [PriceTier.NORMAL]: '#f59e0b', // Amber 500
  [PriceTier.HIGH]: '#ef4444', // Red 500
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isHourlyData = 'priceTier' in data;

    if (isHourlyData) {
      const hourlyData = data as ProcessedConsumptionData;
      return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-slate-300 shadow-lg">
          <p className="font-bold text-slate-800">{`Time: ${label}`}</p>
          <p className="text-blue-500">{`Usage: ${hourlyData.usageKWh.toFixed(3)} kWh`}</p>
          <p className="text-amber-500">{`Cost: ${hourlyData.cost.toFixed(2)} lei`}</p>
          <p className="capitalize" style={{ color: PRICE_TIER_COLORS[hourlyData.priceTier] }}>
              {`Tariff: ${hourlyData.priceTier}`}
          </p>
        </div>
      );
    } else {
        return (
             <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-slate-300 shadow-lg">
                <p className="font-bold text-slate-800">{`Date: ${label}`}</p>
                <p className="text-blue-500">{`Total Usage: ${data.usageKWh.toFixed(2)} kWh`}</p>
                <p className="text-amber-500">{`Total Cost: ${data.cost.toFixed(2)} lei`}</p>
            </div>
        )
    }
  }
  return null;
};


const UsageChart: React.FC<UsageChartProps> = ({ data, xAxisDataKey, lineDataKey, showArea }) => {
  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 aspect-[4/3] md:aspect-[16/9]">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent 
            data={data}
            margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
        >
          {showArea && (
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
          )}
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={xAxisDataKey} 
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            interval={xAxisDataKey === 'time' ? 2 : 0}
            />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }} 
            domain={[0, 'dataMax']}
            tickCount={5}
            tickFormatter={(value) => {
                if (typeof value !== 'number') return value;
                // Daily (time) needs more precision, weekly (day) less.
                const fixedValue = value.toFixed(xAxisDataKey === 'time' ? 3 : 2);
                return parseFloat(fixedValue).toString();
            }}
            label={{ value: 'kWh', position: 'top', dy: -15, fill: '#94a3b8', style: { fontSize: '12px' } }}
            />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
          {showArea ? (
            <Area 
                type="monotone"
                dataKey={lineDataKey}
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#colorUsage)"
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} 
            />
          ) : (
            <Line 
              dataKey={lineDataKey} 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} 
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;