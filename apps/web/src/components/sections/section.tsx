import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const tones = {
  light: "bg-background",
  soft: "bg-soft",
  /** Light, but never flat: faint dot grid + lime wash. For long-reading sections that need texture. */
  wash: "bg-soft",
  dark: "dark bg-background text-foreground",
} as const

export function Section({
  tone = "light",
  className,
  children,
  id,
  labelledBy,
}: {
  tone?: keyof typeof tones
  className?: string
  children: ReactNode
  id?: string
  labelledBy?: string
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("relative section-y", tone === "wash" && "overflow-hidden", tones[tone], className)}>
      {tone === "wash" ? (
        <>
          <div aria-hidden="true" className="bg-dots-light absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <div aria-hidden="true" className="absolute -top-24 left-1/2 -z-10 h-72 w-[640px] -translate-x-1/2 rounded-full bg-lime/[0.1] blur-[120px]" />
        </>
      ) : null}
      <div className="container-page">{children}</div>
    </section>
  )
}

/** Mono `[ EYEBROW ]` label used on every section/page header — lime only when the ancestor is a dark band. */
export function Eyebrow({ children, tone = "light", className }: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  const dark = tone === "dark"
  return (
    <p className={cn("font-mono text-xs tracking-[0.16em] uppercase", dark ? "text-lime" : "text-foreground/55", className)}>
      <span aria-hidden="true" className={dark ? "text-white/30" : "text-foreground/30"}>[ </span>
      {children}
      <span aria-hidden="true" className={dark ? "text-white/30" : "text-foreground/30"}> ]</span>
    </p>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
  id,
  action,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  align?: "left" | "center"
  tone?: keyof typeof tones
  id?: string
  action?: ReactNode
  className?: string
}) {
  const centered = align === "center"
  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-6 lg:mb-16",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow ? <Eyebrow tone={tone} className="mb-5">{eyebrow}</Eyebrow> : null}
        <h2 id={id} className="text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        {intro ? <p className={cn("mt-5 text-lg leading-relaxed", tone === "dark" ? "text-white/60" : "text-muted-foreground")}>{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
