import type { Item } from "@/content/services"
import { cn } from "@/lib/utils"

// Tailwind needs static class names present in source for the JIT scan to pick them up.
const colsByCount: Record<number, string> = {
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
}

export function ProcessSteps({ steps }: { steps: Item[] }) {
  return (
    <ol className={cn("relative grid gap-4 md:gap-0", colsByCount[steps.length] ?? "md:grid-cols-5")}>
      <div aria-hidden="true" className="absolute top-6 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
      {steps.map((step, i) => (
        <li key={step.title} className="reveal relative flex gap-5 rounded-2xl border border-border bg-card p-6 md:flex-col md:border-0 md:bg-transparent md:px-5 md:text-center">
          <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background font-mono text-sm font-semibold text-primary shadow-[0_0_0_6px_var(--background)] md:mx-auto">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-lg font-semibold md:mt-5">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
