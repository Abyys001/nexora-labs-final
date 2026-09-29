import { Banknote, Cpu, HandHeart, LifeBuoy, Timer } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { JsonLd } from "@/components/layout/json-ld"
import { Magnetic } from "@/components/motion/magnetic"
import { CtaSection } from "@/components/sections/cta-section"
import { FaqList } from "@/components/sections/faq-list"
import { PageHero } from "@/components/sections/page-hero"
import { Section } from "@/components/sections/section"
import { Button } from "@/components/ui/button"
import { faqGroups } from "@/content/company"
import { site } from "@/content/site"
import { faqJsonLd, pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: "Answers about pricing, timelines, process, AI, ownership and ongoing support for software projects with Cybercina.",
  path: "/faq",
})

const groupIcons: Record<string, LucideIcon> = {
  "Pricing & budgets": Banknote,
  "Process & timelines": Timer,
  "Working together": HandHeart,
  "AI & technology": Cpu,
  "Support": LifeBuoy,
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

export default function FaqPage() {
  const all = faqGroups.flatMap((g) => g.faqs)
  const unique = all.filter((f, i) => all.findIndex((x) => x.question === f.question) === i)
  return (
    <>
      <PageHero crumbs={[{ name: "FAQ", path: "/faq" }]} eyebrow="FAQ" title="Frequently Asked Questions" intro="Straight answers to the questions businesses ask us most often, grouped by topic." />
      <Section tone="wash">
        <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-28 lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
              {faqGroups.map((g) => {
                const Icon = groupIcons[g.title]
                return (
                  <li key={g.title}>
                    <a href={`#${slug(g.title)}`} className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-soft hover:text-foreground">
                      {Icon ? <Icon className="size-4 shrink-0 text-foreground/40 transition-colors group-hover:text-primary" aria-hidden="true" /> : null}
                      {g.title}
                    </a>
                  </li>
                )
              })}
            </ul>
            <div className="mt-8 hidden rounded-2xl border border-border bg-card p-5 lg:block">
              <p className="text-sm font-semibold">Still stuck?</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{site.responseTime}</p>
              <Magnetic className="mt-4 block">
                <Button asChild size="lg" className="w-full"><Link href="/contact">Talk to our team</Link></Button>
              </Magnetic>
            </div>
          </nav>
          <div className="space-y-14">
            {faqGroups.map((g) => {
              const Icon = groupIcons[g.title]
              return (
                <section key={g.title} id={slug(g.title)} aria-labelledby={`${slug(g.title)}-h`} className="scroll-mt-28">
                  <div className="mb-6 flex items-center gap-3">
                    {Icon ? (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    ) : null}
                    <h2 id={`${slug(g.title)}-h`} className="text-2xl font-semibold">{g.title}</h2>
                  </div>
                  <FaqList faqs={g.faqs} withSchema={false} />
                </section>
              )
            })}
            <p className="text-muted-foreground">
              Still have a question? <Link href="/contact" className="font-semibold text-primary hover:underline">Talk to our team</Link>.
            </p>
          </div>
        </div>
      </Section>
      <CtaSection />
      <JsonLd data={faqJsonLd(unique)} />
    </>
  )
}
