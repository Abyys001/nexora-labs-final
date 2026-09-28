import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CtaSection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { Eyebrow, Section, SectionHeader } from "@/components/sections/section"
import { ServiceCard } from "@/components/sections/service-card"
import { Button } from "@/components/ui/button"
import { getService, type Service } from "@/content/services"
import { getSolution, solutions } from "@/content/solutions"
import { pageMetadata } from "@/lib/seo"

export const dynamicParams = false

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps<"/solutions/[slug]">): Promise<Metadata> {
  const solution = getSolution((await params).slug)
  if (!solution) return {}
  return pageMetadata({ title: `Software Solutions for ${solution.name}`, description: solution.seoDescription, path: `/solutions/${solution.slug}` })
}

export default async function SolutionPage({ params }: PageProps<"/solutions/[slug]">) {
  const solution = getSolution((await params).slug)
  if (!solution) notFound()
  const relatedServices = solution.services.map(getService).filter((s): s is Service => Boolean(s))

  return (
    <>
      <PageHero
        crumbs={[{ name: solution.name, path: `/solutions/${solution.slug}` }]}
        eyebrow={`Solutions · ${solution.name}`}
        title={solution.title}
        intro={solution.intro}
        actions={
          <>
            <Button asChild size="xl"><Link href="/project-builder">Start a Project <ArrowRight data-icon="inline-end" /></Link></Button>
            <Button asChild size="xl" variant="outline"><Link href="/contact">Talk to Our Team</Link></Button>
          </>
        }
        next="dark"
      />

      {/* Challenges + approach, as one console-style split */}
      <Section tone="dark" labelledBy="challenges-title">
        <SectionHeader
          tone="dark"
          id="challenges-title"
          eyebrow="Sound familiar?"
          title="Where Projects Like This Usually Start"
          align="center"
          intro={`These are the situations ${solution.name.toLowerCase()} most often describe when they first get in touch — and how we typically respond.`}
        />
        <div className="grid gap-px overflow-hidden rounded-[2rem] bg-white/[0.08] sm:grid-cols-2">
          <div className="bg-ink-800 p-7 sm:p-9">
            <p className="font-mono text-[0.7rem] tracking-[0.16em] text-white/45 uppercase">The challenges</p>
            <ul className="mt-6 space-y-4">
              {solution.challenges.map((c) => (
                <li key={c} className="flex gap-3 text-[0.95rem] leading-snug text-white/75">
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-[2px] border border-white/40" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-ink-800 p-7 sm:p-9">
            <p className="font-mono text-[0.7rem] tracking-[0.16em] text-lime uppercase">How we help</p>
            <ol className="mt-6 space-y-5">
              {solution.approach.map((a, i) => (
                <li key={a.title} className="flex gap-4">
                  <span className="font-mono text-sm text-lime">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-semibold text-white">{a.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">{a.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* Typical projects + budget */}
      <Section labelledBy="projects-title">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow className="mb-5">Typical projects</Eyebrow>
            <h2 id="projects-title" className="text-3xl leading-tight sm:text-4xl">What We Often Build</h2>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {solution.typicalProjects.map((p) => (
                <li key={p} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">{p}</li>
              ))}
            </ul>
          </div>
          <div className="dark relative overflow-hidden rounded-2xl bg-background p-8 text-foreground">
            <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
            <p className="font-mono text-xs tracking-[0.08em] text-white/45 uppercase">Investment guide</p>
            <p className="mt-3 text-xl leading-snug font-semibold">{solution.budgetGuide}</p>
            <p className="mt-4 text-sm text-white/55">Indicative only. Every estimate is tailored to your scope, complexity and integrations in a written proposal before anything is agreed.</p>
            <Button asChild className="mt-7" size="xl"><Link href="/pricing">See Full Pricing Guide</Link></Button>
          </div>
        </div>
      </Section>

      {/* Relevant services */}
      <Section tone="wash" labelledBy="services-title">
        <SectionHeader id="services-title" eyebrow="Relevant services" title="Where to Start" />
        <div className="grid gap-5 md:grid-cols-3">
          {relatedServices.map((s) => <ServiceCard key={s.slug} service={s} showPrice />)}
        </div>
      </Section>

      {/* Process, security & support — same for every engagement, so we say it once, clearly */}
      <Section labelledBy="delivery-title">
        <h2 id="delivery-title" className="sr-only">Process, security and support</h2>
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div className="rounded-2xl border border-border bg-card p-7">
            <Eyebrow className="mb-4">Process</Eyebrow>
            <h3 className="text-lg font-semibold">The Same Clear Stages, Every Time</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">Discovery, planning, design, build, testing, launch and support — regardless of project size.</p>
            <Link href="/process" className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <span className="link-underline">See our full process</span> <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-7">
            <Eyebrow className="mb-4">Security</Eyebrow>
            <h3 className="text-lg font-semibold">Built With Data Protection in Mind</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">Access control, secure-by-design engineering and clear data handling on every project, including any AI components.</p>
            <Link href="/faq#ai-technology" className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <span className="link-underline">Read our AI & data FAQs</span> <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-7">
            <Eyebrow className="mb-4">Support</Eyebrow>
            <h3 className="text-lg font-semibold">We Don&apos;t Disappear at Launch</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">Ongoing maintenance, updates and improvements are available after go-live, for as long as you need them.</p>
            <Link href="/services/maintenance-support" className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <span className="link-underline">Maintenance & support</span> <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      <CtaSection />
    </>
  )
}
