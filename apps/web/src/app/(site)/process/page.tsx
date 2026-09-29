import { LiveRegion } from "@/components/motion/live-region"
import { CtaSection } from "@/components/sections/cta-section"
import { FeatureGrid } from "@/components/sections/feature-grid"
import { PageHero } from "@/components/sections/page-hero"
import { ProcessTimeline } from "@/components/sections/process-timeline"
import { Section, SectionHeader } from "@/components/sections/section"
import { detailedProcess } from "@/content/company"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Our Process: From Idea to Launch",
  description:
    "How Cybercina delivers software projects: discovery, requirements, planning, design, development, testing, launch and ongoing support.",
  path: "/process",
})

const principles = [
  { title: "You see progress early", description: "Regular demos of working software, not just status reports." },
  { title: "No surprises on cost", description: "Changes are discussed openly with their impact on scope and budget." },
  { title: "Plain-language updates", description: "Clear communication without unnecessary jargon." },
  { title: "Quality built in", description: "Testing and review happen throughout, not only at the end." },
]

const stageNames = detailedProcess.map((s) => s.title)

export default function ProcessPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Our Process", path: "/process" }]}
        eyebrow="Our process"
        title="A Clear Path From Idea to Launch"
        intro="Great software comes from a process that's structured enough to be predictable and flexible enough to respond to what we learn along the way."
      />

      <LiveRegion className="relative overflow-hidden border-b border-border bg-background pb-8 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex w-max gap-10 [--marquee-duration:38s]">
          {[...stageNames, ...stageNames].map((name, i) => (
            <span key={i} aria-hidden={i >= stageNames.length} className="flex items-center gap-10 font-mono text-sm whitespace-nowrap text-foreground/55">
              <span className="text-foreground/30">{String((i % stageNames.length) + 1).padStart(2, "0")}</span> {name}
              <span className="size-1.5 rounded-[2px] bg-foreground/25" />
            </span>
          ))}
        </div>
      </LiveRegion>

      <Section tone="wash" labelledBy="timeline-title">
        <SectionHeader id="timeline-title" eyebrow="Eight stages" title="How Every Project Moves Forward" align="center" intro="Smaller projects move through these stages quickly; larger platforms repeat design, development and testing in cycles." />
        <ProcessTimeline steps={detailedProcess} />
      </Section>

      <Section tone="dark" labelledBy="principles-title">
        <SectionHeader tone="dark" id="principles-title" eyebrow="Principles" title="What You Can Expect Throughout" align="center" />
        <FeatureGrid items={principles} columns={4} numbered />
      </Section>

      <CtaSection
        eyebrow="Ready to start?"
        title="Let's Map Your Project Onto This Process"
        text="Tell us what you're trying to build and we'll walk you through how these stages would apply to your project."
      />
    </>
  )
}
