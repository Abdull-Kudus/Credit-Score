# Credit Score — Full Implementation Documentation
**App Name:** Credit Score (Informal Worker Credit Passport)  
**Frontend:** Next.js 14 (App Router) + Tailwind CSS  
**Backend:** Supabase (Auth + PostgreSQL + Edge Functions + RLS)  
**Hosting:** Vercel (frontend) + Supabase (backend)  
**Language:** TypeScript  
**Charts:** Chart.js v4  
**CSV Parsing:** Papa Parse  
**Color Scheme:** ALU Blue (#1B3A6B) + White (#FFFFFF)

---

## PROJECT STRUCTURE

```
credit-score/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx
│   │   │   ├── score/
│   │   │   │   └── page.tsx
│   │   │   ├── recommendations/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Modal.tsx
│   │   ├── dashboard/
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── ScoreTrendChart.tsx
│   │   │   ├── LoanReadinessBar.tsx
│   │   │   └── InsightCard.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── CSVUpload.tsx
│   │   ├── recommendations/
│   │   │   └── RecommendationCard.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── BottomNav.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── scoring/
│   │   │   └── algorithm.ts
│   │   └── utils/
│   │       ├── formatCurrency.ts
│   │       └── parseCSV.ts
│   ├── types/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   └── useScore.ts
│   ├── middleware.ts
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
└── backend/
    ├── supabase/
    │   ├── migrations/
    │   │   └── 001_initial_schema.sql
    │   ├── functions/
    │   │   └── calculate-score/
    │   │       └── index.ts
    │   └── seed.sql
```

---

## PART 1 — BACKEND (SUPABASE)

### 1.1 Supabase Project Setup

1. Go to supabase.com and create a new project named **credit-score**
2. Save your project URL and anon key — you will need these for the frontend
3. Go to SQL Editor and run all SQL below in order

---

### 1.2 Database Schema — Run in Supabase SQL Editor

```sql
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

-- TRANSACTIONS table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  transaction_date DATE NOT NULL,
  amount_ghs DECIMAL(12, 2) NOT NULL CHECK (amount_ghs > 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'savings', 'bill_payment')),
  source VARCHAR(50) NOT NULL CHECK (source IN ('mobile_money', 'cash', 'bank_transfer')),
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREDIT_SCORES table
CREATE TABLE public.credit_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  score_id UUID REFERENCES public.credit_scores(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  bank_readiness_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  mobile_money_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  digital_lender_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  estimated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RECOMMENDATIONS table
CREATE TABLE public.recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  input_parameters JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 1.3 Row Level Security (RLS) Policies — Run in Supabase SQL Editor

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
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

-- TRANSACTIONS policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
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
```

---

### 1.4 Database Functions — Run in Supabase SQL Editor

```sql
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
```

---

### 1.5 Supabase Edge Function — Credit Score Calculator

Create this file at `backend/supabase/functions/calculate-score/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const { user_id } = await req.json()

    // Fetch last 90 days of transactions
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user_id)
      .gte("transaction_date", ninetyDaysAgo.toISOString().split("T")[0])
      .order("transaction_date", { ascending: true })

    if (error) throw error
    if (!transactions || transactions.length < 10) {
      return new Response(
        JSON.stringify({ error: "Minimum 10 transactions required to calculate score" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    //**Missing from the implementation:**

1. **Email verification confirmation page** — `/auth/confirm` route that Supabase redirects to after a user clicks the verification link in their email. Without this the signup flow breaks.

2. **Password reset page** — `/reset-password` page where users enter their email to receive a reset link, and a `/update-password` page where they set the new password after clicking the link.

3. **Onboarding walkthrough** — a 4-step modal or screen that appears only on first login explaining how the score works, what data to enter, and how to read the dashboard. Should never show again after the user dismisses it.

4. **Score sharing page** — a clean shareable page at `/share/[userId]` that shows the user's Credit Passport Score, score tier, and loan readiness percentages in a format a lender can view. Should have a copy link button.

5. **Skeleton loading screens** — loading placeholder cards for the dashboard, transactions list, and recommendations while data is being fetched. Critical for 3G connections in Ghana.

6. **Terms and Conditions modal** — a modal shown during registration that the user must accept before submitting the form. Should include the disclaimer that scores are estimates and not guaranteed loan offers.

7. **Delete account flow** — a confirmation modal on the profile page that warns the user their data will be permanently deleted, requires them to type "DELETE" to confirm, then calls Supabase to remove all their records.

8. **Score history page** — a page showing all previous score calculations with dates so users can track improvement over time rather than only seeing the latest score on the dashboard.

9. **Empty state screens** — proper empty state designs for when there are no transactions, no recommendations, and no score yet. You have basic versions but they need a clear call to action button pointing the user to the next step.

10. **Session expiry handling** — when the JWT token expires after 30 minutes, the app should automatically redirect the user to login with a message saying their session expired rather than silently breaking.


    // --- SCORING ALGORITHM ---

    const incomeTransactions = transactions.filter(t => t.type === "income")
    const savingsTransactions = transactions.filter(t => t.type === "savings")
    const billPayments = transactions.filter(t => t.type === "bill_payment")

    // 1. Income Consistency (35%) — measures regularity of income
    const incomeScore = calculateIncomeConsistency(incomeTransactions)

    // 2. Savings Behaviour (25%) — measures savings regularity
    const savingsScore = calculateSavingsBehaviour(savingsTransactions, transactions)

    // 3. Payment History (25%) — measures bill payment consistency
    const paymentScore = calculatePaymentHistory(billPayments)

    // 4. Transaction Frequency (15%) — measures overall activity
    const frequencyScore = calculateTransactionFrequency(transactions)

    // Weighted final score (0-1000)
    const finalScore = Math.round(
      (incomeScore * 0.35 +
      savingsScore * 0.25 +
      paymentScore * 0.25 +
      frequencyScore * 0.15) * 10
    )

    // Score tier
    const scoreTier =
      finalScore >= 800 ? "strong" :
      finalScore >= 600 ? "low_risk" :
      finalScore >= 400 ? "medium_risk" : "high_risk"

    // Loan eligibility percentages
    const bankReadiness = Math.min(Math.round((finalScore / 1000) * 60), 100)
    const mobileMoneyReadiness = Math.min(Math.round((finalScore / 1000) * 90), 100)
    const digitalLenderReadiness = Math.min(Math.round((finalScore / 1000) * 80), 100)

    // Save credit score
    const { data: scoreData, error: scoreError } = await supabase
      .from("credit_scores")
      .insert({
        user_id,
        score: finalScore,
        income_consistency: incomeScore,
        savings_behaviour: savingsScore,
        payment_history: paymentScore,
        transaction_frequency: frequencyScore,
        score_tier: scoreTier,
      })
      .select()
      .single()

    if (scoreError) throw scoreError

    // Save loan eligibility
    await supabase.from("loan_eligibility").insert({
      score_id: scoreData.id,
      user_id,
      bank_readiness_pct: bankReadiness,
      mobile_money_pct: mobileMoneyReadiness,
      digital_lender_pct: digitalLenderReadiness,
    })

    // Generate recommendations based on weakest factors
    await generateRecommendations(supabase, user_id, {
      income: incomeScore,
      savings: savingsScore,
      payments: paymentScore,
      frequency: frequencyScore,
    })

    // Log the score calculation
    await supabase.from("score_logs").insert({
      user_id,
      score: finalScore,
      input_parameters: {
        transaction_count: transactions.length,
        income_score: incomeScore,
        savings_score: savingsScore,
        payment_score: paymentScore,
        frequency_score: frequencyScore,
      },
    })

    return new Response(
      JSON.stringify({
        score: finalScore,
        score_tier: scoreTier,
        factors: {
          income_consistency: incomeScore,
          savings_behaviour: savingsScore,
          payment_history: paymentScore,
          transaction_frequency: frequencyScore,
        },
        loan_eligibility: {
          bank: bankReadiness,
          mobile_money: mobileMoneyReadiness,
          digital_lender: digitalLenderReadiness,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})

function calculateIncomeConsistency(incomeTransactions: any[]): number {
  if (incomeTransactions.length === 0) return 0
  const weeks = groupByWeek(incomeTransactions)
  const weeksWithIncome = Object.keys(weeks).length
  const consistency = Math.min(weeksWithIncome / 12, 1)
  const amounts = incomeTransactions.map(t => t.amount_ghs)
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
  const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance)
  const stabilityScore = Math.max(0, 1 - stdDev / avgAmount)
  return Math.round(((consistency * 0.6 + stabilityScore * 0.4) * 100))
}

function calculateSavingsBehaviour(savingsTransactions: any[], allTransactions: any[]): number {
  if (savingsTransactions.length === 0) return 0
  const totalIncome = allTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount_ghs, 0)
  const totalSavings = savingsTransactions.reduce((sum, t) => sum + t.amount_ghs, 0)
  const savingsRate = totalIncome > 0 ? Math.min(totalSavings / totalIncome, 1) : 0
  const regularityScore = Math.min(savingsTransactions.length / 12, 1)
  return Math.round(((savingsRate * 0.5 + regularityScore * 0.5) * 100))
}

function calculatePaymentHistory(billPayments: any[]): number {
  if (billPayments.length === 0) return 0
  const regularityScore = Math.min(billPayments.length / 12, 1)
  return Math.round((regularityScore * 100))
}

function calculateTransactionFrequency(transactions: any[]): number {
  const weeksWithActivity = Object.keys(groupByWeek(transactions)).length
  return Math.round((Math.min(weeksWithActivity / 12, 1) * 100))
}

function groupByWeek(transactions: any[]): Record<string, any[]> {
  return transactions.reduce((groups, t) => {
    const date = new Date(t.transaction_date)
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
    const key = weekStart.toISOString().split("T")[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
    return groups
  }, {})
}

async function generateRecommendations(supabase: any, userId: string, factors: Record<string, number>) {
  await supabase.from("recommendations").delete().eq("user_id", userId).eq("is_completed", false)

  const recommendations = []

  if (factors.income < 60) {
    recommendations.push({
      user_id: userId,
      factor: "income",
      action_text: "Record at least one income transaction every week for the next 4 weeks to improve your income consistency score.",
      target_value: 4,
      current_progress: 0,
    })
  }

  if (factors.savings < 60) {
    recommendations.push({
      user_id: userId,
      factor: "savings",
      action_text: "Make a savings transfer of any amount at least once per week for the next 4 weeks to improve your savings behaviour score.",
      target_value: 4,
      current_progress: 0,
    })
  }

  if (factors.payments < 60) {
    recommendations.push({
      user_id: userId,
      factor: "payments",
      action_text: "Record your bill payments consistently over the next month. Aim for at least 4 bill payment entries.",
      target_value: 4,
      current_progress: 0,
    })
  }

  if (factors.frequency < 60) {
    recommendations.push({
      user_id: userId,
      factor: "frequency",
      action_text: "Increase your transaction activity by recording all financial activities including small purchases, airtime, and transfers.",
      target_value: 20,
      current_progress: 0,
    })
  }

  if (recommendations.length > 0) {
    await supabase.from("recommendations").insert(recommendations)
  }
}
```

---

## PART 2 — FRONTEND (NEXT.JS)

### 2.1 Project Setup Commands

Run these in your terminal:

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false
cd frontend
npm install @supabase/supabase-js @supabase/ssr
npm install chart.js react-chartjs-2
npm install papaparse @types/papaparse
npm install lucide-react
npm install @types/node
```

---

### 2.2 Environment Variables

Create `.env.local` in the frontend folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=Credit Score
```

---

### 2.3 Tailwind Config — ALU Colors

`tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alu: {
          blue: "#1B3A6B",
          "blue-light": "#2D5BA3",
          "blue-pale": "#EEF2F9",
          white: "#FFFFFF",
          gray: "#F5F7FA",
          "gray-dark": "#6B7280",
          border: "#E5E7EB",
        },
        score: {
          strong: "#16A34A",
          low: "#2563EB",
          medium: "#D97706",
          high: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
```

---

### 2.4 TypeScript Types

`types/index.ts`:

```typescript
export type TransactionType = "income" | "expense" | "savings" | "bill_payment"
export type TransactionSource = "mobile_money" | "cash" | "bank_transfer"
export type ScoreTier = "high_risk" | "medium_risk" | "low_risk" | "strong"
export type RecommendationFactor = "income" | "savings" | "payments" | "frequency"

export interface User {
  id: string
  full_name: string
  phone_number: string
  occupation_type?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  transaction_date: string
  amount_ghs: number
  type: TransactionType
  source: TransactionSource
  description?: string
  created_at: string
}

export interface CreditScore {
  id: string
  user_id: string
  score: number
  income_consistency: number
  savings_behaviour: number
  payment_history: number
  transaction_frequency: number
  score_tier: ScoreTier
  calculated_at: string
}

export interface LoanEligibility {
  id: string
  score_id: string
  user_id: string
  bank_readiness_pct: number
  mobile_money_pct: number
  digital_lender_pct: number
  estimated_at: string
}

export interface Recommendation {
  id: string
  user_id: string
  factor: RecommendationFactor
  action_text: string
  target_value: number
  current_progress: number
  is_completed: boolean
  created_at: string
}

export interface ScoreResult {
  score: number
  score_tier: ScoreTier
  factors: {
    income_consistency: number
    savings_behaviour: number
    payment_history: number
    transaction_frequency: number
  }
  loan_eligibility: {
    bank: number
    mobile_money: number
    digital_lender: number
  }
}
```

---

### 2.5 Supabase Client

`lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: any) { cookieStore.set({ name, value: "", ...options }) },
      },
    }
  )
}
```

---

### 2.6 Middleware (Session Protection)

`middleware.ts` in root of frontend:

```typescript
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const protectedRoutes = ["/dashboard", "/transactions", "/score", "/recommendations", "/profile"]
  const authRoutes = ["/login", "/register"]
  const path = request.nextUrl.pathname

  if (!session && protectedRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && authRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

---

### 2.7 Root Layout

`app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Credit Score — Informal Worker Credit Passport",
  description: "Build your financial credibility through your mobile money history",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-alu-gray min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

---

### 2.8 Home Page (Landing/Redirect)

`app/page.tsx`:

```tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect("/dashboard")
  else redirect("/login")
}
```

---

### 2.9 Register Page

`app/(auth)/register/page.tsx`:

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    occupation_type: "",
    password: "",
    confirm_password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match")
      return
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone_number: form.phone_number,
          occupation_type: form.occupation_type,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-alu-blue flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-alu-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">CS</span>
          </div>
          <h1 className="text-2xl font-bold text-alu-blue">Create Account</h1>
          <p className="text-alu-gray-dark text-sm mt-1">Build your Credit Passport today</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={handleChange}
              placeholder="John Mensah"
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              name="phone_number"
              type="tel"
              required
              value={form.phone_number}
              onChange={handleChange}
              placeholder="0244123456"
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation Type</label>
            <select
              name="occupation_type"
              value={form.occupation_type}
              onChange={handleChange}
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            >
              <option value="">Select your occupation</option>
              <option value="trader">Trader / Market Vendor</option>
              <option value="driver">Driver</option>
              <option value="freelancer">Freelancer</option>
              <option value="food_vendor">Food Vendor</option>
              <option value="student">Student with Side Income</option>
              <option value="gig_worker">Gig Worker</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              name="confirm_password"
              type="password"
              required
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alu-blue text-white py-3 rounded-lg font-medium hover:bg-alu-blue-light transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-alu-gray-dark mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-alu-blue font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

---

### 2.10 Login Page

`app/(auth)/login/page.tsx`:

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-alu-blue flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-alu-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">CS</span>
          </div>
          <h1 className="text-2xl font-bold text-alu-blue">Welcome Back</h1>
          <p className="text-alu-gray-dark text-sm mt-1">Log in to your Credit Passport</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
              className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alu-blue text-white py-3 rounded-lg font-medium hover:bg-alu-blue-light transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-sm text-alu-gray-dark mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-alu-blue font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
```

---

### 2.11 Dashboard Layout (with Sidebar + Bottom Nav)

`app/(dashboard)/layout.tsx`:

```tsx
import Sidebar from "@/components/layout/Sidebar"
import BottomNav from "@/components/layout/BottomNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-alu-gray">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
```

---

### 2.12 Sidebar Component

`components/layout/Sidebar.tsx`:

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowUpDown, Star, Lightbulb, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowUpDown },
  { href: "/score", label: "My Score", icon: Star },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-alu-blue text-white z-10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-alu-blue text-sm font-bold">CS</span>
          </div>
          <div>
            <p className="font-bold text-sm">Credit Score</p>
            <p className="text-white/60 text-xs">Credit Passport</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              pathname === href
                ? "bg-white text-alu-blue font-medium"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/80 hover:bg-white/10 w-full transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  )
}
```

---

### 2.13 Bottom Navigation (Mobile)

`components/layout/BottomNav.tsx`:

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowUpDown, Star, Lightbulb, User } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowUpDown },
  { href: "/score", label: "Score", icon: Star },
  { href: "/recommendations", label: "Tips", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-alu-border z-10">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors ${
              pathname === href ? "text-alu-blue" : "text-alu-gray-dark"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

---

### 2.14 Dashboard Page

`app/(dashboard)/dashboard/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ScoreGauge from "@/components/dashboard/ScoreGauge"
import LoanReadinessBar from "@/components/dashboard/LoanReadinessBar"
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  const { data: latestScore } = await supabase
    .from("credit_scores")
    .select("*")
    .eq("user_id", session.user.id)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .single()

  const { data: eligibility } = await supabase
    .from("loan_eligibility")
    .select("*")
    .eq("user_id", session.user.id)
    .order("estimated_at", { ascending: false })
    .limit(1)
    .single()

  const { data: scoreHistory } = await supabase
    .from("credit_scores")
    .select("score, calculated_at")
    .eq("user_id", session.user.id)
    .order("calculated_at", { ascending: true })
    .limit(10)

  const { data: transactionCount } = await supabase
    .from("transactions")
    .select("id", { count: "exact" })
    .eq("user_id", session.user.id)

  const tierColors: Record<string, string> = {
    strong: "text-green-600",
    low_risk: "text-blue-600",
    medium_risk: "text-amber-600",
    high_risk: "text-red-600",
  }

  const tierLabels: Record<string, string> = {
    strong: "Strong Profile",
    low_risk: "Low Risk",
    medium_risk: "Medium Risk",
    high_risk: "High Risk",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-alu-blue">
          Hello, {userProfile?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-alu-gray-dark text-sm">Here is your Credit Passport overview</p>
      </div>

      {!latestScore ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-alu-border">
          <div className="w-16 h-16 bg-alu-blue-pale rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-alu-blue text-2xl">📊</span>
          </div>
          <h2 className="font-bold text-alu-blue mb-2">No Score Yet</h2>
          <p className="text-alu-gray-dark text-sm mb-4">
            Add at least 10 transactions to generate your Credit Passport Score.
            You currently have {transactionCount?.length ?? 0} transaction(s).
          </p>
          <a
            href="/transactions"
            className="inline-block bg-alu-blue text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-alu-blue-light transition-colors"
          >
            Add Transactions
          </a>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-6 border border-alu-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-alu-blue">Credit Passport Score</h2>
              <span className={`text-sm font-medium ${tierColors[latestScore.score_tier]}`}>
                {tierLabels[latestScore.score_tier]}
              </span>
            </div>
            <ScoreGauge score={latestScore.score} tier={latestScore.score_tier} />
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { label: "Income Consistency", value: latestScore.income_consistency, weight: "35%" },
                { label: "Savings Behaviour", value: latestScore.savings_behaviour, weight: "25%" },
                { label: "Payment History", value: latestScore.payment_history, weight: "25%" },
                { label: "Transaction Frequency", value: latestScore.transaction_frequency, weight: "15%" },
              ].map(({ label, value, weight }) => (
                <div key={label} className="bg-alu-blue-pale rounded-xl p-3">
                  <p className="text-xs text-alu-gray-dark">{label} ({weight})</p>
                  <p className="text-lg font-bold text-alu-blue">{Math.round(value)}/100</p>
                  <div className="w-full bg-white rounded-full h-1.5 mt-1">
                    <div
                      className="bg-alu-blue h-1.5 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {eligibility && (
            <div className="bg-white rounded-2xl p-6 border border-alu-border">
              <h2 className="font-bold text-alu-blue mb-4">Loan Readiness</h2>
              <div className="space-y-4">
                <LoanReadinessBar label="Bank Loan" percentage={eligibility.bank_readiness_pct} />
                <LoanReadinessBar label="Mobile Money Loan" percentage={eligibility.mobile_money_pct} />
                <LoanReadinessBar label="Digital Lender" percentage={eligibility.digital_lender_pct} />
              </div>
            </div>
          )}

          {scoreHistory && scoreHistory.length > 1 && (
            <div className="bg-white rounded-2xl p-6 border border-alu-border">
              <h2 className="font-bold text-alu-blue mb-4">Score Trend</h2>
              <ScoreTrendChart data={scoreHistory} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

---

### 2.15 Score Gauge Component

`components/dashboard/ScoreGauge.tsx`:

```tsx
"use client"
import { ScoreTier } from "@/types"

interface Props {
  score: number
  tier: ScoreTier
}

const tierColor: Record<ScoreTier, string> = {
  strong: "#16A34A",
  low_risk: "#2563EB",
  medium_risk: "#D97706",
  high_risk: "#DC2626",
}

export default function ScoreGauge({ score, tier }: Props) {
  const percentage = (score / 1000) * 100
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={tierColor[tier]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-alu-blue">{score}</span>
          <span className="text-xs text-alu-gray-dark">out of 1000</span>
        </div>
      </div>
    </div>
  )
}
```

---

### 2.16 Loan Readiness Bar Component

`components/dashboard/LoanReadinessBar.tsx`:

```tsx
interface Props {
  label: string
  percentage: number
}

export default function LoanReadinessBar({ label, percentage }: Props) {
  const color =
    percentage >= 70 ? "bg-green-500" :
    percentage >= 50 ? "bg-blue-500" :
    percentage >= 30 ? "bg-amber-500" : "bg-red-400"

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-bold text-alu-blue">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-alu-gray rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

---

### 2.17 Score Trend Chart Component

`components/dashboard/ScoreTrendChart.tsx`:

```tsx
"use client"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface Props {
  data: { score: number; calculated_at: string }[]
}

export default function ScoreTrendChart({ data }: Props) {
  const labels = data.map(d =>
    new Date(d.calculated_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })
  )

  const chartData = {
    labels,
    datasets: [{
      label: "Credit Score",
      data: data.map(d => d.score),
      borderColor: "#1B3A6B",
      backgroundColor: "rgba(27, 58, 107, 0.08)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#1B3A6B",
      pointRadius: 4,
    }],
  }

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 1000, grid: { color: "#F3F4F6" } },
      x: { grid: { display: false } },
    },
  }

  return <Line data={chartData} options={options} />
}
```

---

### 2.18 Transactions Page

`app/(dashboard)/transactions/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TransactionForm from "@/components/transactions/TransactionForm"
import TransactionList from "@/components/transactions/TransactionList"
import CSVUpload from "@/components/transactions/CSVUpload"

export default async function TransactionsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("transaction_date", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-alu-blue">Transactions</h1>
        <p className="text-alu-gray-dark text-sm">Add your mobile money activity to build your score</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-alu-border">
        <h2 className="font-bold text-alu-blue mb-4">Add Transaction</h2>
        <TransactionForm userId={session.user.id} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-alu-border">
        <h2 className="font-bold text-alu-blue mb-4">Upload CSV</h2>
        <CSVUpload userId={session.user.id} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-alu-border">
        <h2 className="font-bold text-alu-blue mb-4">Recent Transactions</h2>
        <TransactionList transactions={transactions ?? []} />
      </div>
    </div>
  )
}
```

---

### 2.19 Transaction Form Component

`components/transactions/TransactionForm.tsx`:

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TransactionType, TransactionSource } from "@/types"

export default function TransactionForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    amount_ghs: "",
    type: "income" as TransactionType,
    source: "mobile_money" as TransactionSource,
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from("transactions").insert({
      user_id: userId,
      transaction_date: form.transaction_date,
      amount_ghs: parseFloat(form.amount_ghs),
      type: form.type,
      source: form.source,
      description: form.description,
    })

    if (!error) {
      setSuccess(true)
      setForm({ ...form, amount_ghs: "", description: "" })
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          Transaction added successfully
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            required
            value={form.transaction_date}
            onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
            className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GHS)</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={form.amount_ghs}
            onChange={(e) => setForm({ ...form, amount_ghs: e.target.value })}
            placeholder="0.00"
            className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
            className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="savings">Savings</option>
            <option value="bill_payment">Bill Payment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value as TransactionSource })}
            className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
          >
            <option value="mobile_money">Mobile Money</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g. Weekly market income"
          className="w-full border border-alu-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alu-blue"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-alu-blue text-white py-3 rounded-lg font-medium hover:bg-alu-blue-light transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  )
}
```

---

### 2.20 CSV Upload Component

`components/transactions/CSVUpload.tsx`:

```tsx
"use client"
import { useState } from "react"
import Papa from "papaparse"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Upload } from "lucide-react"

