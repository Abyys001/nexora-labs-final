import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { BrandIcon } from "@/components/icons/brand-icons"
import { PointerSurface } from "@/components/motion/pointer-surface"
import { Reveal } from "@/components/motion/reveal"
import { getService, type Service } from "@/content/services"
import { cn } from "@/lib/utils"

function fromPrice(service: Service) {
  return service.price.range.split(/[–-]/)[0]?.trim()
}

function TileFooter({ service, dark }: { service: Service; dark?: boolean }) {
  return (
    <div className="mt-auto flex items-end justify-between gap-4 pt-6">
      <span className={cn("font-mono text-[0.7rem] tracking-wide", dark ? "text-white/45" : "text-muted-foreground")}>
        from <span className={dark ? "text-lime" : "text-foreground"}>{fromPrice(service)}</span>
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-sm font-semibold transition-colors",
          dark ? "text-white/70 group-hover:text-lime" : "text-foreground/60 group-hover:text-foreground",
        )}
      >
        Explore
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </span>
    </div>
  )
}

function IconTile({ service, dark, large }: { service: Service; dark?: boolean; large?: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-2xl border transition-colors duration-300 [--icon-accent:var(--lime)]",
        large ? "size-16" : "size-12",
        dark ? "border-white/10 bg-white/[0.04] text-white group-hover:border-lime/40" : "border-border bg-soft text-foreground group-hover:border-foreground/20 group-hover:bg-black group-hover:text-white",
      )}
    >
      <BrandIcon name={service.brandIcon} className={large ? "size-9" : "size-7"} />
    </span>
  )
}

function Tile({ service, className, children }: { service: Service; className?: string; children: ReactNode }) {
  return (
    <Link href={`/services/${service.slug}`} className={cn("group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-6 outline-offset-4 sm:p-7", className)}>
      {children}
    </Link>
  )
}

