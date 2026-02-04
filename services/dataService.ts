
import { supabase } from './supabaseClient';
import { generateNicheAnalysis } from './geminiService';
import { Niche } from '../types';

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
  // First get current credits
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

export const searchAndAnalyzeNiche = async (query: string, userId: string): Promise<{ niche: Niche, remainingCredits: number | null }> => {
  // 1. Try to find existing niche (case-insensitive)
  const { data: existing } = await supabase
    .from('niches')
    .select('*, market_signals(*)')
    .ilike('title', query)
    .single();

  // If it exists, we still deduct a credit as per user request ("after a user search for a niche the number of credits update")
  const remainingCredits = await deductCredit(userId);

  if (existing) return { niche: existing as Niche, remainingCredits };

  // 2. Generate new analysis if not found
  const analysis = await generateNicheAnalysis(query);

  // 3. Save to Supabase
  const { data: newNiche, error: nicheError } = await supabase
    .from('niches')
    .insert([{
      title: analysis.title,
      category: analysis.category,
      growth_score: analysis.growth_score,
      pain_score: analysis.pain_score,
      competition_score: analysis.competition_score,
      ai_summary: analysis.ai_summary
    }])
    .select()
    .single();

  if (nicheError) throw nicheError;

  // 4. Save signals
  if (analysis.signals && analysis.signals.length > 0) {
    const signalsWithId = analysis.signals.map(s => ({
      ...s,
      niche_id: newNiche.id
    }));
    await supabase.from('market_signals').insert(signalsWithId);
  }

  // 5. Fetch complete object with signals
  const { data: completeNiche } = await supabase
    .from('niches')
    .select('*, market_signals(*)')
    .eq('id', newNiche.id)
    .single();

  return { niche: completeNiche as Niche, remainingCredits };
};
