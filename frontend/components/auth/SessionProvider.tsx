"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login")
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Session token refreshed automatically.")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return <>{children}</>
}
