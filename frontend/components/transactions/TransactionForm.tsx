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
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="bg-green-50/80 backdrop-blur-sm border-l-4 border-green-500 text-green-700 rounded-r-lg p-4 text-sm flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Transaction added successfully! Keep building that score.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-alu-gray-dark uppercase tracking-wider mb-1.5">Date</label>
          <input
            type="date"
            required
            value={form.transaction_date}
            onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
            className="w-full bg-alu-gray/50 border border-alu-border/80 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-alu-blue-light/50 focus:border-alu-blue transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-alu-gray-dark uppercase tracking-wider mb-1.5">Amount (GHS)</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={form.amount_ghs}
            onChange={(e) => setForm({ ...form, amount_ghs: e.target.value })}
            placeholder="0.00"
            className="w-full bg-alu-gray/50 border border-alu-border/80 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-alu-blue-light/50 focus:border-alu-blue transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-alu-gray-dark uppercase tracking-wider mb-1.5">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
            className="w-full bg-alu-gray/50 border border-alu-border/80 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-alu-blue-light/50 focus:border-alu-blue transition-all duration-200 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="savings">Savings</option>
            <option value="bill_payment">Bill Payment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-alu-gray-dark uppercase tracking-wider mb-1.5">Source</label>
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value as TransactionSource })}
            className="w-full bg-alu-gray/50 border border-alu-border/80 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-alu-blue-light/50 focus:border-alu-blue transition-all duration-200 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
          >
            <option value="mobile_money">Mobile Money</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-alu-gray-dark uppercase tracking-wider mb-1.5">Description (optional)</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g. Weekly market income"
          className="w-full bg-alu-gray/50 border border-alu-border/80 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-alu-blue-light/50 focus:border-alu-blue transition-all duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-alu-blue to-alu-blue-light text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:from-alu-blue-light hover:to-alu-blue transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        ) : "Add Transaction"}
      </button>
    </form>
  )
}
