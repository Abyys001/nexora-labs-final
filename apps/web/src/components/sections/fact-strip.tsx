import { processSteps } from "@/content/company"
import { services } from "@/content/services"

export type Fact = { value: string; label: string }

// Facts about the offering itself, derived from content, never invented performance statistics.
const defaultFacts: Fact[] = [
  { value: String(services.length), label: "Core services under one roof" },
  { value: "£2k+", label: "Projects starting from" },
  { value: String(processSteps.length), label: "Clear steps from idea to launch" },
  { value: "UK & Intl.", label: "Clients served remotely" },
]

export function FactStrip({ facts = defaultFacts }: { facts?: Fact[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="bg-background px-6 py-7">
          <dt className="text-sm text-muted-foreground">{fact.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
