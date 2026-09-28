import type { ReactNode } from "react"

import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs"
import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

import { Eyebrow } from "./section"

/**
 * Dark hero band shared by every inner page: bg-dots on true black, mono eyebrow,
 * Boldonse title (global h1 styling), optional right-side visual, and a rounded-t
 * cap that overlaps into whatever section follows — same seam as the homepage.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  actions,
  aside,
  next = "light",
  className,
}: {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  crumbs?: Crumb[]
  actions?: ReactNode
  aside?: ReactNode
  /** Tone of the section that follows, so the rounded cap matches it. */
  next?: "light" | "dark"
  className?: string
}) {
  return (
    <>
      <section className={cn("dark relative isolate overflow-hidden bg-black text-foreground", className)}>
        <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_70%)]" />
        <div aria-hidden="true" className="absolute -top-40 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.16] blur-[130px]" />
        <div className={cn("container-page pt-10", next === "dark" ? "pb-12 sm:pb-14" : "pb-24 sm:pb-28", "sm:pt-12", aside && "grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]")}>
          <div>
            {crumbs ? (
              <div className="mb-9">
                <Breadcrumbs items={crumbs} />
              </div>
            ) : null}
            {eyebrow ? (
              <Reveal variant="fade">
                <Eyebrow tone="dark" className="mb-5">{eyebrow}</Eyebrow>
              </Reveal>
            ) : null}
            <Reveal delay={80}>
              <h1 className="max-w-3xl text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]">{title}</h1>
            </Reveal>
            {intro ? (
              <Reveal delay={160}>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">{intro}</p>
              </Reveal>
            ) : null}
            {actions ? (
              <Reveal delay={240} className="mt-9 flex flex-col gap-3 sm:flex-row">
                {actions}
              </Reveal>
            ) : null}
          </div>
          {aside ? (
            <Reveal delay={160} variant="scale" className="relative">
              {aside}
            </Reveal>
          ) : null}
        </div>
      </section>
      <div
        aria-hidden="true"
        className={cn("relative z-10 -mt-8 h-8 rounded-t-[2.5rem] bg-background sm:-mt-10 sm:h-10", next === "dark" && "dark border-t border-white/10")}
      />
    </>
  )
}
