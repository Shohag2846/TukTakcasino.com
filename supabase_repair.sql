-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  balance numeric DEFAULT 0,
  withdraw_password text,
  created_at timestamp with time zone DEFAULT now()
);

-- Deposit requests table
CREATE TABLE IF NOT EXISTS deposit_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text,
  transaction_id text,
  screenshot text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL,
  method text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own deposit requests" ON deposit_requests;
CREATE POLICY "Users can view their own deposit requests" ON deposit_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own deposit requests" ON deposit_requests;
CREATE POLICY "Users can insert their own deposit requests" ON deposit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
