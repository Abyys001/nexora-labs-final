"use client"

import type { CSSProperties } from "react"
import { useState } from "react"

import { LogoMark } from "@/components/layout/logo"
import { cn } from "@/lib/utils"

export type TechGroup = { name: string; blurb: string; items: { name: string; slug?: string }[] }

/** Monochrome logo via CSS mask so it inherits text colour (Simple Icons ship as single-path SVGs). */
export function TechLogo({ slug, name, className }: { slug?: string; name: string; className?: string }) {
  if (!slug) {
    return (
      <span aria-hidden="true" className={cn("flex items-center justify-center font-mono text-[0.7rem] font-bold", className)}>
        {name.slice(0, 2).toUpperCase()}
      </span>
    )
  }
  const mask = `url(/logos/${slug}.svg) center / contain no-repeat`
  return <span aria-hidden="true" className={cn("block bg-current", className)} style={{ mask, WebkitMask: mask } as CSSProperties} />
}

/** Interactive ecosystem: pick a capability group and its tools orbit the Nexora core. */
export function TechEcosystem({ groups }: { groups: TechGroup[] }) {
  const [active, setActive] = useState(0)
  const group = groups[active]
  if (!group) return null
  const items = group.items.slice(0, 10)

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" role="list">
        {groups.map((g, i) => {
          const selected = i === active
          return (
            <li key={g.name}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                className={cn(
                  "group w-full rounded-2xl border p-5 text-left transition-all duration-300",
                  selected ? "border-lime/50 bg-lime/[0.06]" : "border-white/10 hover:border-white/25",
                )}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold text-white">{g.name}</span>
                  <span className={cn("font-mono text-xs", selected ? "text-lime" : "text-white/40")}>{String(g.items.length).padStart(2, "0")} tools</span>
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-white/55">{g.blurb}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div aria-live="polite" className="relative mx-auto aspect-square w-full max-w-[520px]">
        <p className="sr-only">
          {group.name}: {group.items.map((i) => i.name).join(", ")}
        </p>
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute inset-[4%] rounded-full border border-dashed border-white/10" />
          <div className="animate-orbit absolute inset-[4%] rounded-full [--orbit-duration:40s]">
            <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-lime shadow-[0_0_12px_var(--lime)]" />
          </div>
          <div className="absolute inset-[26%] rounded-full border border-white/[0.07]" />
          <div className="absolute inset-[36%] rounded-full bg-lime/15 blur-3xl" />

          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
            <LogoMark className="size-16 drop-shadow-[0_0_24px_rgb(191_247_71/0.35)]" />
            <span className="font-pixel text-[0.62rem] text-white/60">{group.name.toLowerCase()}</span>
          </div>

          {items.map((item, i) => {
            const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2
            const x = 50 + Math.cos(angle) * 42
            const y = 50 + Math.sin(angle) * 42
            return (
              <div
                key={`${group.name}-${item.name}`}
                className="group/logo animate-in fade-in-0 zoom-in-75 absolute -translate-x-1/2 -translate-y-1/2 fill-mode-both duration-500"
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 50}ms` } as CSSProperties}
              >
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-ink-800 text-white/80 shadow-xl shadow-black/40 transition-all duration-300 group-hover/logo:-translate-y-1 group-hover/logo:border-lime/50 group-hover/logo:text-lime sm:size-16">
                  <TechLogo slug={item.slug} name={item.name} className="size-6 sm:size-7" />
                </div>
                <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-md bg-white px-2 py-0.5 text-[0.7rem] font-medium whitespace-nowrap text-black opacity-0 transition-opacity group-hover/logo:opacity-100">
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
