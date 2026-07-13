import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)

  const { data: { session } } = await supabase.auth.getSession()

  const protectedRoutes = ["/dashboard", "/transactions", "/score", "/recommendations", "/profile"]
  const authRoutes = ["/login", "/register"]
  const path = request.nextUrl.pathname

  if (!session && protectedRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && authRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
