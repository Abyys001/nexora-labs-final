import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { BrandIcon } from "@/components/icons/brand-icons"
import { JsonLd } from "@/components/layout/json-ld"
import { PointerSurface } from "@/components/motion/pointer-surface"
import { Reveal } from "@/components/motion/reveal"
import { CtaSection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { ServiceCard } from "@/components/sections/service-card"
import { Button } from "@/components/ui/button"
import { services, type Service } from "@/content/services"
import { site } from "@/content/site"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Software Development Services",
  description:
    "Custom software, web and mobile development, AI solutions, CRM systems, automation, e-commerce, cloud and design services with indicative pricing.",
  path: "/services",
})

const categories = [
  { key: "Build", eyebrow: "Build", title: "Products your customers and team use", blurb: "Websites, applications and platforms designed and built around your business." },
  { key: "Intelligent", eyebrow: "Intelligent", title: "AI, data and automation", blurb: "Practical AI and analytics that turn your information into decisions and time saved." },
  { key: "Business", eyebrow: "Business", title: "Systems that run operations", blurb: "The tools that manage customers, sales, stock and the everyday running of the business." },
  { key: "Infrastructure", eyebrow: "Infrastructure", title: "Reliable, secure foundations", blurb: "The hosting, security and ongoing care that keep everything else running." },
] as const

// Most ranges read "£X – £Y" (take the low end); a few read "From £X / month" already.
function fromPrice(service: Service) {
  const range = service.price.range.replace(/^from\s+/i, "")
  return range.split(/[–-]/)[0]?.trim()
}

function byCategory(key: Service["category"]) {
  return services.filter((s) => s.category === key)
}

export default function ServicesPage() {
  const build = byCategory("Build")
  const intelligent = byCategory("Intelligent")
  const business = byCategory("Business")
  const infrastructure = byCategory("Infrastructure")
  const [flagship, ...buildRest] = build

  return (
    <>
      <PageHero
        crumbs={[{ name: "Services", path: "/services" }]}
        eyebrow="Services"
        title="Software Solutions for Modern Businesses"
        intro="From a simple business website to a complete AI-powered enterprise platform, we create digital solutions designed around your goals."
        actions={
          <>
            <Button asChild size="xl"><Link href="/project-builder">Start a Project <ArrowRight data-icon="inline-end" /></Link></Button>
            <Button asChild size="xl" variant="outline"><Link href="/pricing">View Pricing</Link></Button>
          </>
        }
      />

      {/* Build — one flagship tile, the rest as a lift grid */}
      <Section labelledBy="build-title">
        <SectionHeader id="build-title" eyebrow={categories[0].eyebrow} title={categories[0].title} intro={categories[0].blurb} />
        {flagship ? (
          <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            <Reveal>
              <Link href={`/services/${flagship.slug}`} className="group dark relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-black p-8 text-foreground transition-colors hover:border-lime/40 sm:p-10">
                <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
                <div className="relative flex items-start justify-between">
                  <span className="icon-live flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white [--icon-accent:var(--lime)]">
                    <BrandIcon name={flagship.brandIcon} className="size-9" />
                  </span>
                  <span className="rounded-full border border-lime/30 bg-lime/10 px-3 py-1 font-mono text-[0.68rem] tracking-wide text-lime">flagship</span>
                </div>
                <h3 className="relative mt-8 max-w-md text-3xl leading-tight">{flagship.name}</h3>
                <p className="relative mt-4 max-w-md text-[1.05rem] leading-relaxed text-white/65">{flagship.summary}</p>
                <ul className="relative mt-6 flex flex-wrap gap-2">
                  {flagship.provides.slice(0, 4).map((item) => (
                    <li key={item.title} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">{item.title}</li>
                  ))}
                </ul>
                <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
                  <span className="font-mono text-[0.7rem] tracking-wide text-white/45">
                    from <span className="text-lime">{fromPrice(flagship)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-white/70 group-hover:text-lime">
                    Explore <ArrowUpRight className="arrow-nudge size-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {buildRest.slice(0, 4).map((s) => <ServiceCard key={s.slug} service={s} showPrice />)}
            </div>
          </div>
        ) : null}
        {buildRest.length > 4 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {buildRest.slice(4).map((s) => <ServiceCard key={s.slug} service={s} showPrice />)}
          </div>
        ) : null}
      </Section>

      {/* Intelligent — two large dark panels, asymmetric widths */}
      <Section tone="dark" labelledBy="intelligent-title">
        <SectionHeader tone="dark" id="intelligent-title" eyebrow={categories[1].eyebrow} title={categories[1].title} intro={categories[1].blurb} />
        <div className="grid gap-5 lg:grid-cols-2">
          {intelligent.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
              <Link href={`/services/${s.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 transition-colors hover:border-lime/40 sm:p-9">
                <span className="icon-live flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-black text-white [--icon-accent:var(--lime)]">
                  <BrandIcon name={s.brandIcon} className="size-8" />
                </span>
                <h3 className="mt-7 text-2xl">{s.name}</h3>
                <p className="mt-3 leading-relaxed text-white/60">{s.summary}</p>
                <ul className="mt-5 space-y-2.5">
                  {s.provides.slice(0, 3).map((item) => (
                    <li key={item.title} className="flex gap-2.5 text-sm text-white/70">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-[2px] bg-lime" />
                      {item.title}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                  <span className="font-mono text-[0.7rem] tracking-wide text-white/45">
                    from <span className="text-lime">{fromPrice(s)}</span>
                  </span>
                  <ArrowUpRight className="arrow-nudge size-5 text-white/50 group-hover:text-lime" aria-hidden="true" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Business — pointer-tracked glow grid */}
      <Section tone="soft" labelledBy="business-title">
        <SectionHeader id="business-title" eyebrow={categories[2].eyebrow} title={categories[2].title} intro={categories[2].blurb} />
        <div className="grid gap-5 sm:grid-cols-3">
          {business.map((s) => (
            <PointerSurface key={s.slug} className="h-full rounded-2xl">
              <ServiceCard service={s} variant="glow" showPrice />
            </PointerSurface>
          ))}
        </div>
      </Section>

      {/* Infrastructure — a plain, calm list: the opposite energy of the other three */}
      <Section labelledBy="infrastructure-title">
        <SectionHeader id="infrastructure-title" eyebrow={categories[3].eyebrow} title={categories[3].title} intro={categories[3].blurb} />
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {infrastructure.map((s) => (
            <li key={s.slug} className="reveal group">
              <Link href={`/services/${s.slug}`} className="flex flex-col gap-4 p-6 transition-colors hover:bg-soft sm:flex-row sm:items-center sm:gap-8 sm:p-7">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-soft text-foreground transition-colors group-hover:border-foreground/20 group-hover:bg-black group-hover:text-white [--icon-accent:var(--lime)]">
                  <BrandIcon name={s.brandIcon} className="size-6" />
                </span>
                <div className="flex-1">
                  <h3 className="text-lg">{s.name}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{s.summary}</p>
                </div>
                <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-1.5">
                  <span className="font-mono text-xs tracking-wide text-muted-foreground">
                    from <span className="font-semibold text-foreground">{fromPrice(s)}</span>
                  </span>
                  <ArrowUpRight className="arrow-nudge size-4 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaSection title="Not Sure Which Service You Need?" text="Most projects combine several services. Tell us the problem you're solving and we'll recommend the right approach." />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: `${site.url}/services/${s.slug}` })),
        }}
      />
    </>
  )
}
