import React from 'react';
import { PriceTier } from '../types';

const PriceTierLegend: React.FC = () => {
    const tiers = [
        { tier: PriceTier.LOW, label: 'Low Tariff (00-06)', color: 'bg-emerald-500' },
        { tier: PriceTier.NORMAL, label: 'Normal Tariff (11-16)', color: 'bg-amber-400' },
        { tier: PriceTier.HIGH, label: 'High Tariff (06-11, 16-00)', color: 'bg-red-400' },
    ];
    return (
        <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 mt-4 pb-2">
            {tiers.map(({ label, color }) => (
                <div key={label} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${color}`}></div>
                    <span className="text-slate-600 text-sm">{label}</span>
                </div>
            ))}
        </div>
    );
};

export default PriceTierLegend;
