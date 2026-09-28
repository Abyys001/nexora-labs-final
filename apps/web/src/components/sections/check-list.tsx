import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export function CheckList({ items, className, columns = 1 }: { items: string[]; className?: string; columns?: 1 | 2 }) {
  return (
    <ul className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[0.95rem] leading-snug">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
