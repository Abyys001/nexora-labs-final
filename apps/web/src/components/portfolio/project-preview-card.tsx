import { ArrowUpRight, ExternalLink } from "lucide-react"
import Link from "next/link"

import { previewThemes, type Project } from "@/lib/projects"
import { cn } from "@/lib/utils"

import { SitePreview } from "./site-preview"

/** Interaction variants rotate across a grid so no two neighbouring cards behave identically. */
export const projectCardVariants = ["rise", "pan", "tilt", "slide"] as const
export type ProjectCardVariant = (typeof projectCardVariants)[number]
export const projectVariantFor = (index: number): ProjectCardVariant => projectCardVariants[index % projectCardVariants.length]

export function ProjectPreviewCard({
  project,
  variant = "rise",
  size = "default",
  className,
}: {
  project: Project
  variant?: ProjectCardVariant
  /** `feature` gives the preview more room and reveals the capability chips. */
  size?: "default" | "feature" | "compact"
  className?: string
}) {
  const accent = previewThemes[project.previewTheme].accent
  const capabilities = project.capabilities.slice(0, size === "feature" ? 4 : 3)

  return (
    <article
      data-variant={variant}
      className={cn(
        "project-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-800",
        size === "feature" ? "lg:flex-row" : "",
        className,
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden p-4 sm:p-5", size === "feature" ? "lg:w-[52%] lg:p-7" : "")}>
        <SitePreview layout={project.previewLayout} theme={project.previewTheme} websiteUrl={project.websiteUrl} label={project.title} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(70% 55% at 50% 0%, ${previewThemes[project.previewTheme].soft}, transparent 70%)` }}
        />
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col p-5 pt-0 sm:p-6 sm:pt-0", size === "feature" ? "lg:p-8 lg:pl-0" : "")}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
          <span style={{ color: accent }}>{project.industry}</span>
          <span aria-hidden="true" className="text-white/20">
            /
          </span>
          <span className="text-white/40">{project.category}</span>
        </p>

        <h3 className={cn("mt-2 font-heading text-white", size === "feature" ? "text-2xl sm:text-3xl" : "text-xl")}>
          <Link href={`/work/${project.slug}`} className="outline-none after:absolute after:inset-0 focus-visible:underline">
            {project.title}
          </Link>
        </h3>

        <p className={cn("mt-3 leading-relaxed text-white/55", size === "compact" ? "text-sm" : "")}>{project.shortDescription}</p>

        {capabilities.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {capabilities.map((capability) => (
              <li key={capability} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.7rem] text-white/60">
                {capability}
              </li>
            ))}
            {project.capabilities.length > capabilities.length ? (
              <li className="rounded-full px-2 py-1 font-mono text-[0.7rem] text-white/35">+{project.capabilities.length - capabilities.length}</li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: accent }}>
            View project
            <ArrowUpRight className="project-arrow size-4" aria-hidden="true" />
          </span>
          {project.websiteUrl ? (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              // Above the card-wide link overlay, so the live site stays reachable.
              className="relative z-10 inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Visit live site
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
