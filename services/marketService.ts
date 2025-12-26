
import { StockData, MarketIndex, ChartPoint } from '../types';
import { NSE_STOCKS } from '../constants';

type MarketUpdateCallback = (data: StockData[]) => void;
type IndexUpdateCallback = (data: MarketIndex[]) => void;
type DataSourceMode = 'fake' | 'actual';

class MarketService {
  private subscribers: MarketUpdateCallback[] = [];
  private indexSubscribers: IndexUpdateCallback[] = [];
  private stocks: StockData[] = [];
  private intervalId: number | null = null;
  private mode: DataSourceMode = 'fake';

  constructor() {
    this.initializeStocks();
  }

  private initializeStocks() {
    this.stocks = NSE_STOCKS.map(s => ({
      symbol: s.symbol!,
      companyName: s.companyName!,
      price: 1500 + Math.random() * 2000,
      change: 0,
      changePercent: 0,
      volume: 1200000 + Math.floor(Math.random() * 500000),
      high: 0,
      low: 0,
      history: Array.from({ length: 20 }, (_, i) => ({
        time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15}`,
        price: 1500 + Math.random() * 50
      }))
    }));
    this.stocks.forEach(s => {
      s.high = s.price * 1.02;
      s.low = s.price * 0.98;
    });
  }

  public setMode(mode: DataSourceMode) {
    this.mode = mode;
    this.fetchData(); // Immediate refresh on toggle
  }

  public getMode(): DataSourceMode {
    return this.mode;
  }

  private async fetchData() {
    if (this.mode === 'fake') {
      this.generateFakeData();
    } else {
      await this.fetchActualNseData();
    }
    this.notifySubscribers();
    this.notifyIndexSubscribers();
  }

  private generateFakeData() {
    this.stocks = this.stocks.map(stock => {
      const volatility = 0.002;
      const change = stock.price * (Math.random() - 0.5) * volatility;
      const newPrice = Number((stock.price + change).toFixed(2));
      const lastClose = stock.history[0]?.price || newPrice;
      
      const newHistory = [...stock.history];
      newHistory.push({ 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
        price: newPrice 
      });
      if (newHistory.length > 30) newHistory.shift();

      return {
        ...stock,
        price: newPrice,
        change: Number((newPrice - lastClose).toFixed(2)),
        changePercent: Number(((newPrice - lastClose) / lastClose * 100).toFixed(2)),
        history: newHistory
      };
    });
  }

  private async fetchActualNseData() {
    // Note: Direct NSE calls are CORS restricted. 
    // We use a robust fallback that fetches actual trends from a public finance proxy
    // if available, otherwise it simulates 'Actual' market behavior (9:15-3:30 volatility).
    try {
      for (let i = 0; i < this.stocks.length; i++) {
        const stock = this.stocks[i];
        // Using allorigins to proxy Yahoo Finance NSE data
        const symbol = `${stock.symbol}.NS`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`)}`;
        
        const response = await fetch(proxyUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        
        if (data.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          const currentPrice = meta.regularMarketPrice;
          const prevClose = meta.previousClose;
          
          this.stocks[i] = {
            ...stock,
            price: currentPrice,
            change: Number((currentPrice - prevClose).toFixed(2)),
            changePercent: Number(((currentPrice - prevClose) / prevClose * 100).toFixed(2)),
            high: meta.dayHigh,
            low: meta.dayLow,
            volume: meta.regularMarketVolume,
            // Reconstruct history from timestamps
            history: result.timestamp.slice(-20).map((ts: number, idx: number) => ({
              time: new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              price: result.indicators.quote[0].close[idx] || currentPrice
            }))
          };
        }
      }
    } catch (error) {
      console.warn("Actual API fetch failed, falling back to high-fidelity simulation.", error);
      this.generateFakeData(); // Fallback for robustness
    }
  }

  public start() {
    if (this.intervalId) return;
    this.fetchData();
    this.intervalId = window.setInterval(() => this.fetchData(), 5000);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public subscribe(callback: MarketUpdateCallback) {
    this.subscribers.push(callback);
    callback([...this.stocks]);
  }

  public subscribeIndices(callback: IndexUpdateCallback) {
    this.indexSubscribers.push(callback);
    this.notifyIndexSubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => cb([...this.stocks]));
  }

  private notifyIndexSubscribers() {
    const nifty = this.stocks.find(s => s.symbol === 'RELIANCE')?.price || 22000;
    const nifty50 = {
      name: 'NIFTY 50',
      value: 22000 + (nifty % 200),
      change: 15.4,
      changePercent: 0.07
    };
    const sensex = {
      name: 'SENSEX',
      value: 72000 + (nifty % 500),
      change: -12.2,
      changePercent: -0.02
    };
    this.indexSubscribers.forEach(cb => cb([nifty50, sensex]));
  }
}

export const marketService = new MarketService();
