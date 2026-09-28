import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { ClosingCta } from "@/components/home/closing-cta"
import { DataToDecisions } from "@/components/home/data-to-decisions"
import { HeroEcosystem } from "@/components/home/hero-ecosystem"
import { IndustrySelector, type IndustryOption } from "@/components/home/industry-selector"
import { ProcessTrack } from "@/components/home/process-track"
import { ServicesBento } from "@/components/home/services-bento"
import { SelectedWork } from "@/components/home/selected-work"
import { TechEcosystem } from "@/components/home/tech-ecosystem"
import { AnimatedCounter } from "@/components/motion/animated-counter"
import { LiveRegion } from "@/components/motion/live-region"
import { Magnetic } from "@/components/motion/magnetic"
import { Reveal } from "@/components/motion/reveal"
import { FaqList } from "@/components/sections/faq-list"
import { InvestmentSpectrum } from "@/components/sections/investment-spectrum"
import { Button } from "@/components/ui/button"
import { homeFaqs, processSteps } from "@/content/company"
import { industries } from "@/content/industries"
import { pricingDisclaimer, pricingTiers } from "@/content/pricing"
import { getService, services } from "@/content/services"
import { technologies } from "@/content/site"
import { pageMetadata } from "@/lib/seo"
import { getProjects } from "@/lib/server/projects"

export const metadata = {
  ...pageMetadata({
    title: "Custom Software, AI & Digital Solutions",
    description:
      "Nexora Labs designs and builds custom software, AI solutions, web platforms, mobile apps and business systems for companies ready to grow. Projects from £2,000.",
    path: "/",
  }),
  title: { absolute: "Nexora Labs | Custom Software, AI & Digital Solutions" },
}

const capabilities = ["Custom software", "AI assistants", "Web platforms", "Mobile apps", "CRM systems", "Automation", "E-commerce", "Cloud & DevOps", "Data & analytics", "Integrations"]

const sectors = industries.filter((i) => !i.audience)

const industryOptions: IndustryOption[] = sectors.map((i) => ({
  slug: i.slug,
  name: i.name,
  tagline: i.tagline,
  summary: i.summary,
  challenges: i.challenges,
  solutions: i.solutions,
  icon: i.brandIcon,
  services: i.services.flatMap((slug) => {
    const s = getService(slug)
    return s ? [{ name: s.navLabel, href: `/services/${s.slug}` }] : []
  }),
}))

