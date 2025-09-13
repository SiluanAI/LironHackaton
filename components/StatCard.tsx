
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, unit, colorClass }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 flex items-center space-x-4 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/70">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-semibold text-white">{value}</p>
            <span className="text-sm text-gray-300">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
