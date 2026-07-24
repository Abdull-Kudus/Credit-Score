import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)

  const { data: { session } } = await supabase.auth.getSession()

  const protectedRoutes = ["/dashboard", "/transactions", "/score", "/recommendations", "/profile", "/settings"]
  const authRoutes = ["/login", "/register"]
  const path = request.nextUrl.pathname

  // Redirect to login if accessing a protected route without a session
  if (!session && protectedRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if accessing login/register while already authenticated
  if (session && authRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
