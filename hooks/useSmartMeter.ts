import { useState, useEffect, useRef } from 'react';
import { LiveConsumptionData } from '../types';

const SIMULATION_INTERVAL_MS = 2500;
const MAX_DATA_POINTS = 24; // Keep the last minute of data (24 * 2.5s = 60s)

// Simple appliance simulation
const APPLIANCES = [
    { name: 'Kettle', powerW: 2000, durationTicks: 2, probability: 0.02 },
    { name: 'Microwave', powerW: 1200, durationTicks: 3, probability: 0.03 },
    { name: 'Oven', powerW: 3500, durationTicks: 10, probability: 0.01 },
    { name: 'TV', powerW: 150, durationTicks: 120, probability: 0.05 },
];

interface ActiveAppliance {
    name: string;
    powerW: number;
    ticksRemaining: number;
}

export const useSmartMeter = (currentPricePerKWh: number) => {
    const [liveData, setLiveData] = useState<LiveConsumptionData[]>([]);
    const [currentPower, setCurrentPower] = useState<number>(0);
    const [simulatedKWh, setSimulatedKWh] = useState(0);
    const [simulatedCost, setSimulatedCost] = useState(0);

    const activeAppliancesRef = useRef<ActiveAppliance[]>([]);
    const priceRef = useRef(currentPricePerKWh);

    useEffect(() => {
        priceRef.current = currentPricePerKWh;
    }, [currentPricePerKWh]);

    useEffect(() => {
        const baseLoadW = 150 + Math.random() * 50; // Base load for fridge, router, etc.

        const intervalId = setInterval(() => {
            // Update and filter out finished appliances
            activeAppliancesRef.current = activeAppliancesRef.current
                .map(app => ({ ...app, ticksRemaining: app.ticksRemaining - 1 }))
                .filter(app => app.ticksRemaining > 0);

            // Check if new appliances should turn on
            APPLIANCES.forEach(app => {
                const isAlreadyActive = activeAppliancesRef.current.some(active => active.name === app.name);
                if (!isAlreadyActive && Math.random() < app.probability) {
                    activeAppliancesRef.current.push({
                        name: app.name,
                        powerW: app.powerW,
                        ticksRemaining: app.durationTicks,
                    });
                }
            });

            // Calculate total power
            const appliancesPower = activeAppliancesRef.current.reduce((sum, app) => sum + app.powerW, 0);
            const totalPower = baseLoadW + appliancesPower + (Math.random() - 0.5) * 20; // Add small random fluctuation

            const now = new Date();
            const newPoint: LiveConsumptionData = {
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                powerW: Math.max(0, totalPower), // Ensure power is not negative
            };

            // Calculate energy and cost for this interval
            const intervalHours = SIMULATION_INTERVAL_MS / (1000 * 3600);
            const intervalKWh = (newPoint.powerW / 1000) * intervalHours;
            const intervalCost = intervalKWh * priceRef.current;

            setSimulatedKWh(prev => prev + intervalKWh);
            setSimulatedCost(prev => prev + intervalCost);

            setCurrentPower(newPoint.powerW);
            setLiveData(prevData => {
                const updatedData = [...prevData, newPoint];
                if (updatedData.length > MAX_DATA_POINTS) {
                    return updatedData.slice(updatedData.length - MAX_DATA_POINTS);
                }
                return updatedData;
            });

        }, SIMULATION_INTERVAL_MS);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return { liveData, currentPower, simulatedKWh, simulatedCost };
};