export default function CSVUpload({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]
        const validRows = rows.filter(row =>
          row.transaction_date &&
          row.amount_ghs &&
          parseFloat(row.amount_ghs) > 0 &&
          ["income", "expense", "savings", "bill_payment"].includes(row.type) &&
          ["mobile_money", "cash", "bank_transfer"].includes(row.source)
        )

        if (validRows.length === 0) {
          setResult({ error: "No valid rows found. Check your CSV format." })
          setLoading(false)
          return
        }

        const transactions = validRows.map(row => ({
          user_id: userId,
          transaction_date: row.transaction_date,
          amount_ghs: parseFloat(row.amount_ghs),
          type: row.type,
          source: row.source,
          description: row.description || "",
        }))

        const { error } = await supabase.from("transactions").insert(transactions)

        if (error) {
          setResult({ error: "Failed to upload transactions. Please try again." })
        } else {
          setResult({ success: `${transactions.length} transactions uploaded successfully.` })
          router.refresh()
        }

        setLoading(false)
      },
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-alu-gray-dark">
        Upload a CSV file with columns: <code className="bg-alu-blue-pale px-1 rounded text-xs">transaction_date, amount_ghs, type, source, description</code>
      </p>

      {result?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          {result.success}
        </div>
      )}

      {result?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {result.error}
        </div>
      )}

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-alu-border rounded-xl p-8 cursor-pointer hover:border-alu-blue transition-colors">
        <Upload size={24} className="text-alu-gray-dark mb-2" />
        <span className="text-sm text-alu-gray-dark">
          {loading ? "Uploading..." : "Click to upload CSV file"}
        </span>
        <input type="file" accept=".csv" onChange={handleFile} className="hidden" disabled={loading} />
      </label>
    </div>
  )
}
```

---

### 2.21 Transaction List Component

`components/transactions/TransactionList.tsx`:

```tsx
import { Transaction } from "@/types"

