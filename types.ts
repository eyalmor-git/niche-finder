
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

// --- Research data types ---

export interface SerperSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerperResponse {
  organic: SerperSearchResult[];
  searchParameters?: { q: string };
}

export interface YouTubeVideo {
  title: string;
  channelTitle: string;
  description: string;
  videoId: string;
  publishedAt: string;
  viewCount?: string;
}

export interface ResearchData {
  query: string;
  google: SerperSearchResult[];
  reddit: SerperSearchResult[];
  youtube: YouTubeVideo[];
}

export type ResearchPhase =
  | 'fetching'
  | 'analyzing'
  | 'scoring'
  | 'saving'
  | 'done';
