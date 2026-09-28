import { Reveal } from "@/components/motion/reveal"
import type { PricingFactor } from "@/content/pricing"
import { cn } from "@/lib/utils"

const impactMeter: Record<PricingFactor["impact"], number> = { Low: 1, Medium: 2, High: 3 }
const impactColor: Record<PricingFactor["impact"], string> = { Low: "bg-foreground/25", Medium: "bg-stone", High: "bg-lime" }

/**
 * Cost drivers as a graded meter rather than a plain feature grid: each factor
 * shows how much it typically moves a budget, so "what affects cost" reads as
 * a spectrum, not a flat checklist.
 */
export function PricingCostDrivers({ items }: { items: PricingFactor[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={i * 40} className="card-lift group rounded-2xl border border-border bg-card p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <span className="mt-0.5 shrink-0 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">{item.impact} impact</span>
          </div>
          <div className="mt-3.5 flex gap-1" aria-hidden="true">
            {[1, 2, 3].map((step) => (
              <span key={step} className={cn("h-1.5 flex-1 rounded-full bg-border transition-colors", step <= impactMeter[item.impact] && impactColor[item.impact])} />
            ))}
          </div>
          <p className="mt-4 leading-relaxed text-muted-foreground">{item.description}</p>
        </Reveal>
      ))}
    </ul>
  )
}
