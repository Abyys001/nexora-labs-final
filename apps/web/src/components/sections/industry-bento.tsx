"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { BrandIcon, type BrandIconName } from "@/components/icons/brand-icons"
import type { Industry } from "@/content/industries"
import { cn } from "@/lib/utils"

const groupOrder = ["Financial", "Commerce & Consumer", "Industrial & Mobility", "Public & Knowledge"] as const

// Serialisable subset of `Industry` — the lucide `icon` component can't cross the server/client boundary.
export type IndustryTile = Pick<Industry, "slug" | "name" | "tagline" | "summary" | "group"> & { brandIcon: BrandIconName }

/** Filterable bento grid of industries: a segmented control plus a mixed-size card grid, replacing four repeated sector-by-sector sections. */
export function IndustryBento({ industries }: { industries: IndustryTile[] }) {
  const [active, setActive] = useState<"all" | (typeof groupOrder)[number]>("all")
  const filtered = active === "all" ? industries : industries.filter((i) => i.group === active)

  return (
    <div>
      <div role="tablist" aria-label="Filter industries by category" className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(["all", ...groupOrder] as const).map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={active === g}
            onClick={() => setActive(g)}
            className={cn(
              "shrink-0 snap-start rounded-full border px-4 py-2 font-mono text-xs tracking-wide whitespace-nowrap uppercase transition-colors duration-300",
              active === g ? "border-black bg-black text-white" : "border-border bg-background text-foreground/60 hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {g === "all" ? "All sectors" : g}
          </button>
        ))}
      </div>

      <div key={active} className="animate-in fade-in-0 slide-in-from-bottom-1 mt-8 grid gap-4 duration-300 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((industry, i) => (
          <Link
            key={industry.slug}
            href={`/industries/${industry.slug}`}
            className={cn(
              "card-lift reveal group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/25",
              i === 0 && "sm:col-span-2 sm:p-8",
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-soft text-foreground transition-colors duration-300 group-hover:border-transparent group-hover:bg-black group-hover:text-white [--icon-accent:var(--lime)]">
              <BrandIcon name={industry.brandIcon} className="size-6" />
            </span>
            <h3 className={cn("mt-5 font-semibold", i === 0 ? "text-2xl" : "text-lg")}>{industry.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{industry.tagline}</p>
            {i === 0 ? <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/70">{industry.summary}</p> : null}
            <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold">
              <span className="link-underline">Explore</span> <ArrowUpRight className="arrow-nudge size-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
