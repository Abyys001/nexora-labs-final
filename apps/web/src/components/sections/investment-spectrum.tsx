import type { CSSProperties } from "react"

import { Reveal } from "@/components/motion/reveal"
import type { PricingTier } from "@/content/pricing"
import { cn } from "@/lib/utils"

const MIN = 2000
const MAX = 60000
const ticks = [2000, 5000, 10000, 25000, 50000]

// Log scale: a £2k→£5k step matters as much to a buyer as £20k→£50k.
function position(value: number) {
  return (Math.log(value / MIN) / Math.log(MAX / MIN)) * 100
}

function short(value: number) {
  return `£${value / 1000}k`
}

/** Pricing as one calm horizontal scale rather than a SaaS price table. */
export function InvestmentSpectrum({ tiers, compact = false }: { tiers: PricingTier[]; compact?: boolean }) {
  return (
    <figure className="relative">
      <figcaption className="sr-only">Typical project investment ranges by project type, from £2,000 to £50,000 and above.</figcaption>

      <div aria-hidden="true" className="relative mb-6 ml-0 h-8 md:ml-[13rem]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/15" />
        {ticks.map((tick) => (
          <div key={tick} className="absolute bottom-0 -translate-x-1/2" style={{ left: `${position(tick)}%` }}>
            <span className="block font-mono text-[0.7rem] whitespace-nowrap text-muted-foreground">
              {short(tick)}
              {tick === 50000 ? "+" : ""}
            </span>
            <span className="mx-auto mt-1.5 block h-2 w-px bg-foreground/30" />
          </div>
        ))}
      </div>

      <ul className={cn("space-y-2", compact && "space-y-1")}>
        {tiers.map((tier, i) => {
          const left = position(tier.min)
          const right = tier.max ? position(tier.max) : 100
          return (
            <li key={tier.id}>
              <Reveal
                variant="fade"
                delay={i * 60}
                className="group grid items-center gap-2 rounded-xl px-0 py-2 transition-colors md:grid-cols-[13rem_1fr] md:gap-0 md:px-0 md:hover:bg-foreground/[0.03]"
              >
                <div className="flex items-baseline justify-between gap-3 md:block md:pr-6">
                  <span className="text-[0.95rem] font-semibold">{tier.name}</span>
                  <span className="font-mono text-xs text-muted-foreground md:mt-0.5 md:block">{tier.range}</span>
                </div>
                <div className="relative h-9">
                  <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-foreground/[0.08]" />
                  <div
                    className="spectrum-bar absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-foreground origin-left transition-transform duration-300 group-hover:scale-y-[1.35]"
                    style={
                      {
                        left: `${left}%`,
                        width: `${right - left}%`,
                        ...(tier.max ? {} : { maskImage: "linear-gradient(to right, #000 70%, transparent)" }),
                      } as CSSProperties
                    }
                  >
                    <span className="absolute top-1/2 left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border-2 border-foreground bg-lime" />
                  </div>
                </div>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
