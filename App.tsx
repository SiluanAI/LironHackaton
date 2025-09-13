import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import StatCard from './components/StatCard';
import UsageChart from './components/UsageChart';
import ChartCarousel from './components/ChartCarousel';
import ViewModeSwitcher from './components/ViewModeSwitcher';
import PriceTierLegend from './components/PriceTierLegend';
import LiveView from './components/LiveView';
import { useSmartMeter } from './hooks/useSmartMeter';
import { RAW_CONSUMPTION_DATA, BASE_PRICE_PER_KWH, PRICE_COEFFICIENTS } from './constants';
import { PriceTier, ProcessedConsumptionData, RawConsumptionRecord, PriceInfo } from './types';

type ViewMode = 'daily' | 'weekly' | 'live';

const getPriceInfoForHour = (hour: number): PriceInfo => {
    if (hour >= 0 && hour < 6) {
        return { price: BASE_PRICE_PER_KWH * PRICE_COEFFICIENTS.low, tier: PriceTier.LOW };
    } else if ((hour >= 6 && hour < 11) || (hour >= 16 && hour < 24)) {
        return { price: BASE_PRICE_PER_KWH * PRICE_COEFFICIENTS.high, tier: PriceTier.HIGH };
    } else { // 11:00 - 15:59
        return { price: BASE_PRICE_PER_KWH * PRICE_COEFFICIENTS.normal, tier: PriceTier.NORMAL };
    }
};

