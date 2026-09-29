// Recommendation logic for the Project Builder, plus a thin re-export of the
// shared pricing engine. Money is never computed here — `estimate()` comes
// straight from `@cybercina/pricing` and the API always recomputes it server-side.
import { estimate } from "@cybercina/pricing"
import type { Estimate, PricingCatalog, Selection } from "@cybercina/pricing"

export { estimate }
export type { Estimate, PricingCatalog, Selection }

export type RecommendationSelection = {
  solutionTypes: readonly string[]
  industries: readonly string[]
  goals: readonly string[]
  features: readonly string[]
  integrations?: readonly string[]
  ai?: readonly string[]
  design?: readonly string[]
}

type Group = "solutionTypes" | "industries" | "goals" | "features"

export type RecommendationRule = { id: string; when: Partial<Record<Group, string[]>>; suggest: string[]; reason: string }

export type ActiveRecommendation = {
  rule: RecommendationRule
  /** The selections that triggered the rule, per group, in rule order. */
  because: { group: Group; ids: string[] }[]
  /** Suggested items not already selected in any priced group. */
  suggest: string[]
}

export function activeRecommendations(rules: readonly RecommendationRule[], selection: RecommendationSelection, dismissed: ReadonlySet<string> = new Set()): ActiveRecommendation[] {
  const chosen = new Set([...selection.features, ...(selection.integrations ?? []), ...(selection.ai ?? []), ...(selection.design ?? [])])
  const out: ActiveRecommendation[] = []
  const offered = new Set<string>()

  for (const rule of rules) {
    if (dismissed.has(rule.id)) continue
    const groups = (Object.entries(rule.when) as [Group, string[]][]).filter(([, ids]) => ids.length > 0)
    if (!groups.length) continue

    const because = groups.map(([group, ids]) => ({ group, ids: ids.filter((id) => selection[group].includes(id)) }))
    if (because.some((b) => b.ids.length === 0)) continue

    // Each item is suggested once, by the first rule that reaches it.
    const suggest = rule.suggest.filter((id) => !chosen.has(id) && !offered.has(id))
    if (!suggest.length) continue
    suggest.forEach((id) => offered.add(id))
    out.push({ rule, because, suggest })
  }
  return out
}

/** Items a selected item recommends that the visitor hasn't chosen yet (in any priced group). */
export function missingDependencies(recommends: readonly string[] | undefined, selected: readonly string[]) {
  return (recommends ?? []).filter((id) => !selected.includes(id))
}
