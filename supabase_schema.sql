-- Supabase SQL Schema for TukTakCasino.com (Production Ready)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (Linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  balance NUMERIC DEFAULT 0.0,
  withdrawal_password TEXT,
  role TEXT DEFAULT 'user',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'win', 'bet')),
  method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions Policies
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deposit Requests Table
CREATE TABLE IF NOT EXISTS deposit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  transaction_id TEXT,
  screenshot TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own deposits" ON deposit_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deposits" ON deposit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own withdrawals" ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdrawals" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game Rounds Table
CREATE TABLE IF NOT EXISTS game_rounds (
  id BIGINT PRIMARY KEY,
  game_name TEXT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'spinning', 'finished')),
  result_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read game rounds" ON game_rounds FOR SELECT USING (true);

-- Game Results Table
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_name TEXT NOT NULL,
  round_id BIGINT NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read game results" ON game_results FOR SELECT USING (true);

-- Bets Table
CREATE TABLE bets (
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

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own bets" ON bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bets" ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Roulette Bets Table
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

ALTER TABLE roulette_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roulette bets" ON roulette_bets FOR SELECT USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Users can insert own roulette bets" ON roulette_bets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Game History Table
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  bet_amount NUMERIC NOT NULL,
  win_amount NUMERIC NOT NULL,
  result TEXT NOT NULL,
  round_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own history" ON game_history FOR SELECT USING (auth.uid() = user_id);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Offers Table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active offers" ON offers FOR SELECT USING (status = 'active');

-- Claimed Offers Table
CREATE TABLE claimed_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, offer_id)
);

ALTER TABLE claimed_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own claimed offers" ON claimed_offers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own claimed offers" ON claimed_offers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
