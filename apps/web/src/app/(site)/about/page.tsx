import { ArrowRight, Check } from "lucide-react"
import Link from "next/link"

import { CtaSection } from "@/components/sections/cta-section"
import { FactStrip } from "@/components/sections/fact-strip"
import { FeatureGrid } from "@/components/sections/feature-grid"
import { PageHero } from "@/components/sections/page-hero"
import { ProcessSteps } from "@/components/sections/process-steps"
import { Eyebrow, Section, SectionHeader } from "@/components/sections/section"
import { Button } from "@/components/ui/button"
import { aboutValues, processSteps, whyCybercina } from "@/content/company"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Cybercina helps businesses use technology without unnecessary complexity, combining product thinking, software engineering, AI and business understanding.",
  path: "/about",
})

const approach = [
  { title: "Understand first", description: "We learn how your business works before recommending anything." },
  { title: "Start focused", description: "We deliver the most valuable part first, then build on it." },
  { title: "Build properly", description: "Reliable, secure software designed to be maintained and extended." },
  { title: "Stay involved", description: "We support and improve what we build long after launch." },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow="About Cybercina"
        title="Technology Should Make Business Simpler."
        intro="Cybercina exists to help businesses use technology without unnecessary complexity — one team across product, engineering, AI and delivery."
      />

      <Section labelledBy="who-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow className="mb-5">Who we are</Eyebrow>
            <h2 id="who-title" className="text-3xl leading-tight sm:text-4xl">A Technology Partner, Not Just a Supplier</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>We combine product thinking, software engineering, AI and business understanding to create practical digital solutions.</p>
            <p>We work with startups, small and medium-sized businesses and larger organisations. Some come to us with a clear idea; others come with a problem they know technology could solve. Either way, we start by understanding the business.</p>
            <p>From websites and mobile apps to AI-powered platforms and complete business systems, we build technology around the way your business actually works.</p>
          </div>
        </div>
        <div className="mt-16"><FactStrip /></div>
      </Section>

      <Section tone="wash" labelledBy="believe-title">
        <SectionHeader id="believe-title" eyebrow="What we believe" title="The Principles Behind Our Work" />
        <FeatureGrid items={aboutValues} columns={2} numbered />
      </Section>

      <Section tone="soft" labelledBy="how-title">
        <SectionHeader
          id="how-title"
          eyebrow="How we work"
          title="A Simple, Collaborative Process"
          intro="Every project — small or large — moves through the same clear stages, so you always know what comes next."
          action={<Button asChild variant="outline" size="xl"><Link href="/process">See Full Process</Link></Button>}
        />
        <ProcessSteps steps={processSteps} />
      </Section>

      <Section tone="wash" labelledBy="approach-title">
        <SectionHeader id="approach-title" eyebrow="Our approach" title="Practical by Design" />
        <FeatureGrid items={approach} columns={4} />
      </Section>

      <Section tone="dark" labelledBy="why-title">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:items-start">
          <div>
            <SectionHeader tone="dark" id="why-title" eyebrow="Why businesses work with us" title="More Than a Development Team" className="mb-10 lg:mb-10" />
            <FeatureGrid items={whyCybercina} />
            <Button asChild size="xl" className="group mt-12">
              <Link href="/services">Explore Our Services <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" /></Link>
            </Button>
          </div>
          <div aria-hidden="true" className="window relative hidden overflow-hidden text-white [--icon-accent:var(--lime)] lg:block">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3.5 py-2.5">
              <span className="font-pixel text-[0.62rem] text-white/70">0x000000 · how-we-work.log</span>
              <span className="size-2 rounded-[2px] border border-white/30" />
            </div>
            <div className="scanlines space-y-3 p-5">
              {aboutValues.map((v) => (
                <div key={v.title} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
                  <span className="text-[0.85rem] leading-snug text-white/75">{v.title}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-white/10 pt-4">
                <p className="font-mono text-[0.7rem] text-white/40">status</p>
                <p className="mt-1 font-mono text-[0.8rem] text-lime">accepting new projects</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <CtaSection />
    </>
  )
}
