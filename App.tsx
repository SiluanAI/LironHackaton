import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import StatCard from './components/StatCard';
import ChartCarousel from './components/ChartCarousel';
import { RAW_CONSUMPTION_DATA, BASE_PRICE_PER_KWH, PRICE_COEFFICIENTS } from './constants';
import { PriceTier, ProcessedConsumptionData, RawConsumptionRecord, PriceInfo } from './types';

const PriceTierLegend: React.FC = () => {
    const tiers = [
        { tier: PriceTier.LOW, label: 'Low Tariff (00-06)', color: 'bg-emerald-500' },
        { tier: PriceTier.NORMAL, label: 'Normal Tariff (11-16)', color: 'bg-amber-400' },
        { tier: PriceTier.HIGH, label: 'High Tariff (06-11, 16-00)', color: 'bg-red-400' },
    ];
    return (
        <div className="flex justify-center items-center space-x-6 mt-4 pb-2">
            {tiers.map(({ label, color }) => (
                <div key={label} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${color}`}></div>
                    <span className="text-gray-300 text-sm">{label}</span>
                </div>
            ))}
        </div>
    );
};


const App: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [currentPriceInfo, setCurrentPriceInfo] = useState<PriceInfo>({ price: 0, tier: PriceTier.NORMAL });

    const availableDates = useMemo(() => {
        const dates = new Set(RAW_CONSUMPTION_DATA.map(d => d.timestamp.split(' ')[0]));
        return Array.from(dates);
    }, []);

    useEffect(() => {
        if (availableDates.length > 0) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates]);

    const getPriceInfoForHour = (hour: number): PriceInfo => {
        if (hour >= 0 && hour < 6) {
            return { price: BASE_PRICE_PER_KWH * PRICE_COEFFICIENTS.low, tier: PriceTier.LOW };
        } else if ((hour >= 6 && hour < 11) || (hour >= 16 && hour < 24)) {
            return { price: BASE_PRICE_PER_KWH * PRICE_COEFFICIENTS.high, tier: PriceTier.HIGH };
        } else { // 11:00 - 15:59
            return { price: BASE_PRICE_PER_KWH * PRICE_COEFFICIENTS.normal, tier: PriceTier.NORMAL };
        }
    };

    const processedData = useMemo<ProcessedConsumptionData[]>(() => {
        if (!selectedDate) return [];
        
        const dayData = RAW_CONSUMPTION_DATA.filter(d => d.timestamp.startsWith(selectedDate));
        if (dayData.length === 0) return [];

        const firstRecordOfDayIndex = RAW_CONSUMPTION_DATA.findIndex(d => d.timestamp === dayData[0].timestamp);
        
        const recordsForProcessing: RawConsumptionRecord[] = [];
        if (firstRecordOfDayIndex > 0) {
            recordsForProcessing.push(RAW_CONSUMPTION_DATA[firstRecordOfDayIndex - 1]);
        }
        recordsForProcessing.push(...dayData);

        if (recordsForProcessing.length < 2) return [];

        return recordsForProcessing.slice(1).map((record, index) => {
            const prevRecord = recordsForProcessing[index];
            const usageWh = record.cumulativeWh - prevRecord.cumulativeWh;
            const usageKWh = usageWh / 1000;

            const timeLabel = record.timestamp.split(' ')[1];
            const hour = parseInt(timeLabel.split(':')[0], 10);
            
            const { price, tier } = getPriceInfoForHour(hour);
            const cost = usageKWh * price;
            
            return {
                time: timeLabel,
                usageKWh: usageKWh,
                cost: cost,
                priceTier: tier,
            };
        });
    }, [selectedDate]);

    useEffect(() => {
        const updateCurrentPrice = () => {
            const currentHour = new Date().getHours();
            setCurrentPriceInfo(getPriceInfoForHour(currentHour));
        };
        
        updateCurrentPrice();
        const interval = setInterval(updateCurrentPrice, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const dailyStats = useMemo(() => {
        if (processedData.length === 0) {
            return { totalKWh: '0.00', totalCost: '0.00', peakUsage: '0.000' };
        }
        const totalKWh = processedData.reduce((acc, curr) => acc + curr.usageKWh, 0);
        const totalCost = processedData.reduce((acc, curr) => acc + curr.cost, 0);
        const peakUsage = Math.max(...processedData.map(d => d.usageKWh), 0);
        
        return {
            totalKWh: totalKWh.toFixed(2),
            totalCost: totalCost.toFixed(2),
            peakUsage: peakUsage.toFixed(3),
        };
    }, [processedData]);

    const currentPriceColor = {
        [PriceTier.LOW]: 'bg-emerald-500/30 text-emerald-300',
        [PriceTier.NORMAL]: 'bg-amber-500/30 text-amber-300',
        [PriceTier.HIGH]: 'bg-red-500/30 text-red-300',
    }[currentPriceInfo.tier];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
             <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" style={{backgroundImage: 'url(https://picsum.photos/seed/energy/1920/1080)'}}></div>
            <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <Header />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                        title="Current Price"
                        value={currentPriceInfo.price.toFixed(2)}
                        unit="lei/kWh"
                        colorClass={currentPriceColor}
                    />
                     <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        title="Total Daily Usage"
                        value={dailyStats.totalKWh}
                        unit="kWh"
                        colorClass="bg-cyan-500/30 text-cyan-300"
                    />
                     <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                        title="Peak Usage (15 min)"
                        value={dailyStats.peakUsage}
                        unit="kWh"
                        colorClass="bg-indigo-500/30 text-indigo-300"

                    />
                    <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        title="Estimated Daily Cost"
                        value={dailyStats.totalCost}
                        unit="lei"
                        colorClass="bg-pink-500/30 text-pink-300"
                    />
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-8 mb-2">
                    <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">Consumption for {selectedDate}</h2>
                    <div className="flex items-center">
                        <label htmlFor="date-select" className="text-sm font-medium text-gray-400 mr-2">Select Date:</label>
                        <select 
                        id="date-select" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                        >
                        {availableDates.map(date => <option key={date} value={date}>{date}</option>)}
                        </select>
                    </div>
                </div>

                 <PriceTierLegend />
                <ChartCarousel data={processedData} />
            </main>
        </div>
    );
};

export default App;
