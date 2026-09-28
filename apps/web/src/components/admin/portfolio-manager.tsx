"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, ExternalLink, Plus, Save, Star } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { services } from "@/content/services"

import { useCan } from "./admin-context"
import { archiveProject, createProject, fetchProjects, projectKeys, updateProject, type ProjectInput, type ProjectRow } from "./api"
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, Pill, SavingButton, shortDate, TableScroll } from "./ui"

const themes = ["ink", "amber", "azure", "violet", "steel"] as const
const layouts = ["standard", "hospitality", "commerce", "services", "booking"] as const
const statuses = ["published", "draft", "archived"] as const

const statusTone = { published: "positive", draft: "warning", archived: "neutral" } as const

const emptyProject: ProjectInput = {
  slug: "",
  title: "",
  client: "",
  industry: "",
  category: "",
  shortDescription: "",
  detailedDescription: "",
  clientNeed: "",
  whatWeBuilt: "",
  customerExperience: "",
  businessFunctionality: "",
  services: [],
  capabilities: [],
  technologies: [],
  previewTheme: "ink",
  previewLayout: "standard",
  gallery: [],
  featured: false,
  homepageVisible: true,
  status: "draft",
  sortOrder: 99,
}

const toLines = (values: string[]) => values.join("\n")
const fromLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

/**
 * Portfolio management. Everything shown on /work is editable here — copy,
 * capabilities, ordering, visibility and the generated preview's look.
 */