/** Home "What we build": a bento where each tile uses a different interaction (glow, reveal, shift, lift). */
export function ServicesBento() {
  const ai = getService("ai-solutions")
  const software = getService("software-development")
  const mobile = getService("mobile-app-development")
  const rest = ["web-development", "crm-business-systems", "automation-integrations", "cloud-devops", "ecommerce", "data-analytics"]
    .map(getService)
    .filter((s): s is Service => Boolean(s))

  if (!ai || !software || !mobile) return null

  return (
    <div className="grid auto-rows-[minmax(0,auto)] gap-4 md:grid-cols-6 lg:grid-cols-12">
      {/* Glow + motion: AI on a living network field */}
      <Reveal className="md:col-span-6 lg:col-span-7 lg:row-span-2">
        <PointerSurface className="card-glow dark h-full rounded-[1.75rem] bg-black text-foreground">
          <Tile service={ai} className="min-h-[420px] lg:min-h-[520px]">
            <svg aria-hidden="true" viewBox="0 0 400 300" className="decor-drift pointer-events-none absolute -right-10 -bottom-6 w-[85%] text-lime opacity-30 transition-opacity duration-500 group-hover:opacity-70 [--drift-r:0deg] [--drift-x:-12px]">
              {[
                [40, 60, 150, 40], [150, 40, 260, 90], [260, 90, 360, 50], [40, 60, 120, 170], [120, 170, 150, 40],
                [120, 170, 240, 200], [240, 200, 260, 90], [240, 200, 350, 230], [350, 230, 360, 50], [120, 170, 70, 260], [240, 200, 200, 280],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" pathLength={1} strokeDasharray="0.5 0.5" className="animate-dash [--dash-duration:6s]" />
              ))}
              {[[40, 60], [150, 40], [260, 90], [360, 50], [120, 170], [240, 200], [350, 230], [70, 260], [200, 280]].map(([cx, cy], i) => (
                <rect key={i} x={cx - 4} y={cy - 4} width="8" height="8" rx="1.5" fill={i % 3 === 0 ? "currentColor" : "#000"} stroke="currentColor" strokeWidth="1.5" />
              ))}
            </svg>
            <div aria-hidden="true" className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <IconTile service={ai} dark large />
                <span className="rounded-full border border-lime/30 bg-lime/10 px-3 py-1 font-mono text-[0.68rem] tracking-wide text-lime">most requested</span>
              </div>
              <h3 className="mt-10 max-w-md text-3xl leading-tight sm:text-4xl">{ai.name}</h3>
              <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-white/65">{ai.summary}</p>
              <ul className="mt-6 flex max-w-md flex-wrap gap-2">
                {ai.provides.slice(0, 4).map((item) => (
                  <li key={item.title} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">{item.title}</li>
                ))}
              </ul>
              <TileFooter service={ai} dark />
            </div>
          </Tile>
        </PointerSurface>
      </Reveal>

      {/* Reveal: extra detail slides in */}
      <Reveal delay={80} className="md:col-span-3 lg:col-span-5">
        <div className="card-lift h-full rounded-[1.75rem] border border-border bg-background">
          <Tile service={software} className="min-h-[250px]">
            <IconTile service={software} />
            <h3 className="mt-6 text-xl">{software.name}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{software.summary}</p>
            <div className="reveal-extra mt-0 group-hover:mt-4">
              <ul className="space-y-1.5 text-sm text-foreground/80">
                {software.includes.slice(0, 3).map((line) => (
                  <li key={line} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-[2px] bg-foreground" />{line}</li>
                ))}
              </ul>
            </div>
            <TileFooter service={software} />
          </Tile>
        </div>
      </Reveal>

      {/* Image shift: phone mockup follows the pointer */}
      <Reveal delay={160} className="md:col-span-3 lg:col-span-5">
        <PointerSurface className="card-lift dark h-full overflow-hidden rounded-[1.75rem] bg-ink-800 text-foreground">
          <Tile service={mobile} className="min-h-[250px] pr-[42%]">
            <div aria-hidden="true" className="pointer-shift absolute top-6 -right-4 bottom-[-40%] w-[40%] [--shift:14px]">
              <div className="h-full rounded-[1.6rem] border border-white/15 bg-black p-2 shadow-2xl">
                <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-white/20" />
                <div className="space-y-2 [&>div]:transition-transform [&>div]:duration-500">
                  <div className="h-14 rounded-xl bg-lime group-hover:-translate-y-1" />
                  <div className="h-8 rounded-lg bg-white/10 group-hover:translate-x-1" />
                  <div className="h-8 rounded-lg bg-white/[0.06]" />
                  <div className="grid grid-cols-2 gap-2"><div className="h-10 rounded-lg bg-white/10" /><div className="h-10 rounded-lg bg-white/[0.06]" /></div>
                </div>
              </div>
            </div>
            <IconTile service={mobile} dark />
            <h3 className="mt-6 text-xl">{mobile.navLabel}</h3>
            <p className="mt-2 leading-relaxed text-white/60">{mobile.summary}</p>
            <TileFooter service={mobile} dark />
          </Tile>
        </PointerSurface>
      </Reveal>

      {/* Compact lift tiles */}
      {rest.map((service, i) => (
        <Reveal key={service.slug} delay={80 * (i % 3)} className="md:col-span-3 lg:col-span-4">
          <PointerSurface className="card-glow card-lift h-full rounded-[1.75rem] border border-border bg-background">
            <Tile service={service} className="min-h-[220px]">
              <div className="flex items-start justify-between gap-4">
                <IconTile service={service} />
                <span className="font-mono text-[0.68rem] text-muted-foreground">{service.category.toLowerCase()}</span>
              </div>
              <h3 className="mt-6 text-lg">{service.name}</h3>
              <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-muted-foreground">{service.summary}</p>
              <TileFooter service={service} />
            </Tile>
          </PointerSurface>
        </Reveal>
      ))}
    </div>
  )
}
