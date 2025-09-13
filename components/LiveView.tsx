import React from 'react';
import { LiveConsumptionData, PriceInfo, PriceTier, HistoricalTotals } from '../types';
import StatCard from './StatCard';
import LiveChart from './LiveChart';

interface LiveViewProps {
    currentPriceInfo: PriceInfo;
    historicalTotals: HistoricalTotals;
    liveData: LiveConsumptionData[];
    currentPower: number;
    simulatedKWh: number;
    simulatedCost: number;
}

const LiveView: React.FC<LiveViewProps> = ({ 
    currentPriceInfo, 
    historicalTotals,
    liveData,
    currentPower,
    simulatedKWh,
    simulatedCost
}) => {
    const unit = currentPower >= 1000 ? 'kW' : 'W';
    const displayValue = currentPower >= 1000 ? (currentPower / 1000).toFixed(2) : currentPower.toFixed(0);

    const powerColorClass = currentPower > 2500 ? 'text-red-500' : currentPower > 1000 ? 'text-amber-500' : 'text-emerald-500';

    const priceColorClass = {
        [PriceTier.LOW]: 'text-emerald-500',
        [PriceTier.NORMAL]: 'text-amber-500',
        [PriceTier.HIGH]: 'text-red-500',
    }[currentPriceInfo.tier];

    const grandTotalKWh = historicalTotals.totalKWh + simulatedKWh;
    const grandTotalCost = historicalTotals.totalCost + simulatedCost;


    return (
        <div className="mt-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 <StatCard
                    title="Current Power Draw"
                    value={displayValue}
                    unit={unit}
                    valueColorClass={powerColorClass}
                    context="Updated every 2.5 seconds"
                />
                 <StatCard
                    title="Current Price"
                    value={currentPriceInfo.price.toFixed(2)}
                    unit="lei/kWh"
                    valueColorClass={priceColorClass}
                />
                <StatCard
                    title="Total Usage"
                    value={grandTotalKWh.toFixed(2)}
                    unit="kWh"
                    context="Since 02.06.2025"
                />
                <StatCard
                    title="Total Cost"
                    value={grandTotalCost.toFixed(2)}
                    unit="lei"
                    context="Since 02.06.2025"
                />
            </div>
            <div className="max-w-6xl mx-auto">
                <LiveChart data={liveData} />
            </div>
        </div>
    );
};

export default LiveView;