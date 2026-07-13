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
  from_account?: string
  from_name?: string
  from_number?: string
  transaction_type: string
  amount: number
  fees?: number
  e_levy?: number
  balance_before?: number
  balance_after?: number
  to_number?: string
  to_name?: string
  to_account?: string
  f_id?: string
  reference?: string
  ova?: string
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
