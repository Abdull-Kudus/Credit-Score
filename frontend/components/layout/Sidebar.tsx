"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowUpDown, Star, Lightbulb, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowUpDown },
  { href: "/score", label: "My Score", icon: Star },
  { href: "/recommendations", label: "Tips & Growth", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-alu-blue to-[#0A1A33] text-white z-20 shadow-2xl overflow-hidden">
      {/* Premium glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-alu-blue-light/20 rounded-full blur-3xl"></div>
      
      <div className="p-8 relative z-10">
        <div className="flex items-center gap-4 mb-2 hover-lift cursor-pointer" onClick={() => router.push('/dashboard')}>
          <div className="w-12 h-12 bg-gradient-to-tr from-white to-alu-blue-pale rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
            <span className="text-alu-blue text-lg font-black tracking-tighter">CS</span>
          </div>
          <div>
            <p className="font-extrabold text-lg tracking-tight">Credit Score</p>
            <p className="text-white/60 text-xs font-medium tracking-wide uppercase">Passport</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 relative z-10">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                isActive
                  ? "bg-white/10 text-white shadow-inner backdrop-blur-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors duration-200 ${isActive ? "text-alu-blue-pale" : "text-white/50 group-hover:text-white/80"}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 relative z-10">
        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 mb-4 text-center group hover:bg-white/10 transition-colors">
          <p className="text-xs text-white/80 mb-2">Need help?</p>
          <a href="mailto:abdulkuduszakaria360@gmail.com" className="block text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors w-full">
            Contact Support
          </a>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-200 group"
        >
          <LogOut size={20} className="text-white/50 group-hover:text-red-400 transition-colors" strokeWidth={2} />
          Secure Log Out
        </button>
      </div>
    </aside>
  )
}
