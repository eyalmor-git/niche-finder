
import { supabase } from './supabaseClient';
import { generateNicheAnalysis } from './geminiService';
import { fetchAllResearchData } from './researchService';
import type { Niche, ResearchPhase } from '../types';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  credits_remaining: number;
  subscription_tier: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data as UserProfile;
};

export const deductCredit = async (userId: string): Promise<number | null> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (!profile || profile.credits_remaining <= 0) return null;

  const newCredits = profile.credits_remaining - 1;

  const { error } = await supabase
    .from('profiles')
    .update({ credits_remaining: newCredits })
    .eq('id', userId);

  if (error) {
    console.error("Error deducting credit:", error);
    return null;
  }

  return newCredits;
};

export const getRecentNiches = async (): Promise<Niche[]> => {
  const { data, error } = await supabase
    .from('niches')
    .select('*, market_signals(*)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data || []) as Niche[];
};

export const searchAndAnalyzeNiche = async (
  query: string,
  userId: string,
  onPhase?: (phase: ResearchPhase) => void
): Promise<{ niche: Niche; remainingCredits: number | null }> => {
  // 1. Check for existing niche (case-insensitive)
  const { data: existing } = await supabase
    .from('niches')
    .select('*, market_signals(*)')
    .ilike('title', query)
    .single();

  const remainingCredits = await deductCredit(userId);

  if (existing) return { niche: existing as Niche, remainingCredits };

  // 2. Fetch real research data from Serper + YouTube
  onPhase?.('fetching');
  const researchData = await fetchAllResearchData(query);

  // 3. Send aggregated data to Gemini for analysis
  onPhase?.('analyzing');
  const analysis = await generateNicheAnalysis(researchData);

  // 4. Save niche to Supabase (total_score is a generated column in the DB)
  onPhase?.('saving');
  const { data: newNiche, error: nicheError } = await supabase
    .from('niches')
    .insert([{
      title: analysis.title,
      category: analysis.category,
      growth_score: analysis.growth_score,
      pain_score: analysis.pain_score,
      competition_score: analysis.competition_score,
      ai_summary: analysis.ai_summary,
    }])
    .select()
    .single();

  if (nicheError) throw nicheError;

  // 5. Save market signals
  if (analysis.signals && analysis.signals.length > 0) {
    const signalsWithId = analysis.signals.map(s => ({
      ...s,
      niche_id: newNiche.id,
    }));
    await supabase.from('market_signals').insert(signalsWithId);
  }

  // 6. Fetch complete object with signals
  const { data: completeNiche } = await supabase
    .from('niches')
    .select('*, market_signals(*)')
    .eq('id', newNiche.id)
    .single();

  onPhase?.('done');
  return { niche: completeNiche as Niche, remainingCredits };
};
