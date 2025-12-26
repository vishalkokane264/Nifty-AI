
import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { StockData, PredictionResult, ChartPoint } from '../types';

interface StockChartProps {
  stock: StockData;
  prediction: PredictionResult | null;
}

const StockChart: React.FC<StockChartProps> = ({ stock, prediction }) => {
  const isPositive = stock.change >= 0;

  const chartData = useMemo(() => {
    const baseData = stock.history.map(p => ({ ...p }));
    if (!prediction) return baseData;

    const lastPoint = baseData[baseData.length - 1];
    
    // Future projection points
    return [
      ...baseData,
      { time: "+1D (Exp)", predictedPrice: lastPoint.price },
      { time: "Target", predictedPrice: prediction.targetPrice }
    ];
  }, [stock.history, prediction]);

  return (
    <div className="h-[400px] w-full mt-6 bg-white dark:bg-brand-card rounded-3xl p-6 border border-gray-100 dark:border-brand-border relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NSE Performance Analytics</h4>
          {prediction && (
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${prediction.expectedRoi >= 0 ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
              EST. YIELD: {prediction.expectedRoi >= 0 ? '+' : ''}{prediction.expectedRoi.toFixed(2)}%
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center text-[10px] font-bold text-gray-400">
            <span className="w-2 h-2 rounded-full bg-brand-success mr-2"></span> ACTUAL
          </div>
          {prediction && (
            <div className="flex items-center text-[10px] font-bold text-brand-primary">
              <span className="w-2 h-2 rounded-full border border-dashed border-brand-primary mr-2"></span> PREDICTED
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#00c087" : "#f84960"} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={isPositive ? "#00c087" : "#f84960"} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fcd535" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#fcd535" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.05} vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#181a20', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={isPositive ? "#00c087" : "#f84960"} 
            fillOpacity={1} 
            fill="url(#colorActual)" 
            strokeWidth={3}
            dot={false}
          />

          {prediction && (
            <Area
              type="monotone"
              dataKey="predictedPrice"
              stroke="#fcd535"
              strokeWidth={3}
              strokeDasharray="8 8"
              fill="url(#colorPredicted)"
              connectNulls={true}
            />
          )}

          {prediction && (
            <ReferenceLine 
              y={prediction.targetPrice} 
              stroke="#fcd535" 
              strokeDasharray="4 4" 
              label={{ position: 'right', value: `₹${prediction.targetPrice}`, fill: '#fcd535', fontSize: 10, fontWeight: 'bold' }} 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(StockChart);
