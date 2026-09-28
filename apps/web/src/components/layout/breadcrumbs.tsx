import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { breadcrumbJsonLd } from "@/lib/seo"

import { JsonLd } from "./json-ld"

export type Crumb = { name: string; path: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Home", path: "/" }, ...items]
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {all.map((item, i) => {
            const last = i === all.length - 1
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="text-foreground/90">{item.name}</span>
                ) : (
                  <>
                    <Link href={item.path} className="transition-colors hover:text-foreground">{item.name}</Link>
                    <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  )
}
