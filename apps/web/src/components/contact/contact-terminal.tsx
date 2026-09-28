import { BrandIcon } from "@/components/icons/brand-icons"
import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

// Illustrative exchange only — not a real transcript. Shows the tone of a first reply, not a promise of content.
const lines: { from: "visitor" | "us"; text: string }[] = [
  { from: "visitor", text: "We need a quote for a customer portal." },
  { from: "us", text: "Got it — what's the main problem it needs to solve day to day?" },
  { from: "visitor", text: "Clients keep emailing us for order status." },
  { from: "us", text: "Understood. Full reply within one business day — often sooner." },
]

/** Decorative "open channel" terminal: an illustrative exchange that lines in on scroll, static under reduced motion. */
export function ContactTerminal() {
  return (
    <div aria-hidden="true" className="window relative mx-auto w-full max-w-md overflow-hidden text-white [--icon-accent:var(--lime)]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-3.5 py-2.5">
        <span className="flex items-center gap-2">
          <BrandIcon name="crm" className="icon-live size-3.5 text-lime" />
          <span className="font-pixel text-[0.62rem] text-white/70">0x000000 · open-channel</span>
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[0.6rem] text-phosphor">
          <span className="size-1.5 animate-pulse rounded-full bg-phosphor" /> live
        </span>
      </div>
      <div className="scanlines flex min-h-[240px] flex-col justify-end gap-2.5 p-4 sm:p-5">
        {lines.map((line, i) => (
          <Reveal key={line.text} delay={i * 260} variant={line.from === "visitor" ? "right" : "left"} className={line.from === "visitor" ? "ml-auto max-w-[85%]" : "max-w-[85%]"}>
            <p
              className={cn(
                "w-fit rounded-lg px-3 py-2 text-[0.8rem] leading-snug",
                line.from === "visitor" ? "ml-auto rounded-br-sm bg-white/10 text-white/80" : "rounded-bl-sm bg-lime/15 text-lime",
              )}
            >
              {line.text}
              {i === lines.length - 1 ? <span className="animate-blink" aria-hidden="true">▍</span> : null}
            </p>
          </Reveal>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 font-mono text-[0.62rem] text-white/45">
        <span>Form · phone · WhatsApp</span>
        <span className="text-lime">Reply &lt; 1 business day</span>
      </div>
    </div>
  )
}
