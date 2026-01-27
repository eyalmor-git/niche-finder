
export type MarketSourceType = 'reddit' | 'youtube' | 'google_trends';

export interface MarketSignal {
  id?: string;
  niche_id?: string;
  source_type: MarketSourceType;
  content_snippet: string;
  source_url: string;
  created_at?: string;
}

export interface Niche {
  id: string;
  title: string;
  category: string;
  growth_score: number;
  pain_score: number;
  competition_score: number;
  total_score: number;
  ai_summary: string;
  created_at: string;
  last_updated_at: string;
  market_signals?: MarketSignal[];
}
