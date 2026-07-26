"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  TrendingUpIcon,
  LineChartIcon,
  SettingsIcon,
  LogInIcon,
  UserPlusIcon,
  LifeBuoyIcon,
  MoonIcon,
  SunIcon,
  MonitorIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const run = useCallback(
    (fn: () => void) => {
      setOpen(false)
      fn()
    },
    []
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search pages and settings"
    >
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {[
              { label: "Dashboard", icon: LayoutDashboardIcon, href: "/dashboard" },
              { label: "Transactions", icon: ArrowLeftRightIcon, href: "/transactions" },
              { label: "Credit Score", icon: LineChartIcon, href: "/score" },
              { label: "Recommendations", icon: TrendingUpIcon, href: "/recommendations" },
              { label: "Settings", icon: SettingsIcon, href: "/settings" },
              { label: "Help & Support", icon: LifeBuoyIcon, href: "/support" },
              { label: "Sign In", icon: LogInIcon, href: "/login" },
              { label: "Sign Up", icon: UserPlusIcon, href: "/register" },
            ].map((page) => (
              <CommandItem key={page.href} onSelect={() => run(() => router.push(page.href))}>
                <page.icon className="mr-2 size-4" />
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => run(() => setTheme("light"))}>
              <SunIcon className="mr-2 size-4" />
              Light Mode
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("dark"))}>
              <MoonIcon className="mr-2 size-4" />
              Dark Mode
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("system"))}>
              <MonitorIcon className="mr-2 size-4" />
              System Theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
