import type { BrandIconName } from "@/components/icons/brand-icons"
import { industries } from "@/content/industries"
import { services } from "@/content/services"
import { headerNav, serviceMenu, type NavLink } from "@/content/site"

export type MenuEntry = { label: string; href: string; description: string; icon: BrandIconName }
export type MenuColumn = { title: string; blurb: string; entries: MenuEntry[] }

export type ResolvedNavItem =
  | { kind: "mega"; label: string; href: string; variant: "services" | "industries"; columns: MenuColumn[] }
  | { kind: "list"; label: string; links: NavLink[] }
  | { kind: "link"; label: string; href: string }

const industryGroupBlurbs: Record<string, string> = {
  Financial: "Money, lending and payments",
  "Commerce & Consumer": "Brands, retail and experiences",
  "Industrial & Mobility": "Assets, fleets and field teams",
  "Public & Knowledge": "Care, learning and content",
}

function serviceColumns(): MenuColumn[] {
  return serviceMenu.map((column) => ({
    title: column.title,
    blurb: column.blurb,
    entries: column.slugs.flatMap((slug) => {
      const service = services.find((s) => s.slug === slug)
      return service
        ? [{ label: service.navLabel, href: `/services/${service.slug}`, description: service.summary, icon: service.brandIcon }]
        : []
    }),
  }))
}

function industryColumns(): MenuColumn[] {
  const sectors = industries.filter((i) => !i.audience)
  return Object.entries(industryGroupBlurbs).map(([group, blurb]) => ({
    title: group,
    blurb,
    entries: sectors
      .filter((i) => i.group === group)
      .map((i) => ({ label: i.name, href: `/industries/${i.slug}`, description: i.tagline, icon: i.brandIcon })),
  }))
}

/** Header navigation with menu contents resolved from content, as plain data safe to pass to client components. */
export function resolveHeaderNav(): ResolvedNavItem[] {
  return headerNav.map((item) => {
    switch (item.kind) {
      case "services":
        return { kind: "mega", label: item.label, href: item.href, variant: "services", columns: serviceColumns() }
      case "industries":
        return { kind: "mega", label: item.label, href: item.href, variant: "industries", columns: industryColumns() }
      default:
        return item
    }
  })
}
