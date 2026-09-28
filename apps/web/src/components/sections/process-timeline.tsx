import type { DetailedStep } from "@/content/company"

import { CheckList } from "./check-list"

export function ProcessTimeline({ steps }: { steps: DetailedStep[] }) {
  return (
    <ol className="relative mx-auto max-w-4xl">
      <div aria-hidden="true" className="absolute top-2 bottom-2 left-6 w-px bg-gradient-to-b from-primary/60 via-border to-border sm:left-1/2" />
      {steps.map((step, i) => {
        const right = i % 2 === 1
        return (
          <li key={step.title} className="reveal relative grid gap-4 pb-12 pl-16 last:pb-0 sm:grid-cols-2 sm:gap-16 sm:pl-0">
            <span className="absolute top-0 left-0 z-10 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-background font-mono text-sm font-semibold text-primary shadow-[0_0_0_6px_var(--background)] sm:left-1/2 sm:-translate-x-1/2">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={right ? "sm:col-start-2 sm:pl-6" : "sm:pr-6 sm:text-right"}>
              <h3 className="pt-2.5 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
            <div className={right ? "sm:col-start-1 sm:row-start-1 sm:pr-6" : "sm:pl-6"}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <CheckList items={step.activities} className="text-sm" />
                <p className="mt-5 border-t border-border pt-4 text-sm">
                  <span className="font-semibold">You get: </span>
                  <span className="text-muted-foreground">{step.youGet}</span>
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
