import type { LucideIcon } from "lucide-react"

import type { Item } from "@/content/services"
import { cn } from "@/lib/utils"

export function FeatureGrid({
  items,
  columns = 3,
  numbered = false,
}: {
  items: (Item & { icon?: LucideIcon })[]
  columns?: 2 | 3 | 4
  numbered?: boolean
}) {
  return (
    <ul
      className={cn(
        "grid gap-5",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <li key={item.title} className="card-lift reveal group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 sm:p-7">
            {Icon ? (
              <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            ) : numbered ? (
              <span className="mb-5 block font-mono text-sm font-medium text-primary">{String(i + 1).padStart(2, "0")}</span>
            ) : null}
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
          </li>
        )
      })}
    </ul>
  )
}
