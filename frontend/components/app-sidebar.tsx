"use client"

import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  SettingsIcon,
  LifeBuoyIcon,
  LandmarkIcon,
  TrendingUpIcon,
  LineChartIcon,
} from "lucide-react"

interface UserProfile {
  name: string
  email: string
  avatar: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile: UserProfile
}

export function AppSidebar({ userProfile, ...props }: AppSidebarProps) {
  const data = {
    navMain: [
      { title: "Overview", url: "/dashboard", icon: <LayoutDashboardIcon /> },
      { title: "Transactions", url: "/transactions", icon: <ArrowLeftRightIcon /> },
      { title: "Credit Score", url: "/score", icon: <LineChartIcon /> },
      { title: "Recommendations", url: "/recommendations", icon: <TrendingUpIcon /> },
    ],
    navSecondary: [
      { title: "Need Support?", url: "/support", icon: <LifeBuoyIcon /> },
    ],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LandmarkIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Credit Passport</span>
                <span className="truncate text-xs text-muted-foreground">
                  Finance Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Credit Profile" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userProfile} />
      </SidebarFooter>
    </Sidebar>
  )
}
