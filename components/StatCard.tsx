import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  valueColorClass?: string;
  context?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, valueColorClass = 'text-slate-800', context }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 transition-all duration-300 hover:border-blue-300 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="flex items-baseline space-x-1.5 mt-1">
        <p className={`text-3xl font-bold ${valueColorClass}`}>{value}</p>
        <span className="text-sm text-slate-500 font-medium">{unit}</span>
      </div>
      {context && (
        <p className="text-xs text-slate-400 font-medium mt-1 truncate">
          {context}
        </p>
      )}
    </div>
  );
};

export default StatCard;