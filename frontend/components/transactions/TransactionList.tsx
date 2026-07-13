import { Transaction } from "@/types"

const typeLabels: Record<string, string> = {
  CASH_IN: "Cash In",
  CASH_OUT: "Cash Out",
  PAYMENT: "Payment",
  TRANSFER: "Transfer",
  DEBIT: "Debit",
  PAYMENT_SEND: "Payment Sent"
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-foreground font-semibold mb-1">No transactions found</p>
        <p className="text-muted-foreground text-sm">Add your first one above to start building your score.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => {
        const isIncome = (t.balance_after ?? 0) > (t.balance_before ?? 0) || t.transaction_type === "CASH_IN"
        
        return (
          <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-card border hover:bg-secondary/50 hover:shadow-sm transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className={`flex flex-col items-center justify-center size-12 rounded-full border ${isIncome ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                {isIncome ? <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> : <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.reference || t.transaction_type.replace("_", " ")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-medium">{new Date(t.transaction_date).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-secondary rounded-md">{typeLabels[t.transaction_type] || t.transaction_type}</span>
                </div>
              </div>
            </div>
            <span className={`font-semibold tracking-tight ${!isIncome ? "text-destructive" : "text-emerald-500"}`}>
              {!isIncome ? "-" : "+"}GHS {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
