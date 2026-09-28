"use client"

import {
  CreditCard,
  Inbox,
  KanbanSquare,
  LayoutGrid,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Tags,
  Users,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ComponentType } from "react"

import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { useAdmin } from "./admin-context"
import type { AdminRole } from "./api"

const RANK: Record<AdminRole, number> = { viewer: 0, manager: 1, owner: 2 }

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }>; minRole: AdminRole }

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, minRole: "viewer" },
  { href: "/admin/requests", label: "Requests", icon: Inbox, minRole: "viewer" },
  { href: "/admin/pipeline", label: "Pipeline", icon: KanbanSquare, minRole: "viewer" },
  { href: "/admin/proposals", label: "Proposals", icon: ScrollText, minRole: "viewer" },
  { href: "/admin/payments", label: "Payments", icon: Wallet, minRole: "viewer" },
  { href: "/admin/portfolio", label: "Portfolio", icon: LayoutGrid, minRole: "viewer" },
  { href: "/admin/pricing", label: "Pricing", icon: Tags, minRole: "viewer" },
  { href: "/admin/currencies", label: "Currencies", icon: CreditCard, minRole: "viewer" },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText, minRole: "manager" },
  { href: "/admin/admins", label: "Admins", icon: Users, minRole: "owner" },
]

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`)
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const admin = useAdmin()
  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-0.5">
      {navItems
        .filter((item) => RANK[admin.role] >= RANK[item.minRole])
        .map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] uppercase transition-colors",
                active ? "bg-lime text-ink-800" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
    </nav>
  )
}

/** Desktop: fixed dark column. Mobile: trigger button in the header opens the same nav in a Sheet. */
export function DesktopSidebar() {
  return (
    // The wrapper carries the colour so the rail still reads as a full-height
    // column on pages taller than the viewport; the inner aside is what sticks.
    <div className="dark hidden w-60 shrink-0 border-r border-white/10 bg-ink-800 lg:block">
      <aside className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto p-3">
        <NavLinks />
      </aside>
    </div>
  )
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false)
  const admin = useAdmin()
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-lg" className="lg:hidden" aria-label="Open navigation">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="dark w-72 border-white/10 bg-ink-800 p-0 text-white">
        <SheetHeader className="border-b border-white/10">
          <SheetTitle className="text-white">{admin.name || admin.email}</SheetTitle>
          <p className="font-mono text-xs text-white/50 capitalize">{admin.role}</p>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-white/10 p-3">
          <SheetClose asChild>
            <form action={logout}>
              <Button type="submit" variant="outline" size="lg" className="w-full border-white/15 bg-transparent text-white hover:bg-white/5">
                <LogOut data-icon="inline-start" /> Sign out
              </Button>
            </form>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
