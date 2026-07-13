import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TransactionForm from "@/components/transactions/TransactionForm"
import TransactionList from "@/components/transactions/TransactionList"
import CSVUpload from "@/components/transactions/CSVUpload"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { PlusIcon, FileUpIcon, ListIcon } from "lucide-react"

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: transactions } = await supabase
    .from("momo_transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("transaction_date", { ascending: false })
    .limit(50)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          Add your mobile money activity to build your credit score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
        
        {/* Left Column: Forms */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusIcon className="size-5 text-primary" />
                Add Manual Entry
              </CardTitle>
              <CardDescription>Manually record a single transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm userId={session.user.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUpIcon className="size-5 text-primary" />
                Upload Statement
              </CardTitle>
              <CardDescription>Upload a CSV exported from your provider</CardDescription>
            </CardHeader>
            <CardContent>
              <CSVUpload userId={session.user.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListIcon className="size-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
              <span className="text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
                Last 50 entries
              </span>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <TransactionList transactions={transactions ?? []} />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
