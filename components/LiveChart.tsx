import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LiveConsumptionData } from '../types';

interface LiveChartProps {
  data: LiveConsumptionData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as LiveConsumptionData;
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-slate-300 shadow-lg">
        <p className="font-bold text-slate-800">{`Time: ${label}`}</p>
        <p className="text-emerald-600">{`Power: ${data.powerW.toFixed(0)} W`}</p>
      </div>
    );
  }
  return null;
};


const LiveChart: React.FC<LiveChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 aspect-[4/3] md:aspect-[16/9]">
        {data.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
                >
                <defs>
                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    />
                <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 12 }} 
                    domain={[0, 'dataMax + 200']}
                    tickCount={6}
                    tickFormatter={(value) => typeof value === 'number' ? value.toFixed(0) : value}
                    label={{ value: 'Watts', position: 'top', dy: -15, fill: '#94a3b8', style: { fontSize: '12px' } }}
                    />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area 
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="powerW"
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorPower)"
                    dot={false}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }} 
                />
                </AreaChart>
            </ResponsiveContainer>
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500 font-medium">Waiting for live data...</p>
                    <p className="text-slate-400 text-sm mt-1">The simulation will begin shortly.</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default LiveChart;
