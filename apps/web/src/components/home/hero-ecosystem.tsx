import type { CSSProperties, ReactNode } from "react"

import { BrandIcon, type BrandIconName } from "@/components/icons/brand-icons"
import { cn } from "@/lib/utils"

type Node = { id: string; x: number; y: number }

// Satellite anchor points (percent of the stage) that the connector lines run to.
const nodes: Node[] = [
  { id: "ai", x: 50, y: 11 },
  { id: "analytics", x: 13, y: 36 },
  { id: "crm", x: 87, y: 34 },
  { id: "cloud", x: 15, y: 78 },
  { id: "mobile", x: 86, y: 76 },
  { id: "automation", x: 50, y: 92 },
]

function Window({
  title,
  icon,
  className,
  children,
  delay = 0,
}: {
  title: string
  icon: BrandIconName
  className?: string
  children: ReactNode
  delay?: number
}) {
  return (
    <div
      className={cn("window animate-float absolute overflow-hidden text-white [--icon-accent:var(--lime)]", className)}
      style={{ animationDelay: `${delay}s`, animationDuration: `${7 + (delay % 3)}s` } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-2.5 py-1.5">
        <span className="flex items-center gap-1.5">
          <BrandIcon name={icon} className="icon-live size-3.5 text-lime" />
          <span className="font-pixel text-[0.6rem] text-white/70">{title}</span>
        </span>
        <span className="size-2 rounded-[2px] border border-white/30" />
      </div>
      <div className="p-2.5">{children}</div>
    </div>
  )
}

/** Decorative "living ecosystem" of business systems around one platform. Illustrative UI only. */
export function HeroEcosystem() {
  return (
    <div aria-hidden="true" className="hero-parallax relative mx-auto aspect-square w-full max-w-[600px] select-none">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand media */}
      <img src="/media/wire-globe.webp" alt="" width={200} height={202} className="media-screen animate-orbit pointer-events-none absolute inset-[18%] h-[64%] w-[64%] opacity-[0.22] [--orbit-duration:90s]" />
      <div className="absolute inset-[22%] rounded-full bg-lime/20 blur-[80px]" />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        {nodes.map((node, i) => (
          <g key={node.id}>
            <line x1="50" y1="50" x2={node.x} y2={node.y} stroke="rgb(191 247 71 / 0.22)" strokeWidth="1" strokeDasharray="0.01 0.012" pathLength={1} vectorEffect="non-scaling-stroke" />
            <line
              x1="50"
              y1="50"
              x2={node.x}
              y2={node.y}
              pathLength={1}
              stroke="var(--lime)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="0.06 0.94"
              vectorEffect="non-scaling-stroke"
              className="animate-dash"
              style={{ "--dash-duration": `${2.2 + i * 0.35}s`, animationDelay: `${-i * 0.4}s` } as CSSProperties}
            />
          </g>
        ))}
      </svg>

      {/* Core platform */}
      <div className="window absolute inset-x-[27%] top-[36%] bottom-[34%] overflow-hidden [--icon-accent:var(--lime)] sm:inset-x-[29%]">
        <div className="flex items-center justify-between border-b border-white/10 bg-lime px-3 py-1.5">
          <span className="font-pixel text-[0.62rem] text-black">business.platform</span>
          <span className="size-2 rounded-[2px] bg-black/70" />
        </div>
        <div className="scanlines grid h-full grid-cols-[26%_1fr] gap-2 p-2.5">
          <div className="space-y-1.5 pt-0.5">
            {(["crm", "analytics", "automation", "cloud"] as const).map((name, i) => (
              <div key={name} className={cn("flex items-center justify-center rounded-md py-1", i === 0 ? "bg-lime/15 text-lime" : "text-white/40")}>
                <BrandIcon name={name} className="size-3.5" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-2/3 rounded-full bg-white/20" />
            <div className="grid grid-cols-3 gap-1">
              {[70, 45, 85].map((w, i) => (
                <div key={i} className="rounded-md border border-white/10 p-1.5">
                  <div className="h-1 w-3/5 rounded-full bg-white/15" />
                  <div className="mt-1.5 h-1.5 rounded-full bg-lime/80" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", row === 0 ? "bg-phosphor" : "bg-white/25")} />
                  <span className="h-1 flex-1 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Window title="ai.assistant" icon="ai-machine-learning" className="top-[1%] left-1/2 w-[44%] -translate-x-1/2 sm:w-[38%]" delay={-1}>
        <div className="space-y-1.5 text-[0.6rem] leading-snug">
          <p className="ml-auto w-fit max-w-[85%] rounded-md rounded-br-sm bg-white/10 px-2 py-1 text-white/80">Which orders need attention today?</p>
          <p className="w-fit max-w-[90%] rounded-md rounded-bl-sm bg-lime/15 px-2 py-1 text-lime">
            3 orders are delayed. Drafting customer updates<span className="animate-blink">▍</span>
          </p>
        </div>
      </Window>

      <Window title="analytics" icon="analytics" className="top-[25%] left-0 w-[30%]" delay={-3}>
        <div className="flex h-12 items-end gap-1">
          {[40, 62, 48, 75, 58, 90].map((h, i) => (
            <span
              key={i}
              className="hero-bar flex-1 origin-bottom rounded-t-[2px] bg-gradient-to-t from-lime/30 to-lime"
              style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` } as CSSProperties}
            />
          ))}
        </div>
      </Window>

      <Window title="crm" icon="crm" className="top-[22%] right-0 w-[29%]" delay={-5}>
        <div className="space-y-1.5">
          {["Lead", "Qualified", "Won"].map((stage, i) => (
            <div key={stage} className="flex items-center gap-1.5 text-[0.58rem] text-white/60">
              <span className={cn("flex size-4 items-center justify-center rounded-full border text-[0.5rem]", i === 2 ? "border-lime bg-lime text-black" : "border-white/25")}>
                {i + 1}
              </span>
              {stage}
              <span className="ml-auto h-1 rounded-full bg-white/15" style={{ width: `${30 - i * 8}%` }} />
            </div>
          ))}
        </div>
      </Window>

      <Window title="cloud" icon="cloud" className="bottom-[10%] left-[1%] hidden w-[29%] sm:block" delay={-2}>
        <div className="space-y-1 font-mono text-[0.55rem] text-white/60">
          {["api", "web", "jobs"].map((svc) => (
            <div key={svc} className="flex items-center justify-between">
              <span>{svc}</span>
              <span className="flex items-center gap-1 text-phosphor">
                <span className="size-1.5 rounded-full bg-phosphor" /> ok
              </span>
            </div>
          ))}
        </div>
      </Window>

      <Window title="mobile" icon="mobile-development" className="right-[2%] bottom-[8%] hidden w-[23%] sm:block" delay={-4}>
        <div className="mx-auto w-[62%] rounded-lg border border-white/20 p-1">
          <div className="hero-phone space-y-1">
            <div className="h-3 rounded-sm bg-lime/70" />
            <div className="h-2 rounded-sm bg-white/15" />
            <div className="h-2 w-2/3 rounded-sm bg-white/10" />
          </div>
        </div>
      </Window>

      <Window title="automation" icon="automation" className="bottom-0 left-1/2 hidden w-[36%] -translate-x-1/2 sm:block" delay={-6}>
        <div className="relative flex items-center justify-between font-mono text-[0.52rem] text-white/60">
          {["form", "enrich", "notify"].map((step) => (
            <span key={step} className="relative z-10 rounded border border-white/15 bg-ink-800 px-1.5 py-0.5">{step}</span>
          ))}
          <span className="absolute inset-x-3 top-1/2 h-px bg-white/15" />
          <span className="hero-packet absolute inset-x-3 top-1/2 -mt-[3px] h-1.5">
            <span className="block size-1.5 rounded-full bg-lime shadow-[0_0_8px_var(--lime)]" />
          </span>
        </div>
      </Window>
    </div>
  )
}
