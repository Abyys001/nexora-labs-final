import { AlertCircle, ArrowRight, Check } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BrandIcon } from "@/components/icons/brand-icons"
import { JsonLd } from "@/components/layout/json-ld"
import { Reveal } from "@/components/motion/reveal"
import { ProjectPreviewCard, projectVariantFor } from "@/components/portfolio/project-preview-card"
import { CheckList } from "@/components/sections/check-list"
import { CtaSection } from "@/components/sections/cta-section"
import { FaqList } from "@/components/sections/faq-list"
import { FeatureGrid } from "@/components/sections/feature-grid"
import { IndustryCard } from "@/components/sections/industry-card"
import { PageHero } from "@/components/sections/page-hero"
import { Eyebrow, Section, SectionHeader } from "@/components/sections/section"
import { ServiceCard } from "@/components/sections/service-card"
import { Button } from "@/components/ui/button"
import { industries } from "@/content/industries"
import { pricingDisclaimer } from "@/content/pricing"
import { getService, services } from "@/content/services"
import { pageMetadata, serviceJsonLd } from "@/lib/seo"
import { getProjects } from "@/lib/server/projects"
import { cn } from "@/lib/utils"

export const dynamicParams = false

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = getService((await params).slug)
  if (!service) return {}
  return pageMetadata({ title: service.seoTitle, description: service.seoDescription, path: `/services/${service.slug}` })
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = getService((await params).slug)
  if (!service) notFound()

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3)
  const relatedIndustries = industries.filter((i) => i.services.includes(service.slug)).slice(0, 4)
  const relatedProjects = (await getProjects()).filter((project) => project.services.includes(service.slug)).slice(0, 2)
  const path = `/services/${service.slug}`
  const [leadProvides, ...restProvides] = service.provides

  return (
    <>
      <PageHero
        crumbs={[{ name: "Services", path: "/services" }, { name: service.name, path }]}
        eyebrow={service.name}
        title={service.hero.title}
        intro={service.hero.intro}
        actions={
          <>
            <Button asChild size="xl"><Link href="/project-builder">{service.cta} <ArrowRight data-icon="inline-end" /></Link></Button>
            <Button asChild size="xl" variant="outline"><Link href="/contact">Talk to Our Team</Link></Button>
          </>
        }
        aside={
          <div className="window overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
              <span className="font-pixel text-[0.6rem] text-white/50">0x{service.slug.slice(0, 6)}</span>
              <span className="size-2.5 rounded-[3px] border border-white/25" />
            </div>
            <div className="scanlines p-7 sm:p-8">
              <span className="icon-live mx-auto flex size-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-white [--icon-accent:var(--lime)]">
                <BrandIcon name={service.brandIcon} className="size-14" />
              </span>
              <p className="mt-7 text-center font-mono text-xs tracking-[0.16em] text-white/45 uppercase">Typical project range</p>
              <p className="mt-2 text-center text-3xl">{service.price.range}</p>
              <p className="mt-3 text-center text-sm leading-relaxed text-white/55">{service.price.note}</p>
              <div className="my-6 h-px bg-white/10" />
              <p className="mb-4 text-sm font-semibold text-white/85">What this can include</p>
              <ul className="space-y-2.5">
                {service.includes.slice(0, 5).map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm leading-snug text-white/70">
                    <Check className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
      />

      <Section labelledBy="problem-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>The challenge</Eyebrow>
            <h2 id="problem-title" className="mt-5 text-3xl leading-tight sm:text-4xl">{service.problem.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{service.problem.intro}</p>
          </div>
          <ul className="grid gap-3">
            {service.problem.points.map((point) => (
              <li key={point} className="reveal flex items-start gap-4 rounded-xl border border-border bg-soft p-5">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Provides — asymmetric: one panel expanded, the rest as a compact stacked list */}
      <Section tone="soft" labelledBy="provide-title">
        <SectionHeader id="provide-title" eyebrow="What we provide" title={`How We Help With ${service.navLabel}`} />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          {leadProvides ? (
            <Reveal className="dark relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black p-8 text-foreground sm:p-10">
              <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_bottom_right,black,transparent_70%)]" />
              <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white [--icon-accent:var(--lime)]">
                <BrandIcon name={service.brandIcon} className="size-8" />
              </span>
              <h3 className="mt-8 text-2xl leading-snug">{leadProvides.title}</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-white/65">{leadProvides.description}</p>
            </Reveal>
          ) : null}
          <ul className="divide-y divide-border rounded-[1.75rem] border border-border bg-card">
            {restProvides.map((item, i) => (
              <li key={item.title} className="reveal flex gap-5 p-6">
                <span className="shrink-0 font-mono text-sm text-muted-foreground">{String(i + 2).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section labelledBy="includes-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Eyebrow>Scope</Eyebrow>
            <h2 id="includes-title" className="mt-5 text-3xl leading-tight sm:text-4xl">What the Service Can Include</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Every project is scoped individually. These are the building blocks we typically combine, chosen from the{" "}
              <Link href="/technologies" className="font-semibold text-primary hover:underline">technology we build with</Link>.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
            <CheckList items={service.includes} columns={2} />
          </div>
        </div>
      </Section>

      {/* Use cases — a quiet, numbered menu rather than another card grid */}
      <Section tone="soft" labelledBy="usecases-title">
        <SectionHeader id="usecases-title" eyebrow="Use cases" title="Typical Projects" />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {service.useCases.map((item, i) => (
            <li key={item.title} className="reveal bg-card p-7">
              <span className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="dark" labelledBy="benefits-title">
        <SectionHeader tone="dark" id="benefits-title" eyebrow="Benefits" title="What It Means for Your Business" />
        <FeatureGrid items={service.benefits} columns={4} />
      </Section>

      {relatedIndustries.length > 0 || relatedProjects.length > 0 ? (
        <Section tone="soft" labelledBy="fits-title">
          <SectionHeader
            id="fits-title"
            eyebrow="Where this fits"
            title="Industries and Real Projects"
            intro="Sectors where this service comes up often, and live work we have delivered with it."
          />
          <div className={cn("grid gap-12", relatedIndustries.length > 0 && relatedProjects.length > 0 && "lg:grid-cols-[1fr_1.3fr] lg:gap-16")}>
            {relatedIndustries.length > 0 ? (
              <div>
                <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">Common industries</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {relatedIndustries.map((i) => <IndustryCard key={i.slug} industry={i} />)}
                </div>
              </div>
            ) : null}
            {relatedProjects.length > 0 ? (
              <div>
                <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">Projects using this service</p>
                {/* Dark panel: the project cards are designed on ink, and it breaks up a long light page. */}
                <div className="dark mt-5 grid gap-5 rounded-3xl bg-ink p-5 sm:grid-cols-2 sm:p-6">
                  {relatedProjects.map((project, i) => (
                    <ProjectPreviewCard key={project.slug} project={project} variant={projectVariantFor(i)} size="compact" className="h-full" />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      <Section labelledBy="faq-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 id="faq-title" className="mt-5 text-3xl leading-tight sm:text-4xl">{service.navLabel} Questions</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{pricingDisclaimer}</p>
            <Button asChild size="xl" variant="outline" className="mt-7"><Link href="/pricing">Full Pricing Guide</Link></Button>
          </div>
          <FaqList faqs={service.faqs} />
        </div>
      </Section>

      <Section tone="soft" labelledBy="related-title">
        <SectionHeader id="related-title" eyebrow="Related" title="Other Services" />
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((s) => <ServiceCard key={s.slug} service={s} />)}
        </div>
      </Section>

      <CtaSection
        title={`Ready to Talk About ${service.navLabel}?`}
        primary={{ label: service.cta, href: "/project-builder" }}
        secondary={{ label: "Talk to Our Team", href: "/contact" }}
      />
      <JsonLd data={serviceJsonLd({ name: service.name, description: service.seoDescription, path })} />
    </>
  )
}
