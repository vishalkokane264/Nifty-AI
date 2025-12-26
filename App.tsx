
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StockData, MarketIndex, PredictionResult } from './types';
import { marketService } from './services/marketService';
import { getStockPrediction } from './services/geminiService';
import Sidebar from './components/Sidebar';
import StockChart from './components/StockChart';
import PredictorCard from './components/PredictorCard';

const App: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    marketService.start();
    marketService.subscribe((data) => setStocks(data));
    marketService.subscribeIndices((data) => setIndices(data));
    return () => marketService.stop();
  }, []);

  const selectedStock = useMemo(() => 
    stocks.find(s => s.symbol === selectedSymbol) || null
  , [stocks, selectedSymbol]);

  const handlePredict = useCallback(async () => {
    if (!selectedStock) return;
    setIsPredicting(true);
    try {
      const res = await getStockPrediction(selectedStock);
      setPrediction(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPredicting(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    setPrediction(null);
  }, [selectedSymbol]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-brand-dark transition-colors duration-500">
      <Sidebar />

      <main className="flex-1 lg:ml-64 flex flex-col h-full relative overflow-y-auto no-scrollbar">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 lg:px-10 bg-gray-50/80 dark:bg-brand-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-brand-border">
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar">
            {indices.map(idx => (
              <div key={idx.name} className="flex-shrink-0 flex items-center space-x-4 bg-white dark:bg-brand-card px-5 py-3 rounded-2xl border border-gray-100 dark:border-brand-border shadow-sm hover:shadow-md transition-all cursor-default">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{idx.name}</span>
                <span className="mono text-sm font-bold text-gray-900 dark:text-white">{idx.value.toLocaleString('en-IN')}</span>
                <span className={`text-[11px] font-bold ${idx.change >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent)}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-end space-x-4">
             <button 
              onClick={toggleTheme}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-brand-card text-gray-400 dark:text-brand-primary border border-gray-100 dark:border-brand-border hover:border-brand-primary/50 transition-all shadow-sm active:scale-90"
              title="Toggle Theme"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
            <div className="flex items-center space-x-3 px-5 py-3 bg-brand-success/10 text-brand-success rounded-2xl border border-brand-success/20">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-success"></span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">Live Market</span>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Main Content Area */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-8 space-y-8">
              {selectedStock && (
                <div className="bg-white dark:bg-brand-card rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 dark:border-brand-border shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group">
                  {/* Decorative background element */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded text-[9px] font-black tracking-tighter uppercase">NSE : EQUITY</span>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                          {selectedStock.symbol}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{selectedStock.companyName}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="mono text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹{selectedStock.price.toLocaleString('en-IN')}</p>
                      <div className={`flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-xs font-bold ${selectedStock.change >= 0 ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                        {selectedStock.change >= 0 ? '▲' : '▼'} {Math.abs(selectedStock.change).toFixed(2)} ({Math.abs(selectedStock.changePercent).toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 my-6 border-y border-gray-100 dark:border-brand-border relative z-10">
                    {[
                      { label: 'Vol (24h)', val: selectedStock.volume.toLocaleString() },
                      { label: 'High', val: `₹${selectedStock.high.toLocaleString('en-IN')}` },
                      { label: 'Low', val: `₹${selectedStock.low.toLocaleString('en-IN')}` }
                    ].map((stat, i) => (
                      <div key={i}>
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2">{stat.label}</p>
                        <p className="mono text-base font-bold text-gray-900 dark:text-white">{stat.val}</p>
                      </div>
                    ))}
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={handlePredict}
                        disabled={isPredicting}
                        className="group w-full md:w-auto px-8 py-4 bg-brand-primary hover:bg-yellow-400 disabled:bg-gray-200 dark:disabled:bg-brand-border disabled:text-gray-400 text-brand-dark text-[11px] font-black rounded-2xl transition-all shadow-xl shadow-brand-primary/30 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                      >
                        {isPredicting ? <i className="fas fa-circle-notch animate-spin text-sm"></i> : <i className="fas fa-magic text-sm group-hover:animate-bounce"></i>}
                        {isPredicting ? 'Analyzing' : 'AI Prediction'}
                      </button>
                    </div>
                  </div>

                  <StockChart stock={selectedStock} prediction={prediction} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PredictorCard prediction={prediction} loading={isPredicting} />
                
                <div className="bg-white dark:bg-brand-card rounded-[2rem] p-8 border border-gray-100 dark:border-brand-border shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">NSE Intelligence</h3>
                     <span className="animate-pulse w-2 h-2 rounded-full bg-brand-primary"></span>
                  </div>
                  <div className="space-y-6">
                    {[
                      { title: 'Global Market Sentiment', desc: 'Fed rate signals impacting IT stocks exports.', impact: 'neutral', icon: 'fa-globe' },
                      { title: 'Automotive Sector Boom', desc: 'New policy boosts EV manufacturing stocks.', impact: 'positive', icon: 'fa-car-side' }
                    ].map((news, i) => (
                      <div key={i} className="flex items-start space-x-5 p-5 bg-gray-50 dark:bg-brand-dark rounded-3xl border border-gray-100 dark:border-brand-border hover:scale-[1.02] transition-all cursor-pointer">
                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl ${news.impact === 'positive' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-primary/10 text-brand-primary'}`}>
                          <i className={`fas ${news.icon} text-lg`}></i>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 dark:text-white mb-1 uppercase tracking-wider">{news.title}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{news.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Watchlist Section */}
            <div className="col-span-12 xl:col-span-4 flex flex-col h-full max-h-[1200px]">
              <div className="bg-white dark:bg-brand-card rounded-[2rem] border border-gray-100 dark:border-brand-border flex flex-col h-full overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 dark:border-brand-border">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Equity Watchlist</h3>
                  <div className="relative">
                    <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input 
                      type="text" 
                      placeholder="FILTER SYMBOLS..." 
                      className="w-full bg-gray-50 dark:bg-brand-input border border-gray-100 dark:border-brand-border rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {stocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedSymbol(stock.symbol)}
                      className={`w-full flex items-center justify-between p-6 border-b border-gray-50 dark:border-brand-border transition-all hover:bg-gray-50 dark:hover:bg-brand-input group relative ${
                        selectedSymbol === stock.symbol ? 'bg-brand-primary/5 dark:bg-brand-input' : ''
                      }`}
                    >
                      {selectedSymbol === stock.symbol && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-brand-primary rounded-r-full"></div>
                      )}
                      <div className="flex items-center space-x-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                          selectedSymbol === stock.symbol ? 'bg-brand-primary text-brand-dark' : 'bg-gray-100 dark:bg-brand-dark text-gray-400 group-hover:bg-brand-primary group-hover:text-brand-dark'
                        }`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter uppercase">{stock.symbol}</p>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest truncate w-24">{stock.companyName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="mono text-sm font-bold text-gray-900 dark:text-white">₹{stock.price.toLocaleString('en-IN')}</p>
                        <p className={`text-[10px] font-black ${stock.change >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                          {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="p-6 bg-gray-50/50 dark:bg-brand-input/30 text-center">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    Updates every 5 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
