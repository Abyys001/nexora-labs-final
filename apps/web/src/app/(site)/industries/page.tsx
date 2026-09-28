import { IndustryBento } from "@/components/sections/industry-bento"
import { IndustryCard } from "@/components/sections/industry-card"
import { CtaSection } from "@/components/sections/cta-section"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { industries } from "@/content/industries"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Industries We Work With",
  description:
    "Software, AI and digital solutions for finance, healthcare, real estate, e-commerce, logistics, education, hospitality, professional services, startups, SMEs and enterprise.",
  path: "/industries",
})

const sectors = industries.filter((i) => !i.audience)
const segments = industries.filter((i) => i.audience)
// Strip the non-serialisable lucide `icon` before crossing into the client bento grid.
const sectorTiles = sectors.map(({ slug, name, tagline, summary, group, brandIcon }) => ({ slug, name, tagline, summary, group, brandIcon }))

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Industries", path: "/industries" }]}
        eyebrow="Industries"
        title="Technology for Different Industries"
        intro="Every sector has its own pressures. We focus on the customer and operational challenges behind them, and build practical solutions that fit."
      />

      <Section tone="wash" labelledBy="sectors-title">
        <SectionHeader id="sectors-title" eyebrow={`${sectors.length} sectors`} title="Find Your Industry" intro="Filter by category, or browse everything at once." />
        <IndustryBento industries={sectorTiles} />
      </Section>

      {/* Audience segments — by business stage, not sector: kept visually distinct on a dark band */}
      <Section tone="dark" labelledBy="segments-title">
        <SectionHeader
          tone="dark"
          id="segments-title"
          eyebrow="By business stage"
          title="We Also Think in Terms of Where You Are, Not Just What You Do"
          intro="Startups, SMEs, growing businesses and enterprises face different pressures even within the same sector."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {segments.map((industry) => <IndustryCard key={industry.slug} industry={industry} variant="dark" />)}
        </div>
      </Section>

      <CtaSection title="Don't See Your Sector?" text="Most business problems, like manual work, disconnected systems or poor customer experience, are universal. Tell us about yours." />
    </>
  )
}
