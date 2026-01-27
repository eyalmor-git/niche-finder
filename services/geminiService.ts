
import { GoogleGenAI, Type } from "@google/genai";
import { Niche, MarketSignal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateNicheAnalysis = async (query: string): Promise<Partial<Niche> & { signals: Partial<MarketSignal>[] }> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `Deeply analyze the market niche: "${query}". 
    Identify specific consumer pain points, growth trends, and current competition level.
    Provide a score (0-100) for growth_score, pain_score, and competition_score.
    Generate 3 real-world style market signals (one for reddit, one for youtube, one for google_trends).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          growth_score: { type: Type.NUMBER },
          pain_score: { type: Type.NUMBER },
          competition_score: { type: Type.NUMBER },
          ai_summary: { type: Type.STRING },
          signals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source_type: { type: Type.STRING, enum: ['reddit', 'youtube', 'google_trends'] },
                content_snippet: { type: Type.STRING },
                source_url: { type: Type.STRING }
              },
              required: ["source_type", "content_snippet", "source_url"]
            }
          }
        },
        required: ["title", "category", "growth_score", "pain_score", "competition_score", "ai_summary", "signals"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
