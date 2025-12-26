
import React from 'react';
import { PredictionResult } from '../types';

interface PredictorCardProps {
  prediction: PredictionResult | null;
  loading: boolean;
}

const PredictorCard: React.FC<PredictorCardProps> = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-brand-card rounded-2xl p-6 border border-gray-200 dark:border-brand-border animate-pulse shadow-sm">
        <div className="h-6 w-32 bg-gray-200 dark:bg-brand-border rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 dark:bg-brand-border rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-brand-border rounded"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-white dark:bg-brand-card rounded-2xl p-8 border border-gray-200 dark:border-brand-border text-center shadow-sm">
        <div className="w-12 h-12 bg-gray-100 dark:bg-brand-input rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-brain text-2xl text-gray-400"></i>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Select a stock to generate AI Trading Insights.</p>
      </div>
    );
  }

  const recColors = {
    BUY: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    SELL: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    HOLD: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  };

  const isProfit = prediction.expectedRoi >= 0;

  return (
    <div className="bg-white dark:bg-brand-card rounded-2xl p-6 border border-gray-200 dark:border-brand-border shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">AI Recommendation</h3>
          <p className="text-xs text-gray-500">Based on technical & news grounding</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${recColors[prediction.recommendation]}`}>
          {prediction.recommendation}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-brand-dark p-3 rounded-xl border border-gray-100 dark:border-brand-border">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Target Price</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">₹{prediction.targetPrice.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-50 dark:bg-brand-dark p-3 rounded-xl border border-gray-100 dark:border-brand-border">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Potential ROI</p>
          <p className={`text-lg font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isProfit ? '+' : ''}{prediction.expectedRoi.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase">Analysis Confidence</h4>
          <span className="text-xs font-bold text-gray-900 dark:text-white">{prediction.confidence}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-brand-input rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary" 
            style={{ width: `${prediction.confidence}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Reasoning</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-2 border-brand-primary pl-4">
          "{prediction.reasoning}"
        </p>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Key Drivers</h4>
        <div className="flex flex-wrap gap-2">
          {prediction.keyFactors.map((factor, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-gray-100 dark:bg-brand-input rounded text-[10px] font-medium text-gray-600 dark:text-gray-300">
              {factor}
            </span>
          ))}
        </div>
      </div>

      {prediction.sources && prediction.sources.length > 0 && (
        <div className="border-t border-gray-100 dark:border-brand-border pt-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Grounding Sources</h4>
          <div className="space-y-2">
            {prediction.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-xs text-blue-500 hover:text-blue-600 truncate transition-colors"
              >
                <i className="fas fa-external-link-alt mr-2 text-[10px]"></i>
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictorCard;
