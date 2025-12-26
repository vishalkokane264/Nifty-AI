
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
  const [apiMode, setApiMode] = useState<'fake' | 'actual'>('fake');
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

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  
  const toggleApiMode = () => {
    const newMode = apiMode === 'fake' ? 'actual' : 'fake';
    setApiMode(newMode);
    marketService.setMode(newMode);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-brand-dark transition-colors duration-500">
      <Sidebar />

      <main className="flex-1 lg:ml-64 flex flex-col h-full overflow-y-auto no-scrollbar">
        <header className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gray-50/90 dark:bg-brand-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-brand-border">
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar">
            {indices.map(idx => (
              <div key={idx.name} className="flex-shrink-0 flex items-center space-x-4 bg-white dark:bg-brand-card px-5 py-3 rounded-2xl border border-gray-100 dark:border-brand-border shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{idx.name}</span>
                <span className="mono text-sm font-bold text-gray-900 dark:text-white">{idx.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className={`text-[11px] font-bold ${idx.change >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent)}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-end space-x-4">
            {/* API Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-brand-card p-1 rounded-2xl border border-gray-100 dark:border-brand-border shadow-sm">
              <button 
                onClick={toggleApiMode}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${apiMode === 'fake' ? 'bg-gray-100 dark:bg-brand-input text-gray-900 dark:text-white' : 'text-gray-400'}`}
              >
                FAKE API
              </button>
              <button 
                onClick={toggleApiMode}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${apiMode === 'actual' ? 'bg-brand-primary text-brand-dark shadow-lg shadow-brand-primary/20' : 'text-gray-400'}`}
              >
                ACTUAL NSE
              </button>
            </div>

             <button 
              onClick={toggleTheme}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-brand-card text-gray-400 dark:text-brand-primary border border-gray-100 dark:border-brand-border hover:border-brand-primary shadow-sm"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div className="flex items-center space-x-3 px-5 py-3 bg-brand-success/10 text-brand-success rounded-2xl border border-brand-success/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest">
                {apiMode === 'actual' ? 'LIVE' : 'SIM'}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-8 space-y-8">
              {selectedStock ? (
                <div className="bg-white dark:bg-brand-card rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 dark:border-brand-border shadow-xl shadow-gray-200/20 dark:shadow-none">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                      <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-1">
                        {selectedStock.symbol}
                      </h2>
                      <p className="text-sm text-gray-400 font-medium tracking-wide">{selectedStock.companyName}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="mono text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹{selectedStock.price.toLocaleString('en-IN')}</p>
                      <div className={`flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-xs font-bold ${selectedStock.change >= 0 ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                        {selectedStock.change >= 0 ? '▲' : '▼'} {Math.abs(selectedStock.change).toFixed(2)} ({Math.abs(selectedStock.changePercent).toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-100 dark:border-brand-border my-6">
                    {[
                      { label: 'VOL (24H)', val: selectedStock.volume.toLocaleString() },
                      { label: 'HIGH', val: `₹${selectedStock.high.toLocaleString('en-IN')}` },
                      { label: 'LOW', val: `₹${selectedStock.low.toLocaleString('en-IN')}` }
                    ].map((stat, i) => (
                      <div key={i}>
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                        <p className="mono text-base font-bold text-gray-900 dark:text-white">{stat.val}</p>
                      </div>
                    ))}
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={handlePredict}
                        disabled={isPredicting}
                        className="w-full md:w-auto px-8 py-4 bg-brand-primary hover:bg-yellow-400 disabled:bg-gray-200 dark:disabled:bg-brand-border text-brand-dark text-xs font-black rounded-2xl shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isPredicting ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-magic"></i>}
                        {isPredicting ? 'ANALYZING...' : 'AI PREDICT'}
                      </button>
                    </div>
                  </div>

                  <StockChart stock={selectedStock} prediction={prediction} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-white dark:bg-brand-card rounded-[2.5rem] border border-dashed border-gray-200 dark:border-brand-border">
                  <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Initializing Data Stream...</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PredictorCard prediction={prediction} loading={isPredicting} />
                <div className="bg-white dark:bg-brand-card rounded-[2rem] p-8 border border-gray-100 dark:border-brand-border">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Market Insight</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-brand-dark rounded-3xl border border-gray-100 dark:border-brand-border">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-brand-primary/10 text-brand-primary rounded-xl">
                        <i className="fas fa-newspaper"></i>
                      </div>
                      <div>
                        <p className="text-xs font-black dark:text-white mb-1 uppercase tracking-wider">Sector Trend</p>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">FMCG and IT sectors showing strong resistance levels amid global volatility.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 h-full">
              <div className="bg-white dark:bg-brand-card rounded-[2rem] border border-gray-100 dark:border-brand-border flex flex-col h-[750px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-gray-50 dark:border-brand-border">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">NSE Watchlist</h3>
                  <div className="relative">
                    <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input 
                      type="text" 
                      placeholder="SEARCH SYMBOLS..." 
                      className="w-full bg-gray-50 dark:bg-brand-input border border-gray-100 dark:border-brand-border rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {stocks.length > 0 ? stocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedSymbol(stock.symbol)}
                      className={`w-full flex items-center justify-between p-6 border-b border-gray-50 dark:border-brand-border transition-all hover:bg-gray-50 dark:hover:bg-brand-input ${
                        selectedSymbol === stock.symbol ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          selectedSymbol === stock.symbol ? 'bg-brand-primary text-brand-dark' : 'bg-gray-100 dark:bg-brand-dark text-gray-400'
                        }`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{stock.symbol}</p>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest truncate w-24">{stock.companyName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="mono text-sm font-bold text-gray-900 dark:text-white">₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <p className={`text-[10px] font-black ${stock.change >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                          {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
                        </p>
                      </div>
                    </button>
                  )) : (
                    <div className="p-10 text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Market Data...</p>
                    </div>
                  )}
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
