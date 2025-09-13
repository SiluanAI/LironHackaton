import React from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProcessedConsumptionData, PriceTier } from '../types';

interface UsageChartProps {
  data: ProcessedConsumptionData[];
}

const PRICE_TIER_COLORS: { [key in PriceTier]: string } = {
  [PriceTier.LOW]: '#34d399', // Emerald 500
  [PriceTier.NORMAL]: '#fbbf24', // Amber 400
  [PriceTier.HIGH]: '#f87171', // Red 400
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProcessedConsumptionData;
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-600 shadow-lg">
        <p className="font-bold text-white">{`Time: ${label}`}</p>
        <p className="text-cyan-300">{`Usage: ${data.usageKWh.toFixed(3)} kWh`}</p>
        <p className="text-amber-300">{`Cost: ${data.cost.toFixed(2)} lei`}</p>
        <p className="capitalize" style={{ color: PRICE_TIER_COLORS[data.priceTier] }}>
            {`Tariff: ${data.priceTier}`}
        </p>
      </div>
    );
  }
  return null;
};


const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
            data={data}
            margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            interval={7} // Show a tick every ~2 hours
            />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(3) : value}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft', offset: -5, fill: '#9ca3af', style: { textAnchor: 'middle' } }}
            />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area 
            dataKey="usageKWh" 
            stroke="transparent" 
            fill="url(#colorUsage)"
            isAnimationActive={true}
          />
          <Line 
            dataKey="usageKWh" 
            stroke="#22d3ee" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6, fill: '#22d3ee', stroke: '#111827', strokeWidth: 2 }} 
            isAnimationActive={true}
            />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