const App: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('live');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [currentPriceInfo, setCurrentPriceInfo] = useState<PriceInfo>({ price: 0, tier: PriceTier.NORMAL });

    const { liveData, currentPower, simulatedKWh, simulatedCost } = useSmartMeter(currentPriceInfo.price);

    const availableDates = useMemo(() => {
        const dates = new Set(RAW_CONSUMPTION_DATA.map(d => d.timestamp.split(' ')[0]));
        return Array.from(dates);
    }, []);

    useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

    const dailyChartData = useMemo<ProcessedConsumptionData[]>(() => {
        if (!selectedDate || viewMode !== 'daily') return [];
        
        const dayData = RAW_CONSUMPTION_DATA.filter(d => d.timestamp.startsWith(selectedDate));
        if (dayData.length === 0) return [];

        const firstRecordOfDayIndex = RAW_CONSUMPTION_DATA.findIndex(d => d.timestamp === dayData[0].timestamp);
        
        const recordsForProcessing: RawConsumptionRecord[] = [];
        if (firstRecordOfDayIndex > 0) {
            recordsForProcessing.push(RAW_CONSUMPTION_DATA[firstRecordOfDayIndex - 1]);
        }
        recordsForProcessing.push(...dayData);

        if (recordsForProcessing.length < 2) return [];

        const fifteenMinuteData = recordsForProcessing.slice(1).map((record, index) => {
            const prevRecord = recordsForProcessing[index];
            const usageWh = record.cumulativeWh - prevRecord.cumulativeWh;
            const usageKWh = usageWh / 1000;

            const timeLabel = record.timestamp.split(' ')[1];
            
            return {
                time: timeLabel,
                usageKWh: usageKWh,
            };
        });

        // Aggregate into hourly data
        const hourlyData: { [hour: string]: ProcessedConsumptionData } = {};

        fifteenMinuteData.forEach(d => {
            const hour = d.time.substring(0, 2);
            const hourLabel = `${hour}:00`;

            if (!hourlyData[hourLabel]) {
                const hourInt = parseInt(hour, 10);
                const { tier } = getPriceInfoForHour(hourInt);
                hourlyData[hourLabel] = {
                    time: hourLabel,
                    usageKWh: 0,
                    cost: 0,
                    priceTier: tier,
                };
            }
            const hourInt = parseInt(hour, 10);
            const { price } = getPriceInfoForHour(hourInt);

            hourlyData[hourLabel].usageKWh += d.usageKWh;
            hourlyData[hourLabel].cost += d.usageKWh * price;
        });

        return Object.values(hourlyData).sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedDate, viewMode]);

    const weeklyChartData = useMemo(() => {
        if (RAW_CONSUMPTION_DATA.length < 2 || viewMode !== 'weekly') return [];

        const intervalData = [];
        for (let i = 1; i < RAW_CONSUMPTION_DATA.length; i++) {
            const current = RAW_CONSUMPTION_DATA[i];
            const prev = RAW_CONSUMPTION_DATA[i - 1];
            
            const usageWh = current.cumulativeWh - prev.cumulativeWh;
            const usageKWh = usageWh / 1000;
            
            const [date, time] = current.timestamp.split(' ');
            const hour = parseInt(time.substring(0, 2), 10);
            const { price } = getPriceInfoForHour(hour);
            const cost = usageKWh * price;
            
            intervalData.push({ date, usageKWh, cost });
        }

        const dailyAggregates: { [date: string]: { usageKWh: number, cost: number } } = {};
        intervalData.forEach(item => {
            if (!dailyAggregates[item.date]) {
                dailyAggregates[item.date] = { usageKWh: 0, cost: 0 };
            }
            dailyAggregates[item.date].usageKWh += item.usageKWh;
            dailyAggregates[item.date].cost += item.cost;
        });

        return Object.entries(dailyAggregates).map(([date, totals]) => ({
            day: date.substring(0, 5), // Format as DD.MM
            usageKWh: totals.usageKWh,
            cost: totals.cost
        })).sort((a,b) => a.day.localeCompare(b.day));
    }, [viewMode]);

    const historicalTotals = useMemo(() => {
        if (RAW_CONSUMPTION_DATA.length < 2) {
            return { totalKWh: 0, totalCost: 0 };
        }

        let totalKWh = 0;
        let totalCost = 0;

        for (let i = 1; i < RAW_CONSUMPTION_DATA.length; i++) {
            const currentRecord = RAW_CONSUMPTION_DATA[i];
            const prevRecord = RAW_CONSUMPTION_DATA[i - 1];

            const usageWh = currentRecord.cumulativeWh - prevRecord.cumulativeWh;
            const usageKWh = usageWh / 1000;
            
            const [, time] = currentRecord.timestamp.split(' ');
            const hour = parseInt(time.substring(0, 2), 10);
            const { price } = getPriceInfoForHour(hour);
            const cost = usageKWh * price;
            
            totalKWh += usageKWh;
            totalCost += cost;
        }
        
        return {
            totalKWh,
            totalCost,
        };
    }, []);

    useEffect(() => {
        const updateCurrentPrice = () => {
            const currentHour = new Date().getHours();
            setCurrentPriceInfo(getPriceInfoForHour(currentHour));
        };
        
        updateCurrentPrice();
        const interval = setInterval(updateCurrentPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    const dailyStats = useMemo(() => {
        if (dailyChartData.length === 0) {
            return { totalKWh: '0.00', totalCost: '0.00', peakUsage: '0.000', peakUsageTime: '' };
        }
        const totalKWh = dailyChartData.reduce((acc, curr) => acc + curr.usageKWh, 0);
        const totalCost = dailyChartData.reduce((acc, curr) => acc + curr.cost, 0);
        
        const peakData = dailyChartData.reduce((peak, current) => {
            return current.usageKWh > peak.usageKWh ? current : peak;
        }, dailyChartData[0]);
        
        return {
            totalKWh: totalKWh.toFixed(2),
            totalCost: totalCost.toFixed(2),
            peakUsage: peakData.usageKWh.toFixed(3),
            peakUsageTime: `at ${peakData.time}`,
        };
    }, [dailyChartData]);

    const weeklyStats = useMemo(() => {
        if (RAW_CONSUMPTION_DATA.length < 2) {
            return { totalKWh: '0.00', totalCost: '0.00', peakUsage: '0.00', peakUsageDate: '', avgDailyKWh: '0.00', avgDailyCost: '0.00' };
        }

        let totalKWh = 0;
        let totalCost = 0;
        const intervalData = [];

        for (let i = 1; i < RAW_CONSUMPTION_DATA.length; i++) {
            const currentRecord = RAW_CONSUMPTION_DATA[i];
            const prevRecord = RAW_CONSUMPTION_DATA[i - 1];

            const usageWh = currentRecord.cumulativeWh - prevRecord.cumulativeWh;
            const usageKWh = usageWh / 1000;
            
            const [date, time] = currentRecord.timestamp.split(' ');
            const hour = parseInt(time.substring(0, 2), 10);
            const { price } = getPriceInfoForHour(hour);
            const cost = usageKWh * price;
            
            totalKWh += usageKWh;
            totalCost += cost;
            intervalData.push({ date, usageKWh });
        }
        
        const dailyAggregates: { [date: string]: { usageKWh: number } } = {};
        intervalData.forEach(item => {
            if (!dailyAggregates[item.date]) {
                dailyAggregates[item.date] = { usageKWh: 0 };
            }
            dailyAggregates[item.date].usageKWh += item.usageKWh;
        });

        const peakEntry = Object.entries(dailyAggregates).reduce((peak, current) => {
            return current[1].usageKWh > peak[1].usageKWh ? current : peak;
        }, ['', { usageKWh: 0 }] as [string, { usageKWh: number }]);

        const peakUsage = peakEntry[1].usageKWh;
        const peakUsageDate = peakEntry[0];

        const uniqueDays = new Set(intervalData.map(d => d.date));
        const numDays = uniqueDays.size > 0 ? uniqueDays.size : 1;

        const avgDailyKWh = totalKWh / numDays;
        const avgDailyCost = totalCost / numDays;
        
        return {
            totalKWh: totalKWh.toFixed(2),
            totalCost: totalCost.toFixed(2),
            peakUsage: peakUsage.toFixed(2),
            peakUsageDate: peakUsageDate ? `on ${peakUsageDate}` : '',
            avgDailyKWh: avgDailyKWh.toFixed(2),
            avgDailyCost: avgDailyCost.toFixed(2),
        };
    }, []);

    const handleViewChange = (newMode: ViewMode) => {
        if (newMode === 'daily' && !selectedDate && availableDates.length > 0) {
            setSelectedDate(availableDates[0]);
        }
        setViewMode(newMode);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
            <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <Header />
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-8 mb-2">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 sm:mb-0 capitalize">
                        {viewMode} View
                    </h2>
                    <div className="flex items-center space-x-4">
                        <ViewModeSwitcher viewMode={viewMode} setViewMode={handleViewChange} />
                        {viewMode === 'daily' && (
                             <select 
                                id="date-select" 
                                value={selectedDate} 
                                onChange={e => setSelectedDate(e.target.value)}
                                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                aria-label="Select Date"
                             >
                                {availableDates.map(date => <option key={date} value={date}>{date}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {viewMode === 'live' ? (
                    <LiveView 
                        currentPriceInfo={currentPriceInfo} 
                        historicalTotals={historicalTotals}
                        liveData={liveData}
                        currentPower={currentPower}
                        simulatedKWh={simulatedKWh}
                        simulatedCost={simulatedCost}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {viewMode === 'daily' && (
                                <>
                                    <StatCard
                                        title="Total Daily Usage"
                                        value={dailyStats.totalKWh}
                                        unit="kWh"
                                    />
                                    <StatCard
                                        title="Estimated Daily Cost"
                                        value={dailyStats.totalCost}
                                        unit="lei"
                                    />
                                    <StatCard
                                        title="Peak Hourly Usage"
                                        value={dailyStats.peakUsage}
                                        unit="kWh"
                                        context={dailyStats.peakUsageTime}
                                    />
                                </>
                            )}
                            
                            {viewMode === 'weekly' && (
                                <>
                                    <StatCard
                                        title="Total Weekly Usage"
                                        value={weeklyStats.totalKWh}
                                        unit="kWh"
                                    />
                                    <StatCard
                                        title="Estimated Weekly Cost"
                                        value={weeklyStats.totalCost}
                                        unit="lei"
                                    />
                                    <StatCard
                                        title="Peak Daily Usage"
                                        value={weeklyStats.peakUsage}
                                        unit="kWh"
                                        context={weeklyStats.peakUsageDate}
                                    />
                                </>
                            )}
                        </div>

                        {viewMode === 'daily' && <PriceTierLegend />}

                        {viewMode === 'daily' ? (
                            <ChartCarousel data={dailyChartData} />
                        ) : (
                            <div className="mt-6 mb-12 max-w-6xl mx-auto">
                                <UsageChart 
                                    data={weeklyChartData} 
                                    xAxisDataKey="day"
                                    lineDataKey="usageKWh"
                                    showArea={true}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default App;