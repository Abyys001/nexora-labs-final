"use client"

import type { PricingCatalog, PricingItem } from "@cybercina/pricing"
import { Plus, Search, Sparkles, X } from "lucide-react"
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react"

import { builderLabel, recommendations, resolveIcon } from "@/content/project-builder"
import { categoriesWithFeatures, formatMoney, itemMap, kindOf } from "@/lib/catalog"
import { activeRecommendations, missingDependencies, type RecommendationSelection } from "@/lib/project-estimate"
import { cn } from "@/lib/utils"

import { CardIcon, CheckMark, variantFor } from "./option-card"

/** Which builder list a suggested catalogue id belongs in, so one chip can add across groups. */
export type SuggestTarget = "features" | "integrations" | "ai" | "design"

const kindToList: Partial<Record<PricingItem["kind"], SuggestTarget>> = {
  feature: "features",
  integration: "integrations",
  ai: "ai",
  design: "design",
}

export function FeatureStep({
  catalog,
  currency,
  rate,
  selection,
  dismissed,
  onToggle,
  onAdd,
  onDismiss,
}: {
  catalog: PricingCatalog
  currency: string
  rate: (gbp: number) => number
  selection: RecommendationSelection
  dismissed: string[]
  onToggle: (id: string, on?: boolean) => void
  onAdd: (list: SuggestTarget, id: string) => void
  onDismiss: (ruleId: string) => void
}) {
  const categories = useMemo(() => categoriesWithFeatures(catalog), [catalog])
  const items = useMemo(() => itemMap(catalog), [catalog])
  const [active, setActive] = useState(categories[0]?.id ?? "")
  const [query, setQuery] = useState("")
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  const recs = useMemo(() => activeRecommendations(recommendations, selection, new Set(dismissed)), [selection, dismissed])
  const selected = selection.features

  const q = query.trim().toLowerCase()
  const visible: PricingItem[] = q
    ? categories.flatMap((c) => c.features).filter((f) => `${f.label} ${f.blurb}`.toLowerCase().includes(q))
    : (categories.find((c) => c.id === active) ?? categories[0])?.features ?? []

  function addSuggested(id: string) {
    const list = kindToList[kindOf(catalog, id) ?? "feature"]
    if (list) onAdd(list, id)
  }

  function onTabKey(e: KeyboardEvent, i: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + categories.length) % categories.length
    setActive(categories[next].id)
    tabRefs.current[next]?.focus()
  }

  if (categories.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
        The feature catalogue is unavailable right now. Continue and describe what you need in the project details step.
      </p>
    )
  }

  return (
    // minmax(0,1fr): the scrollable tab strip must not widen the track.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      {recs.length ? (
        <section aria-label="Smart recommendations" className="pb-reveal rounded-2xl border border-lime/25 bg-lime/[0.04] p-4 sm:p-5">
          <p className="flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.14em] text-lime uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" /> Smart recommendations
          </p>
          <ul className="mt-3 grid gap-4">
            {recs.slice(0, 3).map(({ rule, because, suggest }) => (
              <li key={rule.id} className="grid gap-2.5 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-white/70">
                    <span className="text-white/45">Because you selected </span>
                    {because.flatMap((b) => b.ids.map((id) => builderLabel(b.group, id))).map((label, i) => (
                      <span key={i}>
                        {i > 0 ? <span className="text-lime"> + </span> : null}
                        <span className="font-medium text-white">{label}</span>
                      </span>
                    ))}
                    <span className="mt-1 block text-white/50">{rule.reason}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onDismiss(rule.id)}
                    className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
                    aria-label="Dismiss this recommendation"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggest.map((id) => (
                    <SuggestChip key={id} label={items.get(id)?.label} onAdd={() => addSuggested(id)} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div
          role="tablist"
          aria-label="Feature categories"
          className={cn(
            "-mx-1 flex min-w-0 gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden",
            q && "opacity-40",
          )}
        >
          {categories.map((c, i) => {
            const count = c.features.filter((f) => selected.includes(f.id)).length
            const isActive = c.id === active && !q
            const Icon = resolveIcon(c.icon)
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${c.id}`}
                aria-selected={isActive}
                aria-controls={`${baseId}-panel`}
                tabIndex={isActive || (q && i === 0) ? 0 : -1}
                onKeyDown={(e) => onTabKey(e, i)}
                onClick={() => {
                  setActive(c.id)
                  setQuery("")
                }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-lime",
                  isActive ? "border-lime bg-lime text-ink" : "border-white/10 text-white/70 hover:border-white/30 hover:text-white",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {c.label}
                {count ? <span className={cn("rounded-full px-1.5 font-mono text-[0.7rem]", isActive ? "bg-ink/15" : "bg-lime/15 text-lime")}>{count}</span> : null}
              </button>
            )
          })}
        </div>
        <label className="relative block shrink-0 lg:w-56">
          <span className="sr-only">Search all features</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all features"
            className="h-10 w-full rounded-full border border-white/10 bg-ink-800 pr-3 pl-9 text-sm text-white placeholder:text-white/35 focus:border-lime/60 focus:outline-none"
          />
        </label>
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={q ? undefined : `${baseId}-tab-${active}`} aria-label={q ? `Features matching ${query}` : undefined}>
        {visible.length ? (
          <ul key={q ? "search" : active} className="pb-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((f, i) => (
              <li key={f.id} style={{ "--i": i } as React.CSSProperties}>
                <FeatureCard feature={f} index={i} currency={currency} rate={rate} selectedIds={selected} items={items} onToggle={onToggle} onAdd={addSuggested} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
            No feature matches &ldquo;{query}&rdquo;. Describe it in the project details step and we&apos;ll include it.
          </p>
        )}
      </div>
    </div>
  )
}

function SuggestChip({ label, onAdd }: { label: string | undefined; onAdd: () => void }) {
  if (!label) return null
  return (
    <button
      type="button"
      onClick={onAdd}
      className="group/chip inline-flex items-center gap-1.5 rounded-full border border-dashed border-lime/40 px-3 py-1.5 text-sm text-white/85 transition-colors hover:border-solid hover:border-lime hover:bg-lime hover:text-ink"
    >
      <Plus className="size-3.5 transition-transform group-hover/chip:rotate-90" aria-hidden="true" />
      {label}
      <span className="sr-only">— add to project</span>
    </button>
  )
}

function FeatureCard({
  feature,
  index,
  currency,
  rate,
  selectedIds,
  items,
  onToggle,
  onAdd,
}: {
  feature: PricingItem
  index: number
  currency: string
  rate: (gbp: number) => number
  selectedIds: readonly string[]
  items: Map<string, PricingItem>
  onToggle: (id: string, on?: boolean) => void
  onAdd: (id: string) => void
}) {
  const selected = selectedIds.includes(feature.id)
  const missing = selected ? missingDependencies(feature.recommends, selectedIds) : []
  const descId = `feat-${feature.id}-desc`
  const Icon = resolveIcon(feature.icon)

  return (
    <div
      data-variant={variantFor(index)}
      data-selected={selected}
      className={cn(
        "pb-card group relative flex h-full flex-col rounded-2xl border transition-colors",
        selected ? "border-lime/70 bg-lime/[0.07]" : "border-white/10 bg-ink-800 hover:border-white/25",
      )}
    >
      <button
        type="button"
        aria-pressed={selected}
        aria-describedby={descId}
        onClick={() => onToggle(feature.id)}
        className="flex flex-1 flex-col gap-3 rounded-2xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-lime sm:p-5"
      >
        <span className="flex items-start justify-between gap-3">
          <CardIcon icon={Icon} selected={selected} />
          <CheckMark selected={selected} />
        </span>
        <span className="block font-semibold text-white">{feature.label}</span>
        <span id={descId} className="block text-sm leading-snug text-white/55 transition-colors group-hover:text-white/80">
          {feature.blurb}
        </span>
        <span className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className={cn("pb-price font-mono text-xs transition-colors", selected ? "text-lime" : "text-white/45 group-hover:text-white/85")}>
            + {formatMoney(rate(feature.price), currency)}
          </span>
          {feature.recommends.length && !selected ? (
            <span className="font-mono text-[0.65rem] tracking-wide text-white/35 uppercase" title="Has recommended companion features">
              +{feature.recommends.length} linked
            </span>
          ) : null}
        </span>
      </button>

      {missing.length ? (
        <div className="pb-reveal border-t border-white/10 px-4 pt-3 pb-4 sm:px-5">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-lime/80 uppercase">Recommended with this feature</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {missing.map((id) => (
              <SuggestChip key={id} label={items.get(id)?.label} onAdd={() => onAdd(id)} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