function SectionIntro({ eyebrow, title, intro, id, dark = false }: { eyebrow: string; title: React.ReactNode; intro?: string; id: string; dark?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={`font-mono text-xs tracking-[0.16em] uppercase ${dark ? "text-lime" : "text-foreground/55"}`}>
        <span aria-hidden="true" className={dark ? "text-white/30" : "text-foreground/30"}>[ </span>
        {eyebrow}
        <span aria-hidden="true" className={dark ? "text-white/30" : "text-foreground/30"}> ]</span>
      </p>
      <h2 id={id} className="mt-5 text-3xl leading-[1.15] sm:text-4xl lg:text-[2.85rem]">
        {title}
      </h2>
      {intro ? <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-white/60" : "text-muted-foreground"}`}>{intro}</p> : null}
    </div>
  )
}

export default async function HomePage() {
  const projects = await getProjects({ homepageOnly: true })

  return (
    <>
      {/* 1 · Hero — split, living ecosystem */}
      <LiveRegion as="section" aria-labelledby="hero-title" className="dark relative isolate overflow-hidden bg-black text-foreground">
        <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_70%_30%,black_10%,transparent_70%)]" />
        <div aria-hidden="true" className="absolute top-0 right-0 -z-10 h-[640px] w-[820px] translate-x-1/4 -translate-y-1/3 rounded-full bg-lime/20 blur-[150px]" />
        <div className="container-page grid items-center gap-12 pt-12 pb-28 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-20 lg:pb-36">
          <div>
            <Reveal variant="fade">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pr-4 pl-1.5 text-xs text-white/70">
                <span className="rounded-full bg-lime px-2 py-0.5 font-mono text-[0.65rem] font-semibold text-black">UK</span>
                Software · AI · Web · Mobile · Business Systems
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 id="hero-title" className="mt-8 text-[2.5rem] leading-[1.12] sm:text-6xl lg:text-[4.1rem]">
                Technology built around <span className="text-lime">your business.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
                We design and build custom software, AI solutions, web platforms, mobile apps and business systems that help companies work smarter, serve customers better and grow with confidence.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic>
                <Button asChild size="xl" className="group w-full sm:w-auto">
                  <Link href="/project-builder">
                    Start a Project <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
                  </Link>
                </Button>
              </Magnetic>
              <Button asChild size="xl" variant="outline">
                <Link href="/services">Explore Services</Link>
              </Button>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-8 font-mono text-xs text-white/45">
                Projects from <span className="text-white">£2,000</span> · typical investment <span className="text-white">£5k–£15k</span>
              </p>
            </Reveal>
          </div>
          <HeroEcosystem />
        </div>
      </LiveRegion>

      {/* 2 · Capability ticker + honest numbers, overlapping the hero edge */}
      <section aria-label="What we do" className="relative z-10 -mt-12 rounded-t-[2.5rem] bg-background pt-10">
        <LiveRegion className="relative overflow-hidden border-b border-border pb-10 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex w-max gap-10 [--marquee-duration:50s]">
            {[...capabilities, ...capabilities].map((c, i) => (
              <span key={i} aria-hidden={i >= capabilities.length} className="flex items-center gap-10 font-mono text-sm whitespace-nowrap text-foreground/55">
                {c}
                <span className="size-1.5 rounded-[2px] bg-foreground/25" />
              </span>
            ))}
          </div>
        </LiveRegion>
        <div className="container-page">
          <dl className="grid grid-cols-2 gap-px overflow-hidden border-b border-border bg-border lg:grid-cols-4">
            {[
              { value: services.length, suffix: "", label: "service areas under one team" },
              { value: sectors.length, suffix: "", label: "industries we build for" },
              { value: 2, prefix: "£", suffix: "k", label: "starting project investment" },
              { value: 1, suffix: " day", label: "target reply to every enquiry" },
            ].map((stat) => (
              <div key={stat.label} className="bg-background px-2 py-8 sm:px-6">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} className="font-heading text-3xl sm:text-4xl" />
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3 · Services — bento */}
      <section aria-labelledby="services-title" className="section-y bg-background">
        <div className="container-page">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionIntro id="services-title" eyebrow="What we build" title="One partner, from first website to core business systems." />
            <Button asChild size="xl" variant="outline" className="group shrink-0">
              <Link href="/services">
                All {services.length} services <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <ServicesBento />
        </div>
      </section>

      {/* 4 · Industries — horizontal selector */}
      <section aria-labelledby="industries-title" className="section-y bg-soft">
        <div className="container-page">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionIntro
              id="industries-title"
              eyebrow="Industries"
              title="Every sector has its own problems. We learn yours first."
              intro="Pick an industry to see the challenges we typically meet there and what we build to solve them."
            />
            <Link href="/industries" className="group inline-flex items-center gap-1.5 text-sm font-semibold">
              <span className="link-underline">All {sectors.length} industries</span> <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
            </Link>
          </div>
          <IndustrySelector options={industryOptions} />
        </div>
      </section>

      {/* 5 · From data to decisions — pinned media + scroll steps */}
      <LiveRegion as="section" aria-labelledby="ai-title" className="dark relative isolate bg-black text-foreground">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 rounded-b-[2.5rem] bg-soft" />
        <div className="container-page section-y relative pt-40!">
          <div className="mb-16 max-w-3xl">
            <SectionIntro
              dark
              id="ai-title"
              eyebrow="How we use AI"
              title={<>From data to <span className="text-lime">decisions.</span></>}
              intro="AI is only useful when it is connected to your real data and your real processes. This is the path we follow on every AI project."
            />
          </div>
          <DataToDecisions />
        </div>
      </LiveRegion>

      {/* 6 · Technology ecosystem */}
      <LiveRegion as="section" aria-labelledby="tech-title" className="dark relative isolate overflow-hidden border-t border-white/[0.06] bg-ink-800 text-foreground">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" />
        <div className="container-page section-y">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionIntro dark id="tech-title" eyebrow="Technology" title="Proven tools, chosen for the job." intro="We pick mature, well-supported technology so your product is easy to run, extend and hand over." />
            <Link href="/technologies" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-lime">
              <span className="link-underline">Our technology approach</span> <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
            </Link>
          </div>
          <TechEcosystem groups={technologies} />
        </div>
      </LiveRegion>

      {/* 7 · Investment spectrum */}
      <section aria-labelledby="pricing-title" className="section-y relative z-10 -mt-10 rounded-t-[2.5rem] bg-background">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
            <div>
              <SectionIntro id="pricing-title" eyebrow="Investment" title="Clear about cost from the first conversation." intro="Typical project ranges, so you can plan before you speak to us. Every estimate is tailored to your scope." />
              <Button asChild size="xl" variant="outline" className="group mt-8">
                <Link href="/pricing">
                  Full pricing guide <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div>
              <InvestmentSpectrum tiers={pricingTiers} />
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{pricingDisclaimer}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8 · Selected work — the one portfolio moment on the homepage */}
      <SelectedWork projects={projects} />

      {/* 9 · Process — timeline */}
      <section aria-labelledby="process-title" className="section-y bg-soft">
        <div className="container-page">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionIntro id="process-title" eyebrow="Process" title="From idea to launch, in five clear steps." />
            <Link href="/process" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold">
              <span className="link-underline">How we work</span> <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
            </Link>
          </div>
          <ProcessTrack steps={processSteps} />
        </div>
      </section>

      {/* 10 · FAQ */}
      <section aria-labelledby="faq-title" className="section-y bg-background">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <SectionIntro id="faq-title" eyebrow="FAQ" title="Questions we're often asked." intro="Can't find what you're looking for? Our team is happy to help." />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="xl"><Link href="/faq">All FAQs</Link></Button>
              <Button asChild variant="ghost" size="xl"><Link href="/contact">Talk to our team</Link></Button>
            </div>
          </div>
          <FaqList faqs={homeFaqs} withSchema={false} />
        </div>
      </section>

      <ClosingCta />
    </>
  )
}
