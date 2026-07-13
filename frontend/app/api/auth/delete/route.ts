import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  // Verify session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Delete from public.users (this cascades and wipes all transactions and scores)
  // We can't delete auth.users without the service_role key, but this effectively 
  // wipes all personal and financial data.
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", session.user.id)

  if (error) {
    console.error("Error deleting user data:", error)
  }

  // Sign out the user
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/login?deleted=true", request.url))
}
