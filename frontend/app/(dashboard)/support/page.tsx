"use client"

import { useState } from "react"
import { submitSupportTicket } from "./actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LifeBuoyIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react"

export default function SupportPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    
    try {
      const result = await submitSupportTicket(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(true)
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Need Support?</h1>
        <p className="text-muted-foreground">
          Send a message to our system administration team. We're here to help!
        </p>
      </div>

      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Fill out the form below and we will get back to you shortly.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <CheckCircle2Icon className="size-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Message Sent!</h2>
              <p className="text-muted-foreground mb-8">
                Thank you for reaching out. A support agent will review your request and get back to your email shortly.
              </p>
              <Button onClick={() => setSuccess(false)} variant="outline">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form action={onSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Your Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">How can we help?</label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Please describe your issue or question in detail..."
                  required
                  className="min-h-[150px] resize-none"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full sm:w-auto mt-2">
                {loading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin mr-2" />
                    Sending Message...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
