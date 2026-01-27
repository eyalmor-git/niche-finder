-- ==========================================
-- NICHE FINDER ENGINE - FINAL DATABASE SCHEMA
-- ==========================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLEANUP (Run these to ensure strict column ordering if you are re-installing)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TABLE IF EXISTS public.market_signals CASCADE;
-- DROP TABLE IF EXISTS public.niches CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREATE PROFILES TABLE (Strict Order: id, first_name, last_name, email)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CREATE NICHES TABLE
CREATE TABLE IF NOT EXISTS public.niches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  growth_score FLOAT DEFAULT 0,
  pain_score FLOAT DEFAULT 0,
  competition_score FLOAT DEFAULT 0,
  total_score FLOAT GENERATED ALWAYS AS (
    (growth_score * 0.4) + (pain_score * 0.4) - (competition_score * 0.2)
  ) STORED,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CREATE MARKET SIGNALS TABLE
CREATE TABLE IF NOT EXISTS public.market_signals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  niche_id UUID REFERENCES public.niches(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('reddit', 'youtube', 'google_trends')),
  content_snippet TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_signals ENABLE ROW LEVEL SECURITY;

-- Clear old policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.niches;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.niches;
DROP POLICY IF EXISTS "Enable read access for signals" ON public.market_signals;
DROP POLICY IF EXISTS "Enable insert for signals" ON public.market_signals;

-- Re-create Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable read access for all users" ON public.niches FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.niches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for signals" ON public.market_signals FOR SELECT USING (true);
CREATE POLICY "Enable insert for signals" ON public.market_signals FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. TRIGGERS & FUNCTIONS

-- A. Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- B. Automatically update the last_updated_at column on niches
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_niches_modtime ON public.niches;
CREATE TRIGGER update_niches_modtime 
BEFORE UPDATE ON public.niches 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
