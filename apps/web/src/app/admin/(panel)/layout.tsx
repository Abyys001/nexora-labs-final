import { LogOut } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { logout } from "@/app/actions/auth"
import { AdminContextProvider } from "@/components/admin/admin-context"
import type { AdminProfile } from "@/components/admin/api"
import { AdminProviders } from "@/components/admin/providers"
import { DesktopSidebar, MobileSidebarTrigger } from "@/components/admin/sidebar-nav"
import { LogoMark } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { adminApi } from "@/lib/server/session"

async function getAdmin(): Promise<AdminProfile | null> {
  try {
    const res = await adminApi("/auth/me")
    return res.ok ? ((await res.json()) as AdminProfile) : null
  } catch {
    return null
  }
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin()
  if (!admin) redirect("/admin/login")

  return (
    <AdminProviders>
      <AdminContextProvider admin={admin}>
        <header className="dark sticky top-0 z-40 border-b border-border bg-background text-foreground">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-5">
            <div className="flex items-center gap-3">
              <MobileSidebarTrigger />
              <Link href="/admin" className="flex items-center gap-2.5 font-semibold">
                <LogoMark className="size-7" /> Admin
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {admin.name || admin.email}
                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 font-mono text-[0.65rem] tracking-wide uppercase">{admin.role}</span>
              </span>
              <Button asChild variant="ghost" size="lg">
                <Link href="/" target="_blank">
                  View site
                </Link>
              </Button>
              <form action={logout}>
                <Button type="submit" variant="outline" size="lg">
                  <LogOut data-icon="inline-start" /> Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          <DesktopSidebar />
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </AdminContextProvider>
    </AdminProviders>
  )
}
