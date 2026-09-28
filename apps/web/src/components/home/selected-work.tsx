import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { ProjectPreviewCard, projectVariantFor } from "@/components/portfolio/project-preview-card"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/projects"

/**
 * The homepage's single portfolio moment: one featured project alongside a
 * short editorial rail of the rest. Deliberately restrained — the full
 * showcase lives on /work.
 */
export function SelectedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  const [lead, ...rest] = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
  const supporting = rest.slice(0, 5)

  return (
    <section aria-labelledby="work-title" className="dark relative isolate overflow-hidden bg-ink-800 text-foreground">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_30%_0%,black,transparent_70%)]" />
      <div className="container-page section-y">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-[0.16em] text-lime uppercase">
              <span aria-hidden="true" className="text-white/30">
                [{" "}
              </span>
              Selected Work
              <span aria-hidden="true" className="text-white/30"> ]</span>
            </p>
            <h2 id="work-title" className="mt-5 text-3xl leading-[1.15] sm:text-4xl lg:text-[2.85rem]">
              Technology built for real businesses.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/60">
              A selection of digital products, business platforms and customer-facing experiences we&apos;ve designed and built across different industries.
            </p>
          </div>
          <Button asChild size="xl" variant="outline" className="group shrink-0 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/work">
              All selected work <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <Reveal>
          <ProjectPreviewCard project={lead} variant="pan" size="feature" />
        </Reveal>

        {supporting.length ? (
          <>
            {/* A rail rather than a grid: five equal cards would read as a template gallery. */}
            <ul className="work-rail mt-5 -mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {supporting.map((project, i) => (
                <li key={project.id} className="w-[19rem] shrink-0 sm:w-[21rem]">
                  <Reveal delay={i * 70} className="h-full">
                    <ProjectPreviewCard project={project} variant={projectVariantFor(i + 1)} size="compact" className="h-full" />
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-xs text-white/35 lg:hidden">Scroll for more →</p>
          </>
        ) : null}
      </div>
    </section>
  )
}
