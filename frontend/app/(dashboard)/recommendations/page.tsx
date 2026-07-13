import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import RecommendationCard from "@/components/recommendations/RecommendationCard"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LightbulbIcon, SparklesIcon } from "lucide-react"

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("is_completed", false)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Growth Tips</h1>
        <p className="text-muted-foreground">
          Personalised steps to improve your Credit Passport Score
        </p>
      </div>

      {!recommendations || recommendations.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
              <SparklesIcon className="size-6" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">You're all caught up!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              No active recommendations at the moment. Calculate your score to get fresh, personalised tips based on your latest transactions.
            </p>
            <Button size="lg" render={<Link href="/score" />} nativeButton={false}>
              Calculate Score
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  )
}
