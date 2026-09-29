import { ArrowRight, Phone } from "lucide-react"
import Link from "next/link"

import { JsonLd } from "@/components/layout/json-ld"
import { ProjectGallery } from "@/components/portfolio/project-gallery"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { Button } from "@/components/ui/button"
import { site } from "@/content/site"
import { industriesOf } from "@/lib/projects"
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo"
import { getProjects } from "@/lib/server/projects"

export const metadata = pageMetadata({
  title: "Selected Projects — Our Work",
  description:
    "Digital experiences and business systems Cybercina has built for real companies: restaurant platforms, an immigration services portal, a print e-commerce platform and automotive booking systems.",
  path: "/work",
})

const crumbs = [{ name: "Selected Work", path: "/work" }]

export default async function WorkPage() {
  const projects = await getProjects()
  const industries = industriesOf(projects)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs])} />
      <PageHero
        crumbs={crumbs}
        next="dark"
        eyebrow="Selected Work"
        title="Selected Projects"
        intro="Digital experiences and business systems built around how real companies work — from restaurant reservations and online ordering to immigration case handling, print commerce and garage booking."
        actions={
          <>
            <Button asChild size="xl">
              <Link href="/project-builder">
                Start your project <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <a href={site.phone.href}>
                <Phone className="size-4" data-icon="inline-start" aria-hidden="true" /> {site.phone.display}
              </a>
            </Button>
          </>
        }
      />

      <Section tone="dark">
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-20 text-center">
            <p className="font-heading text-xl text-white">Our project showcase is being updated</p>
            <p className="mx-auto mt-3 max-w-md text-white/55">
              It will be back shortly. In the meantime, tell us what you&apos;re building and we&apos;ll talk you through comparable work.
            </p>
            <Button asChild size="xl" className="mt-8 bg-lime text-ink hover:bg-lime/90">
              <Link href="/project-builder">Start a project</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
              <SectionHeader
                tone="dark"
                eyebrow="The work"
                title="Different industries, different problems, one way of working."
                intro="Every project below is a live website or system you can visit. We describe only what each one actually does — no invented metrics, no borrowed case studies."
              />
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                <Stat label="Live projects" value={String(projects.length)} />
                <Stat label="Industries" value={String(industries.length)} />
              </dl>
            </div>

            <ProjectGallery projects={projects} />
          </>
        )}
      </Section>

      <Section tone="dark" className="border-t border-white/10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl text-white sm:text-4xl">Have a project of your own?</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Tell us what you&apos;re building, what problem you need to solve, and where you want to take it.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="bg-lime text-ink hover:bg-lime/90">
              <Link href="/project-builder">
                Start Your Project <ArrowRight className="arrow-nudge" data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">Talk to us first</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink px-5 py-6">
      <dt className="font-mono text-[0.65rem] tracking-[0.12em] text-white/40 uppercase">{label}</dt>
      <dd className="mt-1.5 font-heading text-3xl text-lime">{value}</dd>
    </div>
  )
}
