
export interface ChartPoint {
  time: string;
  price?: number;
  predictedPrice?: number;
}

export interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  history: ChartPoint[];
}

export interface PredictionResult {
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  reasoning: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  keyFactors: string[];
  sources?: Array<{ title: string; uri: string }>;
  expectedRoi: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  source: string;
  impact: 'positive' | 'negative' | 'neutral';
}
