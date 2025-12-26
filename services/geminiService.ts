
import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult, StockData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getStockPrediction = async (stock: StockData): Promise<PredictionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the current performance and recent news for the NSE stock ${stock.symbol} (${stock.companyName}). 
      Current Price: ₹${stock.price}. 
      Recent Change: ${stock.changePercent}%.
      Provide a detailed prediction including a recommendation (BUY/SELL/HOLD), confidence level (0-100), target price, and technical/fundamental reasoning. 
      Also, check for recent news using Google Search.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            recommendation: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD'] },
            confidence: { type: Type.NUMBER },
            targetPrice: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
            keyFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['symbol', 'recommendation', 'confidence', 'targetPrice', 'reasoning', 'sentiment', 'keyFactors']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })) || [];

    // Calculate ROI
    const currentPrice = stock.price;
    const targetPrice = result.targetPrice;
    const expectedRoi = ((targetPrice - currentPrice) / currentPrice) * 100;

    return { ...result, sources, expectedRoi };
  } catch (error) {
    console.error("Prediction failed:", error);
    return {
      symbol: stock.symbol,
      recommendation: 'HOLD',
      confidence: 50,
      targetPrice: stock.price,
      reasoning: "Unable to fetch real-time prediction. Please try again.",
      sentiment: 'NEUTRAL',
      keyFactors: ["API connectivity check", "Market volatility"],
      expectedRoi: 0
    };
  }
};
