import { ArrowRight, Phone } from "lucide-react"
import Link from "next/link"

import { Magnetic } from "@/components/motion/magnetic"
import { Button } from "@/components/ui/button"
import { site } from "@/content/site"

const lines = [
  { prompt: "$", text: "nexora start-project", tone: "text-white" },
  { prompt: "›", text: "What are you trying to achieve?", tone: "text-white/60" },
  { prompt: "›", text: "Scope, realistic budget and a first step.", tone: "text-lime" },
]

/** Final conversion block styled as a terminal session, with human contact routes beside it. */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="dark relative isolate overflow-hidden bg-black py-24 text-foreground sm:py-28">
      <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <div aria-hidden="true" className="absolute -bottom-48 left-1/2 -z-10 h-96 w-[900px] -translate-x-1/2 rounded-full bg-lime/25 blur-[140px]" />
      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-lime uppercase">Start a project</p>
          <h2 id="closing-title" className="mt-5 text-4xl leading-[1.15] sm:text-5xl">Let&apos;s build what your business needs next.</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
            Tell us about the problem, not the technology. We&apos;ll come back with a clear recommendation, an indicative budget and a sensible first step.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic>
              <Button asChild size="xl" className="group">
                <Link href="/project-builder">
                  Start a Project <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            </Magnetic>
            <Button asChild size="xl" variant="outline">
              <a href={site.phone.href}>
                <Phone data-icon="inline-start" aria-hidden="true" /> {site.phone.display}
              </a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/50">
            Or email{" "}
            <a href={`mailto:${site.email}`} className="link-underline text-white/80">
              {site.email}
            </a>
          </p>
        </div>

        <div aria-hidden="true" className="window overflow-hidden bg-black!">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-pixel text-[0.65rem] text-white/60">0x000000 · terminal</span>
            <span className="size-2.5 rounded-[3px] border border-white/30" />
          </div>
          <div className="scanlines space-y-3 p-6 font-mono text-sm sm:p-8">
            {lines.map((line, i) => (
              <p key={i} className={`cta-line flex gap-3 ${line.tone}`} style={{ "--i": i } as React.CSSProperties}>
                <span className="text-white/35">{line.prompt}</span>
                {line.text}
              </p>
            ))}
            <p className="flex gap-3 text-white">
              <span className="text-white/35">$</span>
              <span className="animate-blink inline-block h-5 w-2.5 bg-lime" />
            </p>
            <div className="flex items-end gap-4 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- brand pixel mark */}
              <img src="/media/pixel-chat.webp" alt="" width={64} height={58} loading="lazy" className="pixelated w-16" />
              <p className="pb-1 text-xs text-white/45">We aim to reply within one business day</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
