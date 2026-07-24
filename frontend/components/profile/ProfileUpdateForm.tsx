"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react"

export default function ProfileUpdateForm({ user }: { user: any }) {
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const supabase = createClient()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus("idle")

    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error(error)
      setErrorMsg(error.message)
      setStatus("error")
    } else {
      setStatus("success")
      // Optionally revalidate the router if needed, but since we are modifying state here,
      // and it's just settings, success message is enough for feedback.
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleUpdate} className="flex flex-col gap-4 relative z-10 p-6 rounded-xl border bg-card">
      <h3 className="font-semibold text-lg">Update Profile Information</h3>
      
      <div className="flex flex-col gap-2 mt-2">
        <label htmlFor="full_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
        <Input 
          id="full_name" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          placeholder="e.g. John Doe"
          required
        />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label htmlFor="phone_number" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number</label>
        <Input 
          id="phone_number" 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          placeholder="e.g. +233 55 123 4567"
          required
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button type="submit" disabled={loading || (!fullName && !phoneNumber)}>
          {loading ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        {status === "success" && (
          <p className="flex items-center text-sm text-emerald-600 font-medium">
            <CheckCircle2Icon className="mr-1 h-4 w-4" />
            Profile updated successfully
          </p>
        )}
        {status === "error" && (
          <p className="flex items-center text-sm text-destructive font-medium">
            <AlertCircleIcon className="mr-1 h-4 w-4" />
            {errorMsg || "Failed to update profile"}
          </p>
        )}
      </div>
    </form>
  )
}
