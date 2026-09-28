import type { MetadataRoute } from "next"

import { blogCategories, posts } from "@/content/blog"
import { industries } from "@/content/industries"
import { services } from "@/content/services"
import { site } from "@/content/site"
import { solutions } from "@/content/solutions"
import { getProjects } from "@/lib/server/projects"

const staticPaths = [
  "", "/about", "/services", "/industries", "/technologies", "/work", "/pricing", "/process", "/blog",
  "/contact", "/project-builder", "/faq", "/privacy-policy", "/terms", "/cookie-policy",
]

// Build-time fallback for routes whose content has no explicit date of its own.
const buildDate = new Date().toISOString()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects()

  const entry = (path: string, priority: number, lastModified: string = buildDate): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    priority,
    lastModified,
  })
  return [
    ...staticPaths.map((p) => entry(p, p === "" ? 1 : p.startsWith("/privacy") || p === "/terms" || p === "/cookie-policy" ? 0.3 : 0.8)),
    ...services.map((s) => entry(`/services/${s.slug}`, 0.9)),
    ...solutions.map((s) => entry(`/solutions/${s.slug}`, 0.7)),
    ...industries.map((i) => entry(`/industries/${i.slug}`, 0.7)),
    ...projects.map((p) => entry(`/work/${p.slug}`, 0.7, p.updatedAt)),
    ...blogCategories.map((c) => entry(`/blog/category/${c.slug}`, 0.4)),
    ...posts.map((p) => entry(`/blog/${p.slug}`, 0.6, p.publishedAt)),
  ]
}
