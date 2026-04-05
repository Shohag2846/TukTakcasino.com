-- Run this in your Supabase SQL Editor to fix the database schema

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS demo_balance NUMERIC DEFAULT 1000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'demo';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS numeric_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS withdraw_password TEXT;

-- Update existing users to have a demo balance if they don't
UPDATE profiles SET demo_balance = 1000 WHERE demo_balance IS NULL;
UPDATE profiles SET game_mode = 'demo' WHERE game_mode IS NULL;

-- Create Game Rounds Table if not exists
CREATE TABLE IF NOT EXISTS game_rounds (
  id BIGINT PRIMARY KEY,
  game_name TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'spinning', 'finished')),
  result_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Game Results Table if not exists
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_name TEXT NOT NULL,
  round_id BIGINT NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Bets Table if not exists
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  round_id BIGINT NOT NULL,
  amount NUMERIC NOT NULL,
  bet_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  win_amount NUMERIC DEFAULT 0,
  mode TEXT DEFAULT 'real',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Game History Table if not exists
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  bet_amount NUMERIC NOT NULL,
  win_amount NUMERIC NOT NULL,
  result TEXT NOT NULL,
  round_id BIGINT NOT NULL,
  mode TEXT DEFAULT 'real',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and add policies
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read game rounds" ON game_rounds;
CREATE POLICY "Anyone can read game rounds" ON game_rounds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read game results" ON game_results;
CREATE POLICY "Anyone can read game results" ON game_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can read own bets" ON bets;
CREATE POLICY "Users can read own bets" ON bets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own bets" ON bets;
CREATE POLICY "Users can insert own bets" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own history" ON game_history;
CREATE POLICY "Users can read own history" ON game_history FOR SELECT USING (auth.uid() = user_id);

-- Create roulette_bets Table
CREATE TABLE IF NOT EXISTS roulette_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  round_id BIGINT NOT NULL,
  bet_type TEXT NOT NULL,
  bet_value TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'win', 'loss')),
  payout NUMERIC DEFAULT 0,
  mode TEXT DEFAULT 'real',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add mode column to roulette_bets if missing
ALTER TABLE roulette_bets ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'real';

-- Enable RLS
ALTER TABLE roulette_bets ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can read own roulette bets" ON roulette_bets;
CREATE POLICY "Users can read own roulette bets" ON roulette_bets FOR SELECT USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');
DROP POLICY IF EXISTS "Users can insert own roulette bets" ON roulette_bets;
CREATE POLICY "Users can insert own roulette bets" ON roulette_bets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
