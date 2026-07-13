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
      .from("momo_transactions")
      .select("*")
      .eq("user_id", user_id)
      .order("transaction_date", { ascending: true })

    if (error) throw error
    if (!transactions || transactions.length < 10) {
      return new Response(
        JSON.stringify({ error: "Minimum 10 transactions required to calculate score" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    // --- SCORING ALGORITHM ---

    // Interpret MoMo transactions
    const incomeTransactions = transactions.filter((t: any) => t.balance_after > t.balance_before || t.transaction_type === "CASH_IN" || (t.transaction_type === "TRANSFER" && t.balance_after > t.balance_before))
    // We don't have a reliable way to detect savings from pure MoMo yet, so we will look for any external keyword or just default to low
    const savingsTransactions = transactions.filter((t: any) => t.reference && t.reference.toLowerCase().includes("savings"))
    const billPayments = transactions.filter((t: any) => t.transaction_type.includes("PAYMENT") || t.transaction_type === "DEBIT")

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
  } catch (error: any) {
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
  const amounts = incomeTransactions.map((t: any) => t.amount)
  const avgAmount = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length
  const variance = amounts.reduce((sum: number, a: number) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance)
  const stabilityScore = Math.max(0, 1 - stdDev / avgAmount)
  return Math.round(((consistency * 0.6 + stabilityScore * 0.4) * 100))
}

function calculateSavingsBehaviour(savingsTransactions: any[], allTransactions: any[]): number {
  if (savingsTransactions.length === 0) return 0
  const totalIncome = allTransactions
    .filter((t: any) => t.balance_after > t.balance_before)
    .reduce((sum: number, t: any) => sum + t.amount, 0)
  const totalSavings = savingsTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
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
  return transactions.reduce((groups: any, t: any) => {
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
