import type { SerperSearchResult, YouTubeVideo, ResearchData } from '../types';

const SERPER_API_KEY = process.env.SERPER_API_KEY || '';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

async function searchSerper(query: string): Promise<SerperSearchResult[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10 }),
  });

  if (!res.ok) {
    console.error('Serper Google search failed:', res.status);
    return [];
  }

  const data = await res.json();
  return (data.organic || []).map((r: any, i: number) => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet || '',
    position: r.position ?? i + 1,
  }));
}

async function searchReddit(query: string): Promise<SerperSearchResult[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: `${query} site:reddit.com`, num: 10 }),
  });

  if (!res.ok) {
    console.error('Serper Reddit search failed:', res.status);
    return [];
  }

  const data = await res.json();
  return (data.organic || []).map((r: any, i: number) => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet || '',
    position: r.position ?? i + 1,
  }));
}

async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '10',
    order: 'relevance',
    key: YOUTUBE_API_KEY,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

  if (!res.ok) {
    console.error('YouTube search failed:', res.status);
    return [];
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    description: item.snippet.description,
    videoId: item.id.videoId,
    publishedAt: item.snippet.publishedAt,
  }));
}

export async function fetchAllResearchData(query: string): Promise<ResearchData> {
  const [google, reddit, youtube] = await Promise.all([
    searchSerper(query),
    searchReddit(query),
    searchYouTube(query),
  ]);

  return { query, google, reddit, youtube };
}
