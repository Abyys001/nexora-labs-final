"use client"

import { ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { useId, useRef, useState, type KeyboardEvent } from "react"

import { BrandIcon, type BrandIconName } from "@/components/icons/brand-icons"
import { cn } from "@/lib/utils"

export type IndustryOption = {
  slug: string
  name: string
  tagline: string
  summary: string
  challenges: string[]
  solutions: string[]
  icon: BrandIconName
  services: { name: string; href: string }[]
}

/** Horizontal industry rail (ARIA tabs) with a detail pane. Arrow keys move between industries. */
export function IndustrySelector({ options }: { options: IndustryOption[] }) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const current = options[active]

  function select(index: number, focus = false) {
    const next = (index + options.length) % options.length
    setActive(next)
    const tab = tabs.current[next]
    if (focus) tab?.focus()
    tab?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" })
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const moves: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: options.length - 1 }
    if (event.key in moves) {
      event.preventDefault()
      select(moves[event.key], true)
    }
  }

  if (!current) return null

  return (
    <div>
      <div className="relative -mx-5 sm:-mx-6 lg:mx-0">
        <div
          role="tablist"
          aria-label="Industries"
          className="flex snap-x gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:px-6 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {options.map((option, i) => {
            const selected = i === active
            return (
              <button
                key={option.slug}
                ref={(node) => {
                  tabs.current[i] = node
                }}
                role="tab"
                type="button"
                id={`${baseId}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={onKeyDown}
                className={cn(
                  "group flex shrink-0 snap-start items-center gap-2 rounded-full border py-2 pr-4 pl-2 text-sm font-medium whitespace-nowrap transition-all duration-300 [--icon-accent:var(--lime)]",
                  selected
                    ? "border-black bg-black text-white shadow-lg shadow-black/15"
                    : "border-border bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground",
                )}
              >
                <span className={cn("flex size-7 items-center justify-center rounded-full transition-colors", selected ? "bg-white/10" : "bg-soft")}>
                  <BrandIcon name={option.icon} className="size-[18px]" />
                </span>
                {option.name}
              </button>
            )
          })}
        </div>
      </div>

      <div
        key={current.slug}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${active}`}
        className="dark animate-in fade-in-0 slide-in-from-bottom-2 relative mt-6 grid overflow-hidden rounded-[2rem] bg-black text-foreground duration-500 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="relative isolate flex min-h-[340px] flex-col justify-between overflow-hidden p-7 sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand media */}
          <img src="/media/signal-wave.webp" alt="" width={564} height={564} loading="lazy" className="media-screen pointer-events-none absolute -right-24 -bottom-24 -z-10 w-[420px] opacity-50" />
          <div>
            <span className="icon-live flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-white [--icon-accent:var(--lime)]">
              <BrandIcon name={current.icon} className="size-12" />
            </span>
            <p className="mt-8 font-mono text-xs tracking-[0.16em] text-lime uppercase">{current.tagline}</p>
            <h3 className="mt-3 text-3xl leading-tight sm:text-4xl">{current.name}</h3>
            <p className="mt-4 max-w-md leading-relaxed text-white/65">{current.summary}</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {current.services.map((service) => (
              <Link key={service.href} href={service.href} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75 transition-colors hover:border-lime hover:text-lime">
                {service.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-px bg-white/[0.08] sm:grid-cols-2">
          <div className="bg-ink-800 p-7 sm:p-8">
            <p className="font-mono text-[0.7rem] tracking-[0.16em] text-white/45 uppercase">The challenge</p>
            <ul className="mt-5 space-y-3.5">
              {current.challenges.slice(0, 4).map((line) => (
                <li key={line} className="flex gap-3 text-[0.95rem] leading-snug text-white/75">
                  <span className="mt-1.5 size-2 shrink-0 rounded-[2px] border border-white/40" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col bg-ink-800 p-7 sm:p-8">
            <p className="font-mono text-[0.7rem] tracking-[0.16em] text-lime uppercase">What we build</p>
            <ul className="mt-5 space-y-3.5">
              {current.solutions.slice(0, 4).map((line) => (
                <li key={line} className="flex gap-3 text-[0.95rem] leading-snug text-white">
                  <Check className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            <Link href={`/industries/${current.slug}`} className="group mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-lime">
              Explore {current.name} <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
