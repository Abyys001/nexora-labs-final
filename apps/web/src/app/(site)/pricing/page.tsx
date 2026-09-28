import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

import { CtaSection } from "@/components/sections/cta-section"
import { FaqList } from "@/components/sections/faq-list"
import { InvestmentSpectrum } from "@/components/sections/investment-spectrum"
import { PageHero } from "@/components/sections/page-hero"
import { PricingCard } from "@/components/sections/pricing-card"
import { PricingCostDrivers } from "@/components/sections/pricing-cost-drivers"
import { Eyebrow, Section, SectionHeader } from "@/components/sections/section"
import { Button } from "@/components/ui/button"
import { faqGroups } from "@/content/company"
import { pricingDisclaimer, pricingFactors, pricingTiers } from "@/content/pricing"
import { services } from "@/content/services"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Pricing: Software Development Costs",
  description:
    "Indicative pricing for websites, web apps, mobile apps, AI solutions, CRM systems, SaaS platforms and enterprise software, from £2,000 to £50,000+.",
  path: "/pricing",
})

export default function PricingPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        eyebrow="Pricing"
        title="Technology Investment, Made Clear"
        intro="We believe you should have a realistic idea of your typical project range before you ever speak to us. Every figure here is an estimated investment, never a fixed quote."
      />

      <Section labelledBy="spectrum-title">
        <SectionHeader
          id="spectrum-title"
          eyebrow="From £2,000 to £50,000+"
          title="Where Your Project Sits on the Scale"
          intro="Starting from a simple website through to organisation-wide platforms. Hover a row to see how project types compare."
        />
        <InvestmentSpectrum tiers={pricingTiers} />
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">{pricingDisclaimer}</p>
        <div className="dark mt-10 flex flex-col gap-6 rounded-[1.75rem] bg-background p-7 text-foreground sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime"><Sparkles className="size-5" aria-hidden="true" /></span>
            <div>
              <p className="font-mono text-[0.7rem] tracking-[0.16em] text-lime uppercase">Not sure where you land?</p>
              <p className="mt-2 max-w-lg text-white/70">
                The Project Builder walks through your requirements and gives a live, indicative estimate in minutes. The final commercial price always follows a short review with our team.
              </p>
            </div>
          </div>
          <Button asChild size="xl" className="shrink-0">
            <Link href="/project-builder">
              Try the Project Builder <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>

      <Section tone="soft" labelledBy="tiers-title">
        <SectionHeader id="tiers-title" eyebrow="By project type" title="Estimated Investment, Project by Project" intro="What's typically included at each range and who it tends to suit." />
        <div className="rounded-[1.75rem] border border-border bg-card px-6 sm:px-9">
          {pricingTiers.map((tier, i) => <PricingCard key={tier.id} tier={tier} index={i} />)}
        </div>
        <div className="dark mt-5 flex flex-col justify-between gap-6 rounded-[1.75rem] bg-background p-7 text-foreground sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="font-mono text-[0.7rem] tracking-[0.16em] text-white/45 uppercase">Ongoing support</p>
            <p className="mt-2 text-2xl leading-none font-semibold">Starting from £300/month</p>
            <p className="mt-3 max-w-lg text-white/60">Maintenance, security updates and continuous improvements after launch, scoped to your product.</p>
          </div>
          <Button asChild size="xl" variant="outline" className="shrink-0"><Link href="/services/maintenance-support">Support Plans</Link></Button>
        </div>
      </Section>

      <Section tone="wash" labelledBy="factors-title">
        <SectionHeader id="factors-title" eyebrow="What affects cost" title="What Shapes Your Investment" intro="Every project moves up or down this range for the same handful of reasons. Understanding them helps you plan and prioritise before we scope your project." />
        <PricingCostDrivers items={pricingFactors} />
      </Section>

      <Section tone="soft" labelledBy="services-price-title">
        <SectionHeader id="services-price-title" eyebrow="By service" title="Service Price Guide" intro="How each service typically compares, and where to read more." />
        <div className="overflow-hidden rounded-[1.75rem] border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Typical project range by service</caption>
            <thead className="bg-background text-foreground">
              <tr>
                <th scope="col" className="px-6 py-4 font-mono text-[0.7rem] tracking-[0.16em] uppercase">Service</th>
                <th scope="col" className="px-6 py-4 font-mono text-[0.7rem] tracking-[0.16em] uppercase">Typical project range</th>
                <th scope="col" className="hidden px-6 py-4 font-mono text-[0.7rem] tracking-[0.16em] uppercase md:table-cell">Notes</th>
                <th scope="col" className="w-10 px-4 py-4"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {services.map((s) => (
                <tr key={s.slug} className="group transition-colors hover:bg-soft/70">
                  <th scope="row" className="px-6 py-5 font-semibold">
                    <Link href={`/services/${s.slug}`} className="after:absolute after:inset-0 group-hover:text-primary">{s.name}</Link>
                  </th>
                  <td className="relative px-6 py-5 whitespace-nowrap font-mono text-[0.9rem] text-primary">{s.price.range}</td>
                  <td className="hidden px-6 py-5 text-muted-foreground md:table-cell">{s.price.note}</td>
                  <td className="px-4 py-5 text-right">
                    <ArrowRight className="arrow-nudge ml-auto size-4 text-foreground/30 transition-colors group-hover:text-foreground" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section labelledBy="pricing-faq-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <Eyebrow className="mb-5">FAQ</Eyebrow>
            <h2 id="pricing-faq-title" className="text-3xl leading-tight sm:text-4xl">Pricing Questions</h2>
          </div>
          <FaqList faqs={faqGroups[0].faqs} withSchema={false} />
        </div>
      </Section>

      <CtaSection
        title="Get a Realistic Estimate for Your Project"
        text="Share a few details and we'll come back with a suggested approach and an estimated investment range, with no obligation."
        primary={{ label: "Get a Project Estimate", href: "/project-builder" }}
        secondary={{ label: "Talk to Our Team", href: "/contact" }}
      />
    </>
  )
}
