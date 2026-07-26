"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheetIcon, Loader2Icon } from "lucide-react"

interface ExportReportButtonProps {
  userProfile?: any
  latestScore?: any
  scoreHistory?: any[]
  transactions?: any[]
  label?: string
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return ""
  const str = String(val)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function ExportReportButton({
  userProfile,
  latestScore,
  scoreHistory = [],
  transactions = [],
  label = "Export Report (CSV)",
}: ExportReportButtonProps) {
  const [exporting, setExporting] = React.useState(false)

  const handleExport = () => {
    setExporting(true)
    try {
      const rows: string[][] = []

      // Section 1: Header
      rows.push(["=== CREDIT PASSPORT FINANCIAL REPORT ==="])
      rows.push(["Generated On", escapeCsv(new Date().toLocaleString("en-GB"))])
      if (userProfile?.full_name) {
        rows.push(["Account Name", escapeCsv(userProfile.full_name)])
      }
      if (userProfile?.email) {
        rows.push(["Email", escapeCsv(userProfile.email)])
      }
      rows.push([])

      // Section 2: Score Overview
      if (latestScore) {
        rows.push(["=== LATEST CREDIT SCORE OVERVIEW ==="])
        rows.push(["Overall Credit Score (out of 1000)", escapeCsv(latestScore.score)])
        rows.push(["Calculated Date", escapeCsv(new Date(latestScore.calculated_at).toLocaleDateString("en-GB"))])
        rows.push(["Income Consistency Score", escapeCsv(`${Math.round(latestScore.income_consistency)}/100`)])
        rows.push(["Savings Behavior Score", escapeCsv(`${Math.round(latestScore.savings_behaviour)}/100`)])
        rows.push(["Payment History Score", escapeCsv(`${Math.round(latestScore.payment_history)}/100`)])
        rows.push(["Transaction Activity Score", escapeCsv(`${Math.round(latestScore.transaction_frequency)}/100`)])
        rows.push([])
      }

      // Section 3: Score History
      if (scoreHistory.length > 0) {
        rows.push(["=== CREDIT SCORE PROGRESSION HISTORY ==="])
        rows.push(["Date", "Score (out of 1000)"])
        scoreHistory.forEach((item) => {
          rows.push([
            escapeCsv(new Date(item.calculated_at).toLocaleDateString("en-GB")),
            escapeCsv(item.score),
          ])
        })
        rows.push([])
      }

      // Section 4: Transaction History
      if (transactions.length > 0) {
        rows.push(["=== MOBILE MONEY TRANSACTION HISTORY ==="])
        rows.push(["Date", "Reference/Merchant", "Type", "Amount (GHS)", "Balance After (GHS)"])
        transactions.forEach((tx) => {
          rows.push([
            escapeCsv(new Date(tx.transaction_date).toLocaleDateString("en-GB")),
            escapeCsv(tx.reference || tx.transaction_type),
            escapeCsv(tx.transaction_type),
            escapeCsv(tx.amount),
            escapeCsv(tx.balance_after || 0),
          ])
        })
      }

      if (rows.length <= 5 && transactions.length === 0 && !latestScore) {
        rows.push(["No credit score or transaction history available yet."])
      }

      // Convert to CSV string
      const csvContent = rows.map((e) => e.join(",")).join("\n")

      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      const fileName = `Credit_Passport_Report_${new Date().toISOString().split("T")[0]}.csv`
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      size="sm"
      className="gap-2 shadow-sm font-medium hover:bg-secondary transition-all"
    >
      {exporting ? (
        <Loader2Icon className="size-4 animate-spin text-primary" />
      ) : (
        <FileSpreadsheetIcon className="size-4 text-primary" />
      )}
      <span>{label}</span>
    </Button>
  )
}
