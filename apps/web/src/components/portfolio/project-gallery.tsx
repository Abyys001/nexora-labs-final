"use client"

import { useMemo, useState } from "react"

import { categoriesOf, industriesOf, type Project } from "@/lib/projects"
import { cn } from "@/lib/utils"

import { ProjectPreviewCard, projectVariantFor } from "./project-preview-card"

const ALL = "All"

/**
 * Filterable showcase. The layout alternates deliberately — a full-width
 * feature, then pairs — so it never settles into a three-column card grid.
 */
export function ProjectGallery({ projects }: { projects: Project[] }) {
  const industries = useMemo(() => [ALL, ...industriesOf(projects)], [projects])
  const categories = useMemo(() => [ALL, ...categoriesOf(projects)], [projects])
  const [industry, setIndustry] = useState(ALL)
  const [category, setCategory] = useState(ALL)

  const visible = projects.filter((project) => (industry === ALL || project.industry === industry) && (category === ALL || project.category === category))

  return (
    <div>
      <div className="grid gap-5 border-b border-white/10 pb-8 sm:grid-cols-2">
        <FilterRow legend="Industry" options={industries} value={industry} onChange={setIndustry} />
        <FilterRow legend="Solution type" options={categories} value={category} onChange={setCategory} />
      </div>

      <p aria-live="polite" className="mt-6 font-mono text-xs text-white/40">
        Showing {visible.length} of {projects.length} projects
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="font-semibold text-white">No projects match those filters</p>
          <button
            type="button"
            onClick={() => {
              setIndustry(ALL)
              setCategory(ALL)
            }}
            className="mt-4 text-sm font-semibold text-lime hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {visible.map((project, i) => {
            // Every third card runs the full width, so the page keeps an
            // editorial rhythm instead of settling into an even card grid.
            const wide = i % 3 === 0
            return (
              <li key={project.id} className={cn(wide && "md:col-span-2", !wide && i % 3 === 2 && "md:mt-10")}>
                <ProjectPreviewCard project={project} variant={projectVariantFor(i)} size={wide ? "feature" : "default"} className="h-full" />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function FilterRow({ legend, options, value, onChange }: { legend: string; options: string[]; value: string; onChange: (next: string) => void }) {
  return (
    <fieldset>
      <legend className="font-mono text-[0.68rem] tracking-[0.14em] text-white/40 uppercase">{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === value}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-lime",
              option === value ? "border-lime bg-lime font-medium text-ink" : "border-white/12 text-white/65 hover:border-white/30 hover:text-white",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
