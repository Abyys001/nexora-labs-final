import { Reveal } from "@/components/motion/reveal"
import type { Item } from "@/content/services"

/** Horizontal process timeline; the progress line draws across once it scrolls into view. */
export function ProcessTrack({ steps }: { steps: Item[] }) {
  return (
    <Reveal variant="fade" className="process-track relative">
      <div aria-hidden="true" className="absolute top-[1.35rem] right-0 left-0 hidden h-px bg-foreground/10 lg:block">
        <div className="track-fill h-full origin-left bg-foreground" />
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        {steps.map((step, i) => (
          <li key={step.title} className="track-step relative" style={{ "--i": i } as React.CSSProperties}>
            <span className="relative z-10 flex size-11 items-center justify-center rounded-xl border-2 border-foreground bg-background font-mono text-sm font-bold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="mt-5 rounded-2xl border border-border bg-background p-5 lg:border-0 lg:bg-transparent lg:p-0">
              <h3 className="text-lg">{step.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
