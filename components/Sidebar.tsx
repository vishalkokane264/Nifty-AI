
import React, { useState } from 'react';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const items = [
    { name: 'Terminal', icon: 'fa-terminal', active: true },
    { name: 'Analytics', icon: 'fa-chart-network' },
    { name: 'Watchlists', icon: 'fa-star' },
    { name: 'AI Signals', icon: 'fa-microchip' },
    { name: 'Trading', icon: 'fa-exchange-alt' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-50 w-16 h-16 bg-brand-primary text-brand-dark rounded-3xl shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-brand-card border-r border-gray-100 dark:border-brand-border h-screen flex flex-col transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-10 flex items-center space-x-4">
          <div className="bg-brand-primary w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-brand-primary/30">
            <i className="fas fa-bolt text-brand-dark text-xl"></i>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">NiftyAI</h1>
        </div>

        <nav className="flex-1 px-6 py-6 space-y-3">
          {items.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center space-x-5 px-6 py-4 rounded-2xl transition-all relative group overflow-hidden ${
                item.active 
                  ? 'bg-brand-primary text-brand-dark font-black shadow-lg shadow-brand-primary/10' 
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-brand-input hover:text-gray-900 dark:hover:text-white font-bold'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-sm`}></i>
              <span className="text-[10px] uppercase tracking-[0.2em]">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <div className="bg-gray-900 dark:bg-brand-dark rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
               <i className="fas fa-crown text-6xl text-brand-primary"></i>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Institutional</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">Unlock advanced arbitrage signals.</p>
            <button className="w-full py-3.5 bg-brand-primary hover:bg-yellow-400 text-brand-dark text-[10px] font-black rounded-xl transition-all transform active:scale-95 uppercase tracking-widest shadow-lg shadow-brand-primary/20">
              Upgrade
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
