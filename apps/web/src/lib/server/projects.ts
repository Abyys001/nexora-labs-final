import "server-only"

import type { Project } from "@/lib/projects"
import { API_URL } from "@/lib/server/api"

/**
 * Portfolio projects from the API. A build or render must never fail because
 * the API is briefly unavailable, so an empty list is returned instead and the
 * calling section renders its own empty state.
 */
export async function getProjects(options: { homepageOnly?: boolean } = {}): Promise<Project[]> {
  try {
    const query = options.homepageOnly ? "?homepage=true" : ""
    const res = await fetch(`${API_URL}/public/projects${query}`, {
      next: { revalidate: 300, tags: ["projects"] },
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) throw new Error(`Projects API responded ${res.status}`)
    return (await res.json()) as Project[]
  } catch (error) {
    console.error("Portfolio unavailable:", error instanceof Error ? error.message : error)
    return []
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_URL}/public/projects/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300, tags: ["projects"] },
      signal: AbortSignal.timeout(8_000),
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Project API responded ${res.status}`)
    return (await res.json()) as Project
  } catch (error) {
    console.error("Project unavailable:", error instanceof Error ? error.message : error)
    return null
  }
}