const typeLabels: Record<string, string> = {
  income: "Income",
  expense: "Expense",
  savings: "Savings",
  bill_payment: "Bill Payment",
}

const typeColors: Record<string, string> = {
  income: "bg-green-100 text-green-700",
  expense: "bg-red-100 text-red-700",
  savings: "bg-blue-100 text-blue-700",
  bill_payment: "bg-amber-100 text-amber-700",
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="text-alu-gray-dark text-sm text-center py-6">
        No transactions yet. Add your first one above.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-3 border-b border-alu-border last:border-0">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[t.type]}`}>
              {typeLabels[t.type]}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800">{t.description || t.source.replace("_", " ")}</p>
              <p className="text-xs text-alu-gray-dark">{new Date(t.transaction_date).toLocaleDateString("en-GH")}</p>
            </div>
          </div>
          <span className={`font-bold text-sm ${t.type === "expense" ? "text-red-600" : "text-green-600"}`}>
            {t.type === "expense" ? "-" : "+"}GHS {t.amount_ghs.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
```

---

### 2.22 Score Page (Calculate Score)

`app/(dashboard)/score/page.tsx`:

```tsx
"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ScorePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleCalculate = async () => {
    setLoading(true)
    setMessage("")

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-score`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: session.user.id }),
      }
    )

    const data = await response.json()

    if (data.error) {
      setMessage(data.error)
    } else {
      setMessage(`Score calculated: ${data.score}/1000`)
      router.push("/dashboard")
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-alu-blue">Calculate My Score</h1>
        <p className="text-alu-gray-dark text-sm">Generate your Credit Passport Score from your transaction history</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-alu-border text-center">
        <p className="text-alu-gray-dark text-sm mb-6">
          Make sure you have added at least 10 transactions before calculating your score.
          Each calculation analyses your last 90 days of activity.
        </p>

        {message && (
          <div className={`rounded-lg p-3 mb-4 text-sm ${
            message.includes("error") || message.includes("Minimum")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="bg-alu-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-alu-blue-light transition-colors disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Calculate My Score"}
        </button>
      </div>
    </div>
  )
}
```

---

### 2.23 Recommendations Page

`app/(dashboard)/recommendations/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RecommendationCard from "@/components/recommendations/RecommendationCard"

