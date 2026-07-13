"use client"
import { useState, useEffect } from "react"
import Papa from "papaparse"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FileUp, CheckCircle, AlertCircle, FileText } from "lucide-react"

export default function StatementUpload({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)

  useEffect(() => {
    // Load pdf.js via CDN to bypass Next.js 16 Turbopack compiler issues with canvas
    if (typeof window !== "undefined" && !(window as any).pdfjsLib) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
      script.onload = () => {
        ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
      }
      document.head.appendChild(script)
    }
  }, [])

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (!(window as any).pdfjsLib) {
      throw new Error("PDF parser is still loading... Please wait a moment and try again.")
    }
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ""

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      fullText += pageText + " "
    }
    return fullText
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    // Handle PDF
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const rawText = await extractTextFromPDF(file)
        
        // Strip all arbitrary newlines and excess whitespace for consistent regex matching
        const cleanText = rawText.replace(/\s+/g, ' ')

        // Regex pattern tailored to standard MTN MoMo statement format
        // Expected groups: (1: Date) (2: Type) (3: Amount) (4: Fees) (5: E-Levy) (6: Bal Before) (7: Bal After)
        const regex = /(\d{2}-[A-Za-z]{3}-\d{4})\s+\d{2}:\d{2}:\d{2}\s+[AP]M.*? (PAYMENT|DEBIT|TRANSFER|CASH_IN|CASH_OUT|PAYMENT_SEND) ([\d\.]+) ([\d\.]+) ([\d\.]+) ([\d\.]+) ([\d\.]+)/g
        
        let match
        const parsedTransactions = []

        while ((match = regex.exec(cleanText)) !== null) {
          const dateStr = match[1] // e.g. "19-Nov-2024"
          const rawType = match[2] // e.g. "PAYMENT"
          const amountStr = match[3]
          const balBefore = parseFloat(match[6])
          const balAfter = parseFloat(match[7])



          // Format Date for Postgres: 'YYYY-MM-DD HH:mm:ss'
          const dateObj = new Date(dateStr)
          const formattedDate = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString()

          parsedTransactions.push({
            user_id: userId,
            transaction_date: formattedDate,
            transaction_type: rawType,
            amount: parseFloat(amountStr),
            fees: parseFloat(match[4]),
            e_levy: parseFloat(match[5]),
            balance_before: balBefore,
            balance_after: balAfter
          })
        }

        if (parsedTransactions.length === 0) {
          setResult({ error: "Could not extract any valid transactions from this PDF. Please verify the statement format." })
          setLoading(false)
          return
        }

        // Insert into Supabase
        const { error } = await supabase.from("momo_transactions").insert(parsedTransactions)

        if (error) {
          setResult({ error: `Failed to save transactions to database: ${error.message}` })
        } else {
          setResult({ success: `Success! Extracted and saved ${parsedTransactions.length} transactions from your PDF.` })
          router.refresh()
        }

      } catch (err: any) {
        setResult({ error: `An error occurred while processing the PDF: ${err.message}` })
      } finally {
        setLoading(false)
      }
      return
    }

    // Handle CSV
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
          setResult({ error: "We couldn't extract any valid transactions from this CSV. Please check the format." })
          setLoading(false)
          return
        }

        const transactions = validRows.map(row => ({
          user_id: userId,
          transaction_date: row.transaction_date,
          transaction_type: row.type,
          amount: parseFloat(row.amount_ghs),
          balance_before: 0,
          balance_after: 0
        }))

        const { error } = await supabase.from("momo_transactions").insert(transactions)

        if (error) {
          setResult({ error: `Failed to upload transactions: ${error.message}` })
        } else {
          setResult({ success: `${transactions.length} transactions securely uploaded.` })
          router.refresh()
        }

        setLoading(false)
      },
      error: () => {
        setResult({ error: "There was an issue reading your file. Please try again." })
        setLoading(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-alu-gray-dark mb-4">
        Upload your mobile money statement to instantly build your Credit Passport.
      </p>

      {result?.success && (
        <div className="bg-green-50/80 backdrop-blur-sm border-l-4 border-green-500 text-green-700 rounded-r-lg p-4 text-sm flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {result.success}
        </div>
      )}

      {result?.error && (
        <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 rounded-r-lg p-4 text-sm flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {result.error}
        </div>
      )}

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-alu-blue-light/30 bg-alu-blue-pale/20 rounded-2xl p-10 cursor-pointer hover:border-alu-blue hover:bg-alu-blue-pale/50 transition-all duration-300 group">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md text-alu-blue">
          {loading ? (
            <svg className="animate-spin h-6 w-6 text-alu-blue" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FileText size={28} />
          )}
        </div>
        <span className="text-sm font-bold text-alu-blue mb-1">
          {loading ? "Analyzing statement..." : "Click to upload statement"}
        </span>
        <span className="text-xs text-alu-gray-dark font-medium">Supports PDF and CSV</span>
        <input type="file" accept=".csv,.pdf" onChange={handleFile} className="hidden" disabled={loading} />
      </label>
    </div>
  )
}
