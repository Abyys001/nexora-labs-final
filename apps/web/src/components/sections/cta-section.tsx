import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Magnetic } from "@/components/motion/magnetic"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"

import { Eyebrow } from "./section"

/** Dark closing band shared by every inner page — same black/bg-dots/lime family as `ClosingCta`, sized for a mid-page CTA. */
export function CtaSection({
  eyebrow = "Start a project",
  title = "Have a Business Idea or a Problem to Solve?",
  text = "Tell us what you're trying to achieve. We'll help you understand what can be built, what it could cost and how to approach it.",
  primary = { label: "Start a Project", href: "/project-builder" },
  secondary = { label: "Contact Us", href: "/contact" },
}: {
  eyebrow?: string
  title?: string
  text?: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string } | null
}) {
  return (
    <section className="dark relative isolate overflow-hidden bg-black py-20 text-foreground sm:py-24" aria-labelledby="cta-title">
      <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_75%)]" />
      <div aria-hidden="true" className="absolute -bottom-40 left-1/2 -z-10 h-80 w-[720px] -translate-x-1/2 rounded-full bg-lime/20 blur-[120px]" />
      <div className="container-page text-center">
        <Reveal variant="fade"><Eyebrow tone="dark" className="text-center">{eyebrow}</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 id="cta-title" className="mx-auto mt-5 max-w-3xl text-3xl leading-[1.15] sm:text-4xl lg:text-5xl">{title}</h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">{text}</p>
        </Reveal>
        <Reveal delay={240} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Magnetic>
            <Button asChild size="xl" className="group">
              <Link href={primary.href}>
                {primary.label} <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          </Magnetic>
          {secondary ? (
            <Button asChild size="xl" variant="outline">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
