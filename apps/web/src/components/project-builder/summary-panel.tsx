"use client"

import type { Estimate, PricingCatalog } from "@cybercina/pricing"
import { Clock3, Gauge, TrendingUp, Users } from "lucide-react"
import { useMemo } from "react"

import { TweenedNumber } from "@/components/motion/tweened-number"
import { builderLabel } from "@/content/project-builder"
import { formatMoney, itemMap } from "@/lib/catalog"
import { cn } from "@/lib/utils"

import type { BuilderState } from "./use-builder-state"

const adjustmentIcon = { complexity: Gauge, scale: Users, timeline: Clock3 } as const

/** Groups shown in the live configuration list, in the order the builder collects them. */
const groups: { key: "solutionTypes" | "industries" | "goals" | "features" | "platforms" | "integrations" | "ai" | "design"; label: string }[] = [
  { key: "solutionTypes", label: "Solution" },
  { key: "industries", label: "Industry" },
  { key: "goals", label: "Goals" },
  { key: "features", label: "Features" },
  { key: "platforms", label: "Platforms" },
  { key: "integrations", label: "Integrations" },
  { key: "ai", label: "AI" },
  { key: "design", label: "Design" },
]

export function SummaryBody({
  state,
  catalog,
  estimate,
  currency,
  toCurrency,
  compact = false,
}: {
  state: BuilderState
  catalog: PricingCatalog
  estimate: Estimate
  currency: string
  toCurrency: (gbp: number) => number
  compact?: boolean
}) {
  const items = useMemo(() => itemMap(catalog), [catalog])
  const timelineAdjustment = estimate.adjustments.find((a) => a.key === "timeline")
  const total = toCurrency(estimate.total)
  const symbolOnly = formatMoney(0, currency).replace(/[\d.,\s]/g, "")

  return (
    <div className="grid gap-5">
      <div>
        <p className="font-mono text-[0.7rem] tracking-[0.14em] text-white/45 uppercase">Estimated investment</p>
        <p className="mt-1 flex items-baseline gap-2 font-heading text-3xl text-lime">
          <TweenedNumber value={total} prefix={symbolOnly} />
        </p>
        <p className="mt-1 font-mono text-xs text-white/45">
          Indicative range {formatMoney(toCurrency(estimate.range.low), currency)} – {formatMoney(toCurrency(estimate.range.high), currency)}
        </p>
        {currency !== "GBP" ? (
          <p className="mt-1 font-mono text-[0.7rem] text-white/35">Base {formatMoney(estimate.total, "GBP")} · converted at today&apos;s rate</p>
        ) : null}
      </div>

      {estimate.lines.length ? (
        <dl className="grid gap-1.5 border-t border-white/10 pt-4 font-mono text-xs">
          {estimate.lines.map((line) => (
            <div key={line.key} className="flex items-baseline justify-between gap-3">
              <dt className="text-white/55">
                {line.label}
                {line.detail ? <span className="ml-1.5 text-white/30">{line.detail}</span> : null}
              </dt>
              <dd className="shrink-0 text-white/80">{formatMoney(toCurrency(line.amount), currency)}</dd>
            </div>
          ))}
          <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-white/10 pt-2">
            <dt className="text-white/45">Subtotal</dt>
            <dd className="shrink-0 text-white/70">{formatMoney(toCurrency(estimate.subtotal), currency)}</dd>
          </div>
        </dl>
      ) : null}

      {estimate.adjustments.length ? (
        <ul className="grid gap-2 border-t border-white/10 pt-4">
          {estimate.adjustments.map((adjustment) => {
            const Icon = adjustmentIcon[adjustment.key]
            const zero = adjustment.amount === 0
            return (
              <li key={adjustment.key} className="pb-chip-in grid gap-1">
                <div className="flex items-baseline justify-between gap-3 font-mono text-xs">
                  <span className="flex items-center gap-1.5 text-white/55">
                    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                    {adjustment.label}
                    <span className="text-white/30">×{adjustment.multiplier.toFixed(2)}</span>
                  </span>
                  <span className={cn("shrink-0", zero ? "text-white/40" : adjustment.amount > 0 ? "text-lime" : "text-white/70")}>
                    {zero ? "No change" : `${adjustment.amount > 0 ? "+" : "−"}${formatMoney(Math.abs(toCurrency(adjustment.amount)), currency)}`}
                  </span>
                </div>
                {!compact && !zero ? <p className="text-[0.7rem] leading-snug text-white/35">{adjustment.reason}</p> : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      {timelineAdjustment && timelineAdjustment.amount !== 0 ? (
        <p className="flex items-start gap-2 rounded-xl border border-lime/25 bg-lime/[0.05] p-3 text-[0.72rem] leading-snug text-white/70">
          <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-lime" aria-hidden="true" />
          <span>
            <span className="font-semibold text-white">{timelineAdjustment.label}</span> delivery adds{" "}
            <span className="font-semibold text-lime">{formatMoney(toCurrency(timelineAdjustment.amount), currency)}</span> — compressing the schedule means
            dedicated capacity and parallel workstreams.
          </span>
        </p>
      ) : null}

      {estimate.monthly.support > 0 || estimate.monthly.maintenance > 0 ? (
        <dl className="grid gap-1.5 border-t border-white/10 pt-4 font-mono text-xs">
          <p className="text-[0.7rem] tracking-[0.12em] text-white/35 uppercase">Ongoing, per month</p>
          {estimate.monthly.support > 0 ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/55">Support</dt>
              <dd className="text-white/80">{formatMoney(toCurrency(estimate.monthly.support), currency)}</dd>
            </div>
          ) : null}
          {estimate.monthly.maintenance > 0 ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/55">Maintenance</dt>
              <dd className="text-white/80">{formatMoney(toCurrency(estimate.monthly.maintenance), currency)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {!compact ? (
        <div className="grid gap-3 border-t border-white/10 pt-4">
          {groups.map((group) => {
            const ids = state[group.key]
            if (!ids.length) return null
            return (
              <div key={group.key}>
                <p className="font-mono text-[0.65rem] tracking-[0.12em] text-white/35 uppercase">{group.label}</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {ids.map((id) => (
                    <li key={id} className="pb-chip-in rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.72rem] text-white/75">
                      {group.key === "industries" || group.key === "goals" ? builderLabel(group.key, id) : (items.get(id)?.label ?? id)}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      ) : null}

      <p className="border-t border-white/10 pt-4 text-[0.7rem] leading-relaxed text-white/35">
        This is an automated estimate from your selections, not a quote. We review every request and confirm a final commercial price in a written proposal.
      </p>
    </div>
  )
}

/** Sticky desktop rail. The scroll area carries the branded `.pb-scroll` bar. */
export function SummaryPanel(props: Parameters<typeof SummaryBody>[0]) {
  return (
    <aside aria-label="Live project summary" className="sticky top-24 hidden lg:block">
      <div className="window overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-lime/60" />
          </span>
          <span className="font-pixel text-[0.65rem] text-white/60">0x00C0DE · project.config</span>
        </div>
        <div className="pb-scroll max-h-[calc(100vh-11rem)] overflow-y-auto p-5">
          <SummaryBody {...props} />
        </div>
      </div>
    </aside>
  )
}