export default async function RecommendationsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_completed", false)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-alu-blue">Recommendations</h1>
        <p className="text-alu-gray-dark text-sm">Steps to improve your Credit Passport Score</p>
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-alu-border">
          <p className="text-alu-gray-dark text-sm">
            No recommendations yet. Calculate your score first to get personalised tips.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 2.24 Recommendation Card Component

`components/recommendations/RecommendationCard.tsx`:

```tsx
import { Recommendation } from "@/types"
import { TrendingUp, PiggyBank, CreditCard, Activity } from "lucide-react"

const factorConfig: Record<string, { label: string; icon: any; color: string }> = {
  income: { label: "Income Consistency", icon: TrendingUp, color: "text-green-600 bg-green-50" },
  savings: { label: "Savings Behaviour", icon: PiggyBank, color: "text-blue-600 bg-blue-50" },
  payments: { label: "Payment History", icon: CreditCard, color: "text-amber-600 bg-amber-50" },
  frequency: { label: "Transaction Frequency", icon: Activity, color: "text-purple-600 bg-purple-50" },
}

export default function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const config = factorConfig[recommendation.factor]
  const Icon = config.icon
  const progress = Math.min((recommendation.current_progress / recommendation.target_value) * 100, 100)

  return (
    <div className="bg-white rounded-2xl p-5 border border-alu-border">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-xl ${config.color}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-alu-blue text-sm">{config.label}</p>
          <p className="text-alu-gray-dark text-sm mt-1">{recommendation.action_text}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-alu-gray-dark mb-1">
              <span>Progress</span>
              <span>{Math.round(recommendation.current_progress)} / {recommendation.target_value}</span>
            </div>
            <div className="w-full bg-alu-gray rounded-full h-2">
              <div
                className="bg-alu-blue h-2 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 2.25 Profile Page

`app/(dashboard)/profile/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-alu-blue">My Profile</h1>
        <p className="text-alu-gray-dark text-sm">Your account information</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-alu-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-alu-blue rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-alu-blue text-lg">{user?.full_name}</p>
            <p className="text-alu-gray-dark text-sm">{session.user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Phone Number", value: user?.phone_number },
            { label: "Occupation", value: user?.occupation_type?.replace("_", " ") },
            { label: "Member Since", value: new Date(user?.created_at).toLocaleDateString("en-GH") },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-3 border-b border-alu-border last:border-0">
              <span className="text-sm text-alu-gray-dark">{label}</span>
              <span className="text-sm font-medium text-gray-800 capitalize">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## PART 3 — RUNNING THE PROJECT

### 3.1 Deploy Edge Function to Supabase

```bash
npx supabase login
npx supabase functions deploy calculate-score
```

### 3.2 Run Frontend Locally

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:3000`

### 3.3 Deploy Frontend to Vercel

```bash
npx vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## PART 4 — CSV FORMAT FOR USERS

Tell users their CSV file must follow this exact format:

```csv
transaction_date,amount_ghs,type,source,description
2026-01-05,500.00,income,mobile_money,Weekly market sales
2026-01-06,50.00,savings,mobile_money,Weekly savings
2026-01-07,30.00,bill_payment,mobile_money,Electricity bill
2026-01-08,20.00,expense,cash,Transport
```

---

## PART 5 — SECURITY CHECKLIST

- All tables have RLS enabled — users only access their own data
- Passwords handled entirely by Supabase Auth using bcrypt
- JWT tokens expire after 30 minutes of inactivity
- HTTPS enforced at Vercel level
- No financial data stored on client devices
- Edge Function runs server-side — scoring logic is not exposed to the browser
- CSV files parsed client-side and discarded after upload — raw files never stored

---

## PART 6 — SCORE TIERS REFERENCE

| Score Range | Tier | Meaning |
|---|---|---|
| 800 – 1000 | Strong Profile | Eligible for most financing channels |
| 600 – 799 | Low Risk | Good eligibility for mobile money and digital lenders |
| 400 – 599 | Medium Risk | Eligible for some digital lending products |
| 0 – 399 | High Risk | Needs improvement — follow recommendations |