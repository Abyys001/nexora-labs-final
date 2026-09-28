import { ArrowRight, ExternalLink, MapPin } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/layout/json-ld"
import { SitePreview } from "@/components/portfolio/site-preview"
import { ProjectPreviewCard, projectVariantFor } from "@/components/portfolio/project-preview-card"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { Button } from "@/components/ui/button"
import { getService } from "@/content/services"
import { site } from "@/content/site"
import { previewThemes } from "@/lib/projects"
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo"
import { getProject, getProjects } from "@/lib/server/projects"

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } }

  return pageMetadata({
    title: `${project.title} — ${project.category}`,
    description: project.shortDescription,
    path: `/work/${project.slug}`,
  })
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const all = await getProjects()
  const related = all.filter((other) => other.slug !== project.slug).slice(0, 3)
  const accent = previewThemes[project.previewTheme].accent

  const crumbs = [
    { name: "Selected Work", path: "/work" },
    { name: project.title, path: `/work/${project.slug}` },
  ]

  const services = project.services.flatMap((serviceSlug) => {
    const service = getService(serviceSlug)
    return service ? [{ name: service.navLabel, summary: service.summary, href: `/services/${service.slug}` }] : []
  })

  const story: { title: string; body: string }[] = [
    { title: "What the client needed", body: project.clientNeed },
    { title: "What we built", body: project.whatWeBuilt },
    { title: "The customer experience", body: project.customerExperience },
    { title: "What it does for the business", body: project.businessFunctionality },
  ].filter((entry) => entry.body.trim().length > 0)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs])} />

      <PageHero
        crumbs={crumbs}
        next="dark"
        eyebrow={`${project.industry} · ${project.category}`}
        title={project.title}
        intro={project.shortDescription}
        aside={<SitePreview layout={project.previewLayout} theme={project.previewTheme} websiteUrl={project.websiteUrl} label={project.title} />}
        actions={
          project.websiteUrl ? (
            <Button asChild size="xl">
              <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                Visit the live site <ExternalLink className="size-4" data-icon="inline-end" aria-hidden="true" />
              </a>
            </Button>
          ) : undefined
        }
      />

      <Section tone="dark">
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Client" value={project.client} />
          <Fact label="Industry" value={project.industry} />
          <Fact label="Solution" value={project.category} />
          <Fact label="Location" value={project.location ?? "United Kingdom"} icon />
        </dl>

        {project.detailedDescription ? (
          <div className="mt-12 max-w-3xl">
            <p className="text-lg leading-relaxed text-white/70">{project.detailedDescription}</p>
          </div>
        ) : null}

        {story.length ? (
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2">
            {story.map((entry, i) => (
              <section key={entry.title} className="bg-ink p-7 sm:p-8">
                <p className="font-mono text-[0.65rem] tracking-[0.14em] uppercase" style={{ color: accent }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 font-heading text-xl text-white">{entry.title}</h2>
                <p className="mt-3 leading-relaxed text-white/60">{entry.body}</p>
              </section>
            ))}
          </div>
        ) : null}
      </Section>

      {project.capabilities.length ? (
        <Section tone="dark" className="border-t border-white/10">
          <SectionHeader
            tone="dark"
            eyebrow="Key capabilities"
            title="What the system actually does"
            intro="Functionality visible on the live site today. Nothing here is aspirational."
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {project.capabilities.map((capability, i) => (
              <li
                key={capability}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25"
                style={{ transitionDelay: `${i * 10}ms` }}
              >
                <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: accent }} />
                <span className="font-medium text-white/85">{capability}</span>
              </li>
            ))}
          </ul>

          {project.technologies.length ? (
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[0.65rem] tracking-[0.14em] text-white/35 uppercase">Built with</span>
              {project.technologies.map((tech) => (
                <span key={tech} className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/65">
                  {tech}
                </span>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}

      {services.length ? (
        <Section tone="dark" className="border-t border-white/10">
          <SectionHeader tone="dark" eyebrow="Services used" title="What we brought to this project" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.href}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-lime/50"
                >
                  <span className="font-heading text-lg text-white">{service.name}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{service.summary}</span>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-lime">
                    Explore service <ArrowRight className="arrow-nudge size-4" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {related.length ? (
        <Section tone="dark" className="border-t border-white/10">
          <SectionHeader tone="dark" eyebrow="More work" title="Other projects" />
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((other, i) => (
              <li key={other.id}>
                <ProjectPreviewCard project={other} variant={projectVariantFor(i)} size="compact" className="h-full" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

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
              <a href={site.phone.href}>{site.phone.display}</a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="bg-ink px-5 py-6">
      <dt className="font-mono text-[0.65rem] tracking-[0.12em] text-white/40 uppercase">{label}</dt>
      <dd className="mt-1.5 flex items-center gap-1.5 font-medium text-white">
        {icon ? <MapPin className="size-4 shrink-0 text-white/40" aria-hidden="true" /> : null}
        {value}
      </dd>
    </div>
  )
}
