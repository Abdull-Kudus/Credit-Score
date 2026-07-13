import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HealthScore, type HealthFactor } from "@/components/dashboard/health-score"
import LoanReadinessBar from "@/components/dashboard/LoanReadinessBar"
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BanknoteIcon,
  LineChartIcon,
  UploadCloudIcon,
  ActivityIcon,
} from "lucide-react"

function getStatus(val: number): "excellent" | "good" | "fair" | "poor" {
  if (val >= 80) return "excellent";
  if (val >= 60) return "good";
  if (val >= 40) return "fair";
  return "poor";
}

export default async function DashboardPage() {
  const supabase = await createClient()
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

  let eligibility = null
  if (latestScore) {
    const { data: elig } = await supabase
      .from("loan_eligibility")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("score_id", latestScore.id)
      .single()
    eligibility = elig
  }

  const { data: scoreHistory } = await supabase
    .from("credit_scores")
    .select("score, calculated_at")
    .eq("user_id", session.user.id)
    .order("calculated_at", { ascending: true })
    .limit(10)

  const { count: transactionCount } = await supabase
    .from("momo_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id)

  let healthFactors: HealthFactor[] = []
  let overallScore = 0
  let trendDelta = 0
  let trendDirection: "up" | "down" = "up"

  if (latestScore) {
    overallScore = latestScore.score // Score is natively out of 1000
    
    if (scoreHistory && scoreHistory.length >= 2) {
      const prevScore = scoreHistory[scoreHistory.length - 2].score;
      trendDelta = Math.abs(overallScore - prevScore);
      trendDirection = overallScore >= prevScore ? "up" : "down";
    } else {
      trendDelta = 0;
      trendDirection = "up";
    }

    healthFactors = [
      {
        id: "hf1",
        label: "Income Consistency",
        score: Math.round(latestScore.income_consistency),
        status: getStatus(latestScore.income_consistency),
        description: "Evaluates the regularity and stability of your incoming funds over time.",
      },
      {
        id: "hf2",
        label: "Savings Behavior",
        score: Math.round(latestScore.savings_behaviour),
        status: getStatus(latestScore.savings_behaviour),
        description: "Measures your ability to retain funds rather than spending them immediately.",
      },
      {
        id: "hf4",
        label: "Payment History",
        score: Math.round(latestScore.payment_history),
        status: getStatus(latestScore.payment_history),
        description: "Tracks on-time payments for bills, utilities, and previous loans.",
      },
      {
        id: "hf6",
        label: "Transaction Activity",
        score: Math.round(latestScore.transaction_frequency),
        status: getStatus(latestScore.transaction_frequency),
        description: "Looks at how actively you use your account for day-to-day operations.",
      }
    ]
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here is an overview of your Credit Passport and financial readiness.
        </p>
      </div>

      {!latestScore ? (
        <Card className="w-full mt-4">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
              <ActivityIcon className="size-8" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Analysis Pending</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Upload your mobile money statements to generate your Credit Passport Score.
              You currently have <span className="font-semibold text-foreground">{transactionCount ?? 0}</span> transaction(s) recorded.
            </p>
            <Button size="lg" asChild className="gap-2">
              <a href="/transactions">
                <UploadCloudIcon className="size-4" />
                Upload Statements
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          
          {/* Left Column: Financial Health */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <HealthScore 
              overall={overallScore} 
              trend={trendDirection} 
              trendDelta={trendDelta} 
              factors={healthFactors} 
            />
          </div>

          {/* Right Column: Trend & Readiness */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Score Trend Card */}
            {scoreHistory && scoreHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="size-5 text-primary" />
                    Score Trend (out of 1000)
                  </CardTitle>
                  <CardDescription>Your credit score progression over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoreTrendChart data={scoreHistory} />
                </CardContent>
              </Card>
            )}

            {/* Loan Readiness Card */}
            {eligibility && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BanknoteIcon className="size-5 text-primary" />
                    Loan Readiness Estimates
                  </CardTitle>
                  <CardDescription>Your estimated approval odds across different lenders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LoanReadinessBar label="Traditional Bank Loan" percentage={eligibility.bank_readiness_pct} />
                  <LoanReadinessBar label="Mobile Money Loan" percentage={eligibility.mobile_money_pct} />
                  <LoanReadinessBar label="Digital Lender" percentage={eligibility.digital_lender_pct} />
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
