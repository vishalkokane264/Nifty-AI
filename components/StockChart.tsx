
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
    if (!prediction) return stock.history;

    const lastPoint = stock.history[stock.history.length - 1];
    
    // Create projection points
    const projection: ChartPoint[] = [
      { time: lastPoint.time, predictedPrice: lastPoint.price },
      { time: "Next Session", predictedPrice: prediction.targetPrice }
    ];

    return [...stock.history, ...projection];
  }, [stock.history, prediction]);

  return (
    <div className="h-[400px] w-full mt-6 bg-white dark:bg-brand-card rounded-2xl p-6 border border-gray-100 dark:border-brand-border relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Market Pulse & AI Projection</h4>
          {prediction && (
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${prediction.expectedRoi >= 0 ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
              ROI: {prediction.expectedRoi >= 0 ? '+' : ''}{prediction.expectedRoi.toFixed(2)}%
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-primary mr-2"></span> Real-time
          </div>
          {prediction && (
            <div className="flex items-center text-[10px] font-bold text-brand-primary uppercase">
              <span className="w-2 h-2 rounded-full border border-dashed border-brand-primary mr-2"></span> AI Target
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#00c087" : "#f84960"} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={isPositive ? "#00c087" : "#f84960"} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fcd535" stopOpacity={0.1}/>
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
            interval="preserveStartEnd"
          />
          <YAxis 
            hide 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#181a20', 
                border: '1px solid #2d3339', 
                borderRadius: '12px', 
                fontSize: '11px', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
            }}
            cursor={{ stroke: '#fcd535', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={isPositive ? "#00c087" : "#f84960"} 
            fillOpacity={1} 
            fill="url(#colorActual)" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#fff', stroke: isPositive ? "#00c087" : "#f84960", strokeWidth: 2 }}
          />

          {prediction && (
            <Area
              type="step"
              dataKey="predictedPrice"
              stroke="#fcd535"
              strokeWidth={2}
              strokeDasharray="6 6"
              fill="url(#colorProjection)"
              connectNulls={true}
              dot={{ r: 3, fill: '#fcd535' }}
            />
          )}

          {prediction && (
            <ReferenceLine 
              y={prediction.targetPrice} 
              stroke="#fcd535" 
              strokeDasharray="3 3" 
              label={{ 
                position: 'right', 
                value: `Target ₹${prediction.targetPrice}`, 
                fill: '#fcd535', 
                fontSize: 10,
                fontWeight: 'bold'
              }} 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Decorative pulse at last point */}
      {!prediction && stock.history.length > 0 && (
        <div className="absolute top-2 right-6 flex items-center space-x-2">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
            </span>
            <span className="text-[9px] font-bold text-brand-success uppercase">Streaming</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(StockChart);
