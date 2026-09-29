// Portfolio projects, mirrored from apps/api/src/db/schema.ts (`projects`).
// Content is managed in /admin/portfolio; nothing here invents project facts.

export type PreviewTheme = "ink" | "amber" | "azure" | "violet" | "steel"
export type PreviewLayout = "standard" | "hospitality" | "commerce" | "services" | "booking"

export type Project = {
  id: string
  slug: string
  title: string
  client: string
  industry: string
  category: string
  location: string | null
  websiteUrl: string | null
  shortDescription: string
  detailedDescription: string
  clientNeed: string
  whatWeBuilt: string
  customerExperience: string
  businessFunctionality: string
  services: string[]
  capabilities: string[]
  technologies: string[]
  previewTheme: PreviewTheme
  previewLayout: PreviewLayout
  heroImage: string | null
  previewImage: string | null
  gallery: string[]
  featured: boolean
  homepageVisible: boolean
  status: "draft" | "published" | "archived"
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/** Accent per project, kept low-saturation so six previews still read as one system. */
export const previewThemes: Record<PreviewTheme, { accent: string; soft: string; label: string }> = {
  ink: { accent: "#bff747", soft: "rgb(191 247 71 / 0.16)", label: "Cybercina" },
  amber: { accent: "#d8a657", soft: "rgb(216 166 87 / 0.18)", label: "Warm" },
  azure: { accent: "#5aa9e6", soft: "rgb(90 169 230 / 0.18)", label: "Cool" },
  violet: { accent: "#9d8cf0", soft: "rgb(157 140 240 / 0.18)", label: "Violet" },
  steel: { accent: "#9aa4ad", soft: "rgb(154 164 173 / 0.18)", label: "Steel" },
}

/** Strips the scheme and trailing slash so a URL reads as a domain in the browser frame. */
export function displayDomain(url: string | null): string {
  if (!url) return "example.com"
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

export function industriesOf(projects: Project[]): string[] {
  return [...new Set(projects.map((project) => project.industry))].sort()
}

export function categoriesOf(projects: Project[]): string[] {
  return [...new Set(projects.map((project) => project.category))].sort()
}
