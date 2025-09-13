
export interface RawConsumptionRecord {
  timestamp: string;
  cumulativeWh: number;
}

export interface ProcessedConsumptionData {
  time: string;
  usageKWh: number;
  cost: number;
  priceTier: PriceTier;
}

export enum PriceTier {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export interface PriceInfo {
    price: number;
    tier: PriceTier;
}

export interface LiveConsumptionData {
  time: string;
  powerW: number;
}

export interface HistoricalTotals {
    totalKWh: number;
    totalCost: number;
}
