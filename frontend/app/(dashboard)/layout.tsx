import { AppSidebar } from "@/components/app-sidebar"
import { CommandPalette } from "@/components/command-palette"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let userProfile = {
    name: "User",
    email: session?.user?.email || "",
    avatar: "",
  }

  if (session) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", session.user.id)
      .single()
    
    if (profile?.full_name) {
      userProfile.name = profile.full_name
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar userProfile={userProfile} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <DynamicBreadcrumb />
          </div>
          <div className="ml-auto flex items-center gap-2 pr-4">
            <ThemeToggle />
          </div>
        </header>
        <CommandPalette />
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
