"use client"

import { ArrowRight, Phone } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandIcon } from "@/components/icons/brand-icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { site } from "@/content/site"
import type { MenuColumn, ResolvedNavItem } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const triggerClass =
  "h-9 bg-transparent px-2.5 text-[0.875rem] font-medium text-foreground/75 hover:bg-white/[0.06] hover:text-foreground focus:bg-white/[0.06] data-open:bg-white/[0.06] data-open:text-foreground xl:px-3"

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function MegaPanel({ item }: { item: Extract<ResolvedNavItem, { kind: "mega" }> }) {
  const services = item.variant === "services"
  return (
    <div className="container-page">
      <div className="window overflow-hidden rounded-2xl! bg-ink-800!">
        <div className="grid grid-cols-[repeat(4,1fr)_0.9fr] gap-px bg-white/[0.06]">
          {item.columns.map((column) => (
            <MegaColumn key={column.title} column={column} dense={!services} />
          ))}
          <div className="relative flex flex-col justify-between overflow-hidden bg-black p-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny decorative pixel-art asset */}
            <img
              src={services ? "/media/signal-wave.webp" : "/media/wire-globe.webp"}
              alt=""
              width={200}
              height={202}
              className="media-screen pointer-events-none absolute -right-10 -bottom-10 w-56 opacity-60"
            />
            <p className="relative font-mono text-[0.7rem] tracking-[0.14em] text-lime uppercase">{services ? "Live estimate" : "19 sectors"}</p>
            <div className="relative">
              <p className="text-sm leading-relaxed text-white/80">
                {services
                  ? "Not sure what a project like this costs? Build it in our estimator and see a live range."
                  : "Different industries, the same approach: understand the business first."}
              </p>
              <NavigationMenuLink asChild>
                <Link href={services ? "/project-builder" : item.href} className="group mt-3 inline-flex p-0! text-sm font-semibold text-lime hover:bg-transparent!">
                  {services ? "Try the Project Builder" : "All industries"} <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
                </Link>
              </NavigationMenuLink>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-6 border-t border-white/[0.08] px-6 py-4 text-sm">
          <p className="text-white/60">
            Not sure what you need?{" "}
            <NavigationMenuLink asChild>
              <Link href="/contact" className="group inline-flex p-0! font-semibold text-foreground hover:bg-transparent! hover:text-lime">
                Talk to us <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
              </Link>
            </NavigationMenuLink>
          </p>
          <div className="flex items-center gap-5 font-mono text-xs text-white/50">
            <span>Projects from <span className="text-lime">£2,000</span></span>
            <NavigationMenuLink asChild>
              <Link href={item.href} className="p-0! text-white/70 hover:bg-transparent! hover:text-white">
                View all {item.label.toLowerCase()} →
              </Link>
            </NavigationMenuLink>
          </div>
        </div>
      </div>
    </div>
  )
}

function MegaColumn({ column, dense }: { column: MenuColumn; dense: boolean }) {
  return (
    <div className="bg-ink-800 p-5">
      <p className="font-mono text-[0.68rem] tracking-[0.16em] text-lime uppercase">{column.title}</p>
      <p className="mt-1 text-xs text-white/45">{column.blurb}</p>
      <ul className={cn("mt-4 grid", dense ? "gap-0.5" : "gap-1")}>
        {column.entries.map((entry) => (
          <li key={entry.href}>
            <NavigationMenuLink asChild>
              <Link href={entry.href} className={cn("group items-start! gap-3! rounded-xl! hover:bg-white/[0.05]!", dense ? "px-2! py-1.5!" : "px-2.5! py-2.5!")}>
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black text-white/80 transition-colors [--icon-accent:var(--lime)] group-hover:border-lime/40 group-hover:text-white",
                    dense ? "size-8" : "size-10",
                  )}
                >
                  <BrandIcon name={entry.icon} className={dense ? "size-5" : "size-6"} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{entry.label}</span>
                  {dense ? null : <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-white/50">{entry.description}</span>}
                </span>
              </Link>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DesktopNav({ items }: { items: ResolvedNavItem[] }) {
  const pathname = usePathname()

  return (
    <NavigationMenu viewport={false} className="static hidden lg:flex" aria-label="Main">
      <NavigationMenuList className="gap-0">
        {items.map((item) => {
          if (item.kind === "link") {
            const active = isActive(pathname, item.href)
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink asChild active={active}>
                  <Link href={item.href} className={cn(triggerClass, "relative inline-flex items-center rounded-lg whitespace-nowrap", active && "text-foreground")}>
                    {item.label}
                    {active ? <span aria-hidden="true" className="absolute inset-x-2.5 -bottom-[15px] h-0.5 rounded-full bg-lime" /> : null}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }
          if (item.kind === "mega") {
            // Fixed, not absolute: Radix wraps the list in a positioned div, and the header's
            // backdrop-filter makes the header the containing block for fixed descendants.
            return (
              <NavigationMenuItem key={item.label} className="static">
                <NavigationMenuTrigger className={cn(triggerClass, isActive(pathname, item.href) && "text-foreground")}>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent className="fixed! inset-x-0! top-full! left-0! mt-0! w-full! overflow-visible! rounded-none! bg-transparent! p-0! pt-2! shadow-none! ring-0!">
                  <MegaPanel item={item} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          }
          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger className={triggerClass}>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent className="border border-white/10 bg-ink-800! p-2! shadow-2xl shadow-black/50">
                <ul className="grid w-[320px] gap-0.5">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <NavigationMenuLink asChild>
                        <Link href={link.href} className="group flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 hover:bg-white/[0.05]">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            {link.label}
                            <ArrowRight className="size-3.5 -translate-x-1 text-lime opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                          </span>
                          {link.description ? <span className="text-xs leading-snug text-white/50">{link.description}</span> : null}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function HeaderPhone() {
  return (
    <a
      href={site.phone.href}
      className="group hidden items-center gap-1.5 rounded-lg px-2 py-2 font-mono text-[0.78rem] whitespace-nowrap text-foreground/70 transition-colors hover:text-foreground md:inline-flex xl:gap-2 xl:text-[0.8rem]"
    >
      <span className="relative hidden size-2 xl:flex" aria-hidden="true">
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-lime" />
        <span className="relative size-2 rounded-full bg-lime" />
      </span>
      <Phone className="size-3.5 text-lime" aria-hidden="true" />
      {site.phone.display}
    </a>
  )
}
