import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DeleteAccountButton from "@/components/profile/DeleteAccountButton"
import ProfileUpdateForm from "@/components/profile/ProfileUpdateForm"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SettingsIcon } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-2 mt-4 text-center items-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <SettingsIcon className="size-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account profile and preferences
        </p>
      </div>

      <Card className="w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="size-20 bg-primary rounded-full flex items-center justify-center shadow-md border-4 border-background overflow-hidden">
              {session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture ? (
                <img src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture} alt="Profile" className="size-full object-cover" />
              ) : (
                <span className="text-primary-foreground text-3xl font-bold">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-2xl tracking-tight">{user?.full_name}</p>
              <p className="text-muted-foreground text-sm font-medium mt-1">{session.user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            <ProfileUpdateForm user={user} />
            <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/50 border border-border/50 mt-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Since</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GH", { month: "long", year: "numeric" }) : "Not provided"}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/50 border border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Occupation</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {user?.occupation_type?.replace("_", " ") || "Not provided"}
              </span>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="relative z-10 flex flex-col gap-2 p-6 rounded-xl border border-destructive/20 bg-destructive/5">
            <h3 className="text-destructive font-semibold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your credit scores, transactions, and personal data will be permanently wiped.
            </p>
            <div className="flex">
              <DeleteAccountButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
