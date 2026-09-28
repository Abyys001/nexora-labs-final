import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { BrandIcon } from "@/components/icons/brand-icons"
import type { Service } from "@/content/services"
import { cn } from "@/lib/utils"

// Most ranges read "£X – £Y" (take the low end); a few read "From £X / month" already.
function fromPrice(service: Service) {
  const range = service.price.range.replace(/^from\s+/i, "")
  return range.split(/[–-]/)[0]?.trim()
}

/**
 * `variant` picks the hover behaviour so a grid of these doesn't read as one
 * repeated effect: `lift` (default, border+shadow), `glow` (pointer-tracked
 * lime spotlight — wrap in `<PointerSurface>`) or `dark` (black tile, icon
 * lights up lime).
 */
export function ServiceCard({
  service,
  featured = false,
  showPrice = false,
  variant = "lift",
}: {
  service: Service
  featured?: boolean
  showPrice?: boolean
  variant?: "lift" | "glow" | "dark"
}) {
  const dark = variant === "dark" || featured
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "reveal group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-colors duration-300 sm:p-8",
        dark
          ? "dark border-white/10 bg-black text-foreground hover:border-lime/40"
          : "border-border bg-card text-card-foreground hover:border-foreground/25",
        variant === "lift" && "card-lift",
        variant === "glow" && "card-glow",
      )}
    >
      {dark ? <div aria-hidden="true" className="absolute -top-20 -right-20 size-60 rounded-full bg-lime/20 blur-3xl transition-all duration-500 group-hover:bg-lime/30" /> : null}
      <div className="relative flex items-start justify-between">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border transition-colors duration-300 [--icon-accent:var(--lime)]",
            dark ? "border-white/10 bg-white/[0.04] text-white group-hover:border-lime/40" : "border-border bg-soft text-foreground group-hover:border-foreground/20 group-hover:bg-black group-hover:text-white",
          )}
        >
          <BrandIcon name={service.brandIcon} className="size-[22px]" />
        </span>
        <ArrowUpRight className={cn("arrow-nudge size-5 transition-colors", dark ? "text-white/40 group-hover:text-lime" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
      </div>
      <h3 className="relative mt-8 text-xl">{service.name}</h3>
      <p className={cn("relative mt-2.5 leading-relaxed", dark ? "text-white/60" : "text-muted-foreground")}>{service.summary}</p>
      {showPrice ? (
        <p className="relative mt-auto pt-6 font-mono text-xs tracking-wide">
          <span className={dark ? "text-white/45" : "text-muted-foreground"}>from </span>
          <span className={dark ? "text-lime" : "text-foreground"}>{fromPrice(service)}</span>
        </p>
      ) : null}
    </Link>
  )
}
