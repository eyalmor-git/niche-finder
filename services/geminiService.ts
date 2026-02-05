
import { GoogleGenAI, Type } from "@google/genai";
import type { Niche, MarketSignal, ResearchData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateNicheAnalysis = async (
  researchData: ResearchData
): Promise<Partial<Niche> & { signals: Partial<MarketSignal>[] }> => {
  const model = 'gemini-2.0-flash';

  // Build a data-rich prompt from real research results
  const googleSummary = researchData.google
    .slice(0, 5)
    .map((r, i) => `  ${i + 1}. "${r.title}" — ${r.snippet} (${r.link})`)
    .join('\n');

  const redditSummary = researchData.reddit
    .slice(0, 5)
    .map((r, i) => `  ${i + 1}. "${r.title}" — ${r.snippet} (${r.link})`)
    .join('\n');

  const youtubeSummary = researchData.youtube
    .slice(0, 5)
    .map((v, i) => `  ${i + 1}. "${v.title}" by ${v.channelTitle} — ${v.description} (https://youtube.com/watch?v=${v.videoId})`)
    .join('\n');

  const prompt = `You are a market research analyst. Analyze the following REAL data collected from Google, Reddit, and YouTube about the niche query: "${researchData.query}".

=== GOOGLE SEARCH RESULTS ===
${googleSummary || '  No results found.'}

=== REDDIT DISCUSSIONS ===
${redditSummary || '  No results found.'}

=== YOUTUBE VIDEOS ===
${youtubeSummary || '  No results found.'}

Based on this real data, provide:
1. A concise title for this niche opportunity.
2. A market category.
3. A growth_score (0-100): How much momentum and growing interest does this niche show?
4. A pain_score (0-100): How intense are the pain points people express? Are they actively seeking solutions?
5. A competition_score (0-100): How saturated is this market? How many established players exist?
6. An ai_summary: A 2-3 paragraph market thesis grounded in the data above. Reference specific signals you observed.
7. Exactly 3 market signals — pick the most compelling real evidence from the data:
   - One from reddit (use an actual Reddit link from the data above)
   - One from youtube (use an actual YouTube link from the data above)
   - One from google_trends (use the most relevant Google result link)
   Each signal should have a content_snippet that quotes or summarizes the real finding.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
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
