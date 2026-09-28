import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { BrandIcon } from "@/components/icons/brand-icons"
import type { Industry } from "@/content/industries"
import { cn } from "@/lib/utils"

/** `variant="dark"` for use inside a dark section (e.g. an audience-segment rail). */
export function IndustryCard({ industry, variant = "light" }: { industry: Industry; variant?: "light" | "dark" }) {
  const dark = variant === "dark"
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className={cn(
        "card-lift reveal group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-colors duration-300",
        dark ? "dark border-white/10 bg-black text-foreground hover:border-lime/40" : "border-border bg-card hover:border-foreground/25",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand media, blends via mix-blend-screen */}
      <img
        src="/media/signal-wave.webp"
        alt=""
        width={280}
        height={280}
        loading="lazy"
        className="decor-drift media-screen pointer-events-none absolute -right-10 -bottom-10 -z-0 w-40 opacity-0 transition-opacity duration-500 group-hover:opacity-60 [--drift-r:0deg] [--drift-x:-6px] [--drift-y:-6px]"
      />
      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl border transition-colors duration-300 [--icon-accent:var(--lime)]",
            dark ? "border-white/10 bg-white/[0.04] text-white group-hover:border-lime/40" : "border-border bg-soft text-foreground group-hover:border-foreground/20 group-hover:bg-black group-hover:text-white",
          )}
        >
          <BrandIcon name={industry.brandIcon} className="size-6" />
        </span>
        <ArrowUpRight className={cn("arrow-nudge size-4 opacity-0 transition-opacity group-hover:opacity-100", dark ? "text-lime" : "text-foreground/60")} aria-hidden="true" />
      </div>
      <h3 className="relative mt-6 font-semibold">{industry.name}</h3>
      <p className={cn("relative mt-2 text-sm leading-relaxed", dark ? "text-white/60" : "text-muted-foreground")}>{industry.tagline}</p>
    </Link>
  )
}
