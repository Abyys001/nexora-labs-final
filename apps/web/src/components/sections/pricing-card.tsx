import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import type { PricingTier } from "@/content/pricing"
import { cn } from "@/lib/utils"

/**
 * One row of the pricing breakdown, not a SaaS-style card: a wide mono range,
 * the tier name and who it suits, and a quiet link — laid out like an
 * itemised estimate rather than a plan you "buy".
 */
export function PricingCard({ tier, index = 0 }: { tier: PricingTier; index?: number }) {
  return (
    <Reveal delay={index * 60} className={cn("group border-b border-border py-8 first:pt-0 last:border-0 last:pb-0")}>
      <Link href={`/project-builder?type=${tier.id}`} className="grid gap-6 sm:grid-cols-[9rem_1fr_auto] sm:items-start sm:gap-8">
        <div>
          <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">Estimated investment</p>
          <p className="mt-1.5 text-2xl leading-none font-semibold tracking-tight">{tier.range}</p>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">{tier.name}</h3>
            {tier.featured ? <span className="rounded-full bg-lime px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold text-black">most requested</span> : null}
          </div>
          <p className="mt-2 leading-relaxed text-muted-foreground">{tier.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {tier.suitableFor.map((item) => (
              <li key={item} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70">{item}</li>
            ))}
          </ul>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors group-hover:text-foreground sm:mt-1">
          Discuss this <ArrowUpRight className="arrow-nudge size-4" aria-hidden="true" />
        </span>
      </Link>
    </Reveal>
  )
}
