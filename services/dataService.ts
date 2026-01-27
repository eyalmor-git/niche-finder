
import { supabase } from './supabaseClient';
import { generateNicheAnalysis } from './geminiService';
import { Niche } from '../types';

export const getRecentNiches = async (): Promise<Niche[]> => {
  const { data, error } = await supabase
    .from('niches')
    .select('*, market_signals(*)')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return (data || []) as Niche[];
};

export const searchAndAnalyzeNiche = async (query: string): Promise<Niche> => {
  // 1. Try to find existing niche (case-insensitive)
  const { data: existing } = await supabase
    .from('niches')
    .select('*, market_signals(*)')
    .ilike('title', query)
    .single();

  if (existing) return existing as Niche;

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

  return completeNiche as Niche;
};
