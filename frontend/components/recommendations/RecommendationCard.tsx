import { Recommendation } from "@/types"
import { TrendingUp, PiggyBank, CreditCard, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const factorConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  income: { label: "Income Consistency", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  savings: { label: "Savings Behaviour", icon: PiggyBank, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  payments: { label: "Payment History", icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  frequency: { label: "Transaction Frequency", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
}

export default function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const config = factorConfig[recommendation.factor] || factorConfig.frequency
  const Icon = config.icon
  const progress = Math.min((recommendation.current_progress / recommendation.target_value) * 100, 100)

  return (
    <Card className={`relative overflow-hidden group ${config.border}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 opacity-50`}></div>
      
      <CardContent className="p-6">
        <div className="flex items-start gap-5 relative z-10">
          <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
            <Icon size={24} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-base">{config.label}</p>
            <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{recommendation.action_text}</p>
            <div className="mt-5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                <span>Goal Progress</span>
                <span className={config.color}>{Math.round(recommendation.current_progress)} / {recommendation.target_value}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${config.bg.replace('/10', '')}`}
                  style={{ width: `${progress}%`, backgroundColor: 'currentColor' }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
