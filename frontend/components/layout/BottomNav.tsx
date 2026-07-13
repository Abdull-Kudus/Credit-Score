"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowUpDown, Star, Lightbulb, User } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Txns", icon: ArrowUpDown },
  { href: "/score", label: "Score", icon: Star },
  { href: "/recommendations", label: "Tips", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-alu-border/50 z-30 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex-1 flex flex-col items-center justify-center gap-1.5 py-2 transition-all duration-300 group"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-alu-blue rounded-b-full transform -translate-y-2"></div>
              )}
              
              <div className={`p-1.5 rounded-xl transition-colors duration-300 ${isActive ? "bg-alu-blue/10 text-alu-blue" : "text-alu-gray-dark group-hover:bg-alu-gray"}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-alu-blue" : "text-alu-gray-dark"}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
