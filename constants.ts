
import { StockData } from './types';

export const NSE_STOCKS: Partial<StockData>[] = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd' },
  { symbol: 'INFY', companyName: 'Infosys Ltd' },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd' },
  { symbol: 'HINDUNILVR', companyName: 'Hindustan Unilever Ltd' },
  { symbol: 'SBIN', companyName: 'State Bank of India' },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Ltd' },
  { symbol: 'ITC', companyName: 'ITC Ltd' },
  { symbol: 'KOTAKBANK', companyName: 'Kotak Mahindra Bank Ltd' },
];

export const MOCK_CHART_DATA = (basePrice: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15}`,
    price: basePrice + (Math.random() - 0.5) * (basePrice * 0.02)
  }));
};
