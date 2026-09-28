import { ArrowRight, Check } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BrandIcon } from "@/components/icons/brand-icons"
import { CtaSection } from "@/components/sections/cta-section"
import { IndustryCard } from "@/components/sections/industry-card"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { ServiceCard } from "@/components/sections/service-card"
import { Button } from "@/components/ui/button"
import { getIndustry, industries } from "@/content/industries"
import { getService, type Service } from "@/content/services"
import { pageMetadata } from "@/lib/seo"

export const dynamicParams = false

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const industry = getIndustry((await params).slug)
  if (!industry) return {}
  return pageMetadata({
    title: `Software & AI Solutions for ${industry.name}`,
    description: `${industry.summary} Explore common challenges and the digital solutions Nexora Labs can build.`,
    path: `/industries/${industry.slug}`,
  })
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const industry = getIndustry((await params).slug)
  if (!industry) notFound()
  const relatedServices = industry.services.map(getService).filter((s): s is Service => Boolean(s))
  const others = industries.filter((i) => i.slug !== industry.slug && i.group === industry.group).slice(0, 4)

  return (
    <>
      <PageHero
        crumbs={[{ name: "Industries", path: "/industries" }, { name: industry.name, path: `/industries/${industry.slug}` }]}
        eyebrow="Industries"
        title={`Technology for ${industry.name}`}
        intro={industry.summary}
        actions={
          <>
            <Button asChild size="xl"><Link href="/project-builder">Start a Project <ArrowRight data-icon="inline-end" /></Link></Button>
            <Button asChild size="xl" variant="outline"><Link href="/work">View Example Projects</Link></Button>
          </>
        }
      />

      {/* Challenge vs solution, in the same panel shape as the homepage industry selector */}
      <Section>
        <div className="dark relative isolate grid overflow-hidden rounded-[2rem] bg-black text-foreground lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative isolate flex min-h-[280px] flex-col justify-between overflow-hidden p-7 sm:p-10">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand media */}
            <img src="/media/wire-globe.webp" alt="" width={564} height={564} loading="lazy" className="media-screen pointer-events-none absolute -right-24 -bottom-24 -z-10 w-[420px] opacity-50" />
            <div>
              <span className="icon-live flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-white [--icon-accent:var(--lime)]">
                <BrandIcon name={industry.brandIcon} className="size-12" />
              </span>
              <p className="mt-8 font-mono text-xs tracking-[0.16em] text-lime uppercase">{industry.tagline}</p>
              <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">{industry.name}</h2>
            </div>
          </div>
          <div className="grid gap-px bg-white/[0.08] sm:grid-cols-2">
            <div className="bg-ink-800 p-7 sm:p-8">
              <p className="font-mono text-[0.7rem] tracking-[0.16em] text-white/45 uppercase">The challenge</p>
              <ul className="mt-5 space-y-3.5">
                {industry.challenges.map((line) => (
                  <li key={line} className="flex gap-3 text-[0.95rem] leading-snug text-white/75">
                    <span className="mt-1.5 size-2 shrink-0 rounded-[2px] border border-white/40" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink-800 p-7 sm:p-8">
              <p className="font-mono text-[0.7rem] tracking-[0.16em] text-lime uppercase">What we build</p>
              <ul className="mt-5 space-y-3.5">
                {industry.solutions.map((line) => (
                  <li key={line} className="flex gap-3 text-[0.95rem] leading-snug text-white">
                    <Check className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="soft" labelledBy="services-title">
        <SectionHeader id="services-title" eyebrow="Example services" title="Services That Often Fit" />
        <div className="grid gap-5 md:grid-cols-3">
          {relatedServices.map((s) => <ServiceCard key={s.slug} service={s} showPrice />)}
        </div>
      </Section>

      {others.length > 0 ? (
        <Section labelledBy="other-title">
          <SectionHeader id="other-title" eyebrow={`More in ${industry.group}`} title="Related Industries" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((i) => <IndustryCard key={i.slug} industry={i} />)}
          </div>
        </Section>
      ) : null}

      <Section tone="soft" labelledBy="explore-title">
        <SectionHeader id="explore-title" eyebrow="Keep exploring" title="See the Work and the Cost" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/work" className="card-lift group rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold group-hover:text-primary">Example projects</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">See how we approach similar challenges end to end.</p>
          </Link>
          <Link href="/technologies" className="card-lift group rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold group-hover:text-primary">Technology we use</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Mature, well-supported tools chosen for the job.</p>
          </Link>
          <Link href="/pricing" className="card-lift group rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold group-hover:text-primary">Pricing guide</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Typical investment ranges by project type.</p>
          </Link>
        </div>
      </Section>

      <CtaSection />
    </>
  )
}
