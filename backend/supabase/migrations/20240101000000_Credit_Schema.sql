-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  occupation_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MOMO_TRANSACTIONS table
CREATE TABLE public.momo_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  from_account VARCHAR(50),
  from_name VARCHAR(255),
  from_number VARCHAR(50),
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  fees DECIMAL(10, 2) DEFAULT 0,
  e_levy DECIMAL(10, 2) DEFAULT 0,
  balance_before DECIMAL(12, 2),
  balance_after DECIMAL(12, 2),
  to_number VARCHAR(50),
  to_name VARCHAR(255),
  to_account VARCHAR(50),
  f_id VARCHAR(100),
  reference TEXT,
  ova VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREDIT_SCORES table
CREATE TABLE public.credit_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  income_consistency DECIMAL(5, 2) NOT NULL DEFAULT 0,
  savings_behaviour DECIMAL(5, 2) NOT NULL DEFAULT 0,
  payment_history DECIMAL(5, 2) NOT NULL DEFAULT 0,
  transaction_frequency DECIMAL(5, 2) NOT NULL DEFAULT 0,
  score_tier VARCHAR(20) NOT NULL CHECK (score_tier IN ('high_risk', 'medium_risk', 'low_risk', 'strong')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LOAN_ELIGIBILITY table
CREATE TABLE public.loan_eligibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score_id UUID REFERENCES public.credit_scores(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  bank_readiness_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  mobile_money_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  digital_lender_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  estimated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RECOMMENDATIONS table
CREATE TABLE public.recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  factor VARCHAR(50) NOT NULL CHECK (factor IN ('income', 'savings', 'payments', 'frequency')),
  action_text TEXT NOT NULL,
  target_value DECIMAL(10, 2) NOT NULL,
  current_progress DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SCORE_LOGS table (for audit trail)
CREATE TABLE public.score_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  input_parameters JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_logs ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- MOMO_TRANSACTIONS policies
CREATE POLICY "Users can view own momo transactions"
  ON public.momo_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own momo transactions"
  ON public.momo_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own momo transactions"
  ON public.momo_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own momo transactions"
  ON public.momo_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- CREDIT_SCORES policies
CREATE POLICY "Users can view own scores"
  ON public.credit_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON public.credit_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- LOAN_ELIGIBILITY policies
CREATE POLICY "Users can view own eligibility"
  ON public.loan_eligibility FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own eligibility"
  ON public.loan_eligibility FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RECOMMENDATIONS policies
CREATE POLICY "Users can view own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON public.recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- SCORE_LOGS policies
CREATE POLICY "Users can view own score logs"
  ON public.score_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own score logs"
  ON public.score_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get latest credit score for a user
CREATE OR REPLACE FUNCTION public.get_latest_score(p_user_id UUID)
RETURNS TABLE (
  score INTEGER,
  score_tier VARCHAR,
  income_consistency DECIMAL,
  savings_behaviour DECIMAL,
  payment_history DECIMAL,
  transaction_frequency DECIMAL,
  calculated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.score,
    cs.score_tier,
    cs.income_consistency,
    cs.savings_behaviour,
    cs.payment_history,
    cs.transaction_frequency,
    cs.calculated_at
  FROM public.credit_scores cs
  WHERE cs.user_id = p_user_id
  ORDER BY cs.calculated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