export function PortfolioManager() {
  const canEdit = useCan("manager")
  const query = useQuery({ queryKey: projectKeys.list, queryFn: fetchProjects })
  const [editing, setEditing] = useState<ProjectRow | "new" | null>(null)

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Portfolio" description="The projects shown on /work and on the homepage." />
        <LoadingBlock label="Loading portfolio" rows={4} />
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        <PageHeader title="Portfolio" />
        <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Real client work shown on /work. Keep every description to what the live site actually does — no invented metrics, outcomes or testimonials."
        action={
          canEdit ? (
            <Button size="lg" onClick={() => setEditing(editing === "new" ? null : "new")}>
              <Plus data-icon="inline-start" /> {editing === "new" ? "Cancel" : "New project"}
            </Button>
          ) : null
        }
      />

      {editing ? <ProjectForm project={editing === "new" ? null : editing} onDone={() => setEditing(null)} /> : null}

      <Panel title="Projects">
        {query.data.length === 0 ? (
          <EmptyState title="No projects yet" description="Add the first project to populate the Selected Work page." />
        ) : (
          <TableScroll>
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                  <th className="py-2 pr-4 font-medium">Project</th>
                  <th className="py-2 pr-4 font-medium">Industry</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Visibility</th>
                  <th className="py-2 pr-4 font-medium">Order</th>
                  <th className="py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((project) => (
                  <tr key={project.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => setEditing(project)}
                        className="text-left font-semibold hover:text-primary disabled:cursor-default disabled:hover:text-foreground"
                        disabled={!canEdit}
                      >
                        {project.title}
                      </button>
                      <span className="block font-mono text-[0.7rem] text-muted-foreground">/work/{project.slug}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs">{project.industry}</td>
                    <td className="py-3 pr-4">
                      <Pill tone={statusTone[project.status]}>{project.status}</Pill>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {project.featured ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Star className="size-3.5" aria-hidden="true" /> Featured
                          </span>
                        ) : null}
                        {project.homepageVisible ? <span>Homepage</span> : <span className="opacity-50">Work page only</span>}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{project.sortOrder}</td>
                    <td className="py-3 text-xs text-muted-foreground">{shortDate(project.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </Panel>
    </>
  )
}

function ProjectForm({ project, onDone }: { project: ProjectRow | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ProjectInput>(() =>
    project
      ? {
          ...project,
          location: project.location ?? undefined,
          websiteUrl: project.websiteUrl ?? undefined,
          heroImage: project.heroImage ?? undefined,
          previewImage: project.previewImage ?? undefined,
        }
      : emptyProject,
  )
  const [lists, setLists] = useState({
    capabilities: toLines(project?.capabilities ?? []),
    technologies: toLines(project?.technologies ?? []),
  })

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: projectKeys.list })
  }

  const payload = (): ProjectInput => ({
    ...form,
    capabilities: fromLines(lists.capabilities),
    technologies: fromLines(lists.technologies),
    location: form.location?.trim() || undefined,
    websiteUrl: form.websiteUrl?.trim() || undefined,
  })

  const save = useMutation({
    mutationFn: () => (project ? updateProject(project.id, payload()) : createProject(payload())),
    onSuccess: () => {
      toast.success(project ? "Project updated" : "Project created")
      invalidate()
      onDone()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const archive = useMutation({
    mutationFn: () => archiveProject(project!.id),
    onSuccess: () => {
      toast.success("Project archived")
      invalidate()
      onDone()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const ready =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug) &&
    form.title.trim() &&
    form.client.trim() &&
    form.industry.trim() &&
    form.category.trim() &&
    form.shortDescription.trim()

  return (
    <Panel title={project ? `Edit ${project.title}` : "New project"} className="mb-6">
      <form
        className="grid gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Text label="Title" value={form.title} onChange={(v) => set("title", v)} required />
          <Text label="Slug" value={form.slug} onChange={(v) => set("slug", v)} hint="Lowercase, hyphenated. Becomes /work/<slug>." required />
          <Text label="Client / business" value={form.client} onChange={(v) => set("client", v)} required />
          <Text label="Industry" value={form.industry} onChange={(v) => set("industry", v)} hint="Used as a filter on /work." required />
          <Text label="Category" value={form.category} onChange={(v) => set("category", v)} hint="Solution type, e.g. Booking System." required />
          <Text label="Location" value={form.location ?? ""} onChange={(v) => set("location", v)} />
          <Text label="Website URL" value={form.websiteUrl ?? ""} onChange={(v) => set("websiteUrl", v)} hint="Include https://" className="lg:col-span-2" />
          <Number label="Sort order" value={form.sortOrder} onChange={(v) => set("sortOrder", v)} />
        </div>

        <Area label="Short description" value={form.shortDescription} onChange={(v) => set("shortDescription", v)} rows="min-h-20" hint="One sentence, shown on cards." />
        <Area label="Detailed description" value={form.detailedDescription} onChange={(v) => set("detailedDescription", v)} />

        <div className="grid gap-4 lg:grid-cols-2">
          <Area label="What the client needed" value={form.clientNeed} onChange={(v) => set("clientNeed", v)} />
          <Area label="What we built" value={form.whatWeBuilt} onChange={(v) => set("whatWeBuilt", v)} />
          <Area label="The customer experience" value={form.customerExperience} onChange={(v) => set("customerExperience", v)} />
          <Area label="What it does for the business" value={form.businessFunctionality} onChange={(v) => set("businessFunctionality", v)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Area
            label="Capabilities"
            value={lists.capabilities}
            onChange={(v) => setLists({ ...lists, capabilities: v })}
            hint="One per line. Only functionality visible on the live site."
          />
          <Area label="Technologies" value={lists.technologies} onChange={(v) => setLists({ ...lists, technologies: v })} hint="One per line." />
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">Services delivered</legend>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {services.map((service) => {
              const on = form.services.includes(service.slug)
              return (
                <button
                  key={service.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set("services", on ? form.services.filter((s) => s !== service.slug) : [...form.services, service.slug])}
                  className={
                    on
                      ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      : "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }
                >
                  {service.navLabel}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Preview theme" value={form.previewTheme} options={themes} onChange={(v) => set("previewTheme", v as ProjectInput["previewTheme"])} />
          <Select label="Preview layout" value={form.previewLayout} options={layouts} onChange={(v) => set("previewLayout", v as ProjectInput["previewLayout"])} />
          <Select label="Status" value={form.status} options={statuses} onChange={(v) => set("status", v as ProjectInput["status"])} />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 text-sm">
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} /> Featured
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <Switch checked={form.homepageVisible} onCheckedChange={(v) => set("homepageVisible", v)} /> Show on homepage
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <SavingButton pending={save.isPending} type="submit" size="lg" disabled={!ready}>
            <Save data-icon="inline-start" /> {project ? "Save project" : "Create project"}
          </SavingButton>
          <Button type="button" variant="ghost" size="lg" onClick={onDone}>
            Cancel
          </Button>
          {project?.websiteUrl ? (
            <Button asChild variant="ghost" size="lg">
              <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink data-icon="inline-start" /> Live site
              </a>
            </Button>
          ) : null}
          {project && project.status !== "archived" ? (
            <SavingButton pending={archive.isPending} type="button" size="lg" variant="destructive" className="ml-auto" onClick={() => archive.mutate()}>
              <Archive data-icon="inline-start" /> Archive
            </SavingButton>
          ) : null}
        </div>
      </form>
    </Panel>
  )
}

function Text({
  label,
  value,
  onChange,
  hint,
  required,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  required?: boolean
  className?: string
}) {
  const id = `project-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`
  return (
    <div className={`grid gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function Number({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const id = `project-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" step={1} value={value} onChange={(e) => onChange(globalThis.Number(e.target.value))} />
    </div>
  )
}

function Area({ label, value, onChange, hint, rows }: { label: string; value: string; onChange: (value: string) => void; hint?: string; rows?: string }) {
  const id = `project-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} className={rows ?? "min-h-28"} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  const id = `project-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm capitalize">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
