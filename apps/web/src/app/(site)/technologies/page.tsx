import Link from "next/link"

import { TechEcosystem, TechLogo } from "@/components/home/tech-ecosystem"
import { CtaSection } from "@/components/sections/cta-section"
import { FeatureGrid } from "@/components/sections/feature-grid"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { technologies } from "@/content/site"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Technology We Use",
  description:
    "The AI, product, cloud and business technology Nexora Labs builds with, and how we decide what to use on your project.",
  path: "/technologies",
})

const principles = [
  { title: "Mature over trendy", description: "We reach for tools with a track record of stability, security and long-term support, not whatever launched this week." },
  { title: "Sized to the budget", description: "A £3,000 website doesn't need the same infrastructure as a £30,000 platform. We pick technology that fits the project, not the other way round." },
  { title: "Easy to hand over", description: "Widely used languages and frameworks mean another developer, or your own future hire, can pick up the project without starting again." },
  { title: "No unnecessary lock-in", description: "Where a managed service makes sense we'll say so, but we avoid dependencies that would trap you if you ever wanted to leave." },
]

export default function TechnologiesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Technologies", path: "/technologies" }]}
        eyebrow="Technologies"
        title="Proven Tools, Chosen for the Job."
        intro="We're not attached to any single framework or vendor. We pick mature, well-supported technology so your product is easy to run, extend and hand over."
      />

      <Section labelledBy="how-title">
        <SectionHeader id="how-title" eyebrow="How we decide" title="How We Choose Technology" intro="Every project starts from the problem, not a preferred stack. These are the principles behind the choices we make." />
        <FeatureGrid items={principles} columns={4} numbered />
      </Section>

      <Section tone="dark" labelledBy="ecosystem-title">
        <SectionHeader tone="dark" id="ecosystem-title" eyebrow="The stack" title="Four Groups of Tools, One Team" intro="Select a group to see what sits inside it and how the pieces connect around your product." />
        <TechEcosystem groups={technologies} />
      </Section>

      <Section tone="wash" labelledBy="all-title">
        <SectionHeader id="all-title" eyebrow="At a glance" title="Everything We Work With" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((group) => (
            <div key={group.name} className="reveal card-lift rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold">{group.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{group.blurb}</p>
              <ul className="mt-6 grid grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <li key={item.name} className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-soft p-3 text-center transition-colors hover:border-foreground/20 hover:bg-black">
                    <TechLogo slug={item.slug} name={item.name} className="size-6 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
                    <span className="text-[0.68rem] leading-tight text-muted-foreground group-hover:text-white/70">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="soft" labelledBy="explore-title">
        <SectionHeader id="explore-title" eyebrow="See it in context" title="Where This Technology Shows Up" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/services" className="card-lift group rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold group-hover:text-primary">Our services</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">What we build with this stack, from websites to AI platforms.</p>
          </Link>
          <Link href="/work" className="card-lift group rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold group-hover:text-primary">Example projects</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">How the tools come together on real kinds of projects.</p>
          </Link>
          <Link href="/blog" className="card-lift group rounded-2xl border border-border bg-card p-6">
            <p className="font-semibold group-hover:text-primary">Insights</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Guides on choosing and using technology well.</p>
          </Link>
        </div>
      </Section>

      <CtaSection title="Not Sure What You Need Yet?" text="Tell us about the problem you're solving. We'll recommend the right technology once we understand the goal, not before." />
    </>
  )
}
