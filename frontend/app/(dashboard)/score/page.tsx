"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalculatorIcon, Loader2Icon } from "lucide-react"

export default function ScorePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [supabase])

  const handleCalculate = async () => {
    if (!session) return

    setLoading(true)
    setMessage("")

    try {
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

      if (response.status === 404) {
        setMessage("Edge function not found. Did you run 'supabase functions deploy calculate-score'?")
        setLoading(false)
        return
      }

      let data
      try {
        data = await response.json()
      } catch (e) {
        setMessage(`Server returned an invalid response (${response.status})`)
        setLoading(false)
        return
      }

      if (data.error) {
        setMessage(data.error)
      } else {
        setMessage(`Success! Your new score is ${data.score}/1000. Redirecting to dashboard...`)
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 2000)
      }
    } catch (err: any) {
      setMessage(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Calculate My Score</h1>
        <p className="text-muted-foreground">
          Generate your Credit Passport Score from your transaction history
        </p>
      </div>

      <div className="max-w-2xl mt-4">
        <Card className="w-full relative overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-8 shadow-sm">
               <CalculatorIcon className="size-10" />
            </div>
            
            <h2 className="text-xl font-semibold tracking-tight mb-4">Ready to analyze your history?</h2>
            
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-md">
              Make sure you have added <span className="font-semibold text-foreground">at least 10 transactions</span> before calculating your score.
              Our algorithm will analyze your last 90 days of activity to estimate your creditworthiness.
            </p>

            {message && (
              <div className={`rounded-xl p-4 mb-8 text-sm flex items-center justify-center font-medium shadow-sm transition-all duration-300 w-full ${
                message.includes("error") || message.includes("Minimum") || message.includes("unexpected")
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              }`}>
                {message}
              </div>
            )}

            <Button
              onClick={handleCalculate}
              disabled={loading || !session}
              size="lg"
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-2" />
                  Analyzing Profile...
                </>
              ) : "Calculate My Score"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
