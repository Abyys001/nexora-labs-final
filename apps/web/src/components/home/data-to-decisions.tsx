"use client"

import { useEffect, useRef, useState } from "react"

import { BrandIcon, type BrandIconName } from "@/components/icons/brand-icons"
import { prefersReducedMotion } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

const steps: { code: string; label: string; title: string; body: string; icon: BrandIconName }[] = [
  { code: "0x01", label: "data.collect", title: "Data", body: "We connect the places your information already lives: forms, spreadsheets, CRM, e-commerce, email and finance tools.", icon: "data-engineering" },
  { code: "0x02", label: "ai.model", title: "Intelligence", body: "AI reads, classifies and summarises that data, using your own knowledge and rules, not generic answers.", icon: "ai-machine-learning" },
  { code: "0x03", label: "insight.view", title: "Insights", body: "Dashboards and alerts show what matters today, so decisions are based on live numbers instead of month-end reports.", icon: "analytics" },
  { code: "0x04", label: "flow.run", title: "Automation", body: "Routine steps run by themselves: follow-ups, approvals, updates and hand-offs between systems and teams.", icon: "automation" },
  { code: "0x05", label: "growth.loop", title: "Business outcome", body: "Less admin, faster responses and clearer priorities, so your team spends its time on customers and growth.", icon: "digital-transformation" },
]

/** Pinned media window + scroll-activated steps. The step nearest the viewport centre is "active". */
export function DataToDecisions() {
  const [active, setActive] = useState(0)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    )
    stepRefs.current.forEach((node) => node && observer.observe(node))
    return () => observer.disconnect()
  }, [])

  // The clip only downloads and plays while on screen, and never under reduced motion.
  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion()) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (video.preload === "none") {
          video.preload = "auto"
          video.load()
        }
        void video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    }, { rootMargin: "200px 0px" })
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const step = steps[active]
  const progress = ((active + 1) / steps.length) * 100

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:h-fit">
        <div className="window overflow-hidden bg-black!">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-pixel text-[0.65rem] text-phosphor">
              {step.code} · {step.label}
            </span>
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-[3px] border border-white/25" />
              <span className="size-2.5 rounded-[3px] border border-phosphor/60 bg-phosphor/20" />
            </span>
          </div>
          <div className="relative aspect-square">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              poster="/media/data-windows-poster.jpg"
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src="/media/data-windows.mp4" type="video/mp4" />
            </video>
            <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,black)]" />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur [--icon-accent:var(--lime)]">
              <span className="icon-live flex size-10 shrink-0 items-center justify-center rounded-lg bg-lime text-black [--icon-accent:#000]">
                <BrandIcon name={step.icon} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full origin-left rounded-full bg-lime transition-transform duration-700 ease-out" style={{ transform: `scaleX(${progress / 100})` }} />
                </div>
              </div>
              <span className="font-mono text-xs text-white/50">
                {active + 1}/{steps.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ol className="relative">
        <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.15rem] w-px bg-white/10" />
        <span
          aria-hidden="true"
          className="absolute top-2 left-[1.15rem] w-px origin-top bg-lime transition-transform duration-700 ease-out"
          style={{ height: "calc(100% - 1rem)", transform: `scaleY(${active / (steps.length - 1)})` }}
        />
        {steps.map((item, i) => (
          <li
            key={item.code}
            ref={(node) => {
              stepRefs.current[i] = node
            }}
            data-index={i}
            className={cn("relative flex gap-6 pb-16 transition-opacity duration-500 last:pb-0 lg:min-h-[34vh] lg:last:min-h-0", i === active ? "opacity-100" : "opacity-45")}
          >
            <span
              className={cn(
                "relative z-10 flex size-[2.3rem] shrink-0 items-center justify-center rounded-lg border font-mono text-xs transition-all duration-500",
                i <= active ? "border-lime bg-lime text-black" : "border-white/20 bg-black text-white/60",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="pt-1">
              <h3 className="text-2xl sm:text-3xl">{item.title}</h3>
              <p className="mt-3 max-w-md text-[1.05rem] leading-relaxed text-white/65">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
