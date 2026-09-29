import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { defaultCatalog } from "@cybercina/pricing"

import { recommendations } from "../content/project-builder.ts"
import { activeRecommendations, estimate, missingDependencies } from "./project-estimate.ts"

const none = { solutionTypes: [], industries: [], goals: [], features: [] }

const baseSelection = {
  solutionTypes: ["website"],
  features: [],
  platforms: ["web"],
  integrations: [],
  ai: [],
  design: [],
  complexity: "standard",
  timeline: "flexible",
}

describe("estimate (via @cybercina/pricing)", () => {
  it("returns a foundation line and a rounded total for a bare solution", () => {
    const e = estimate(defaultCatalog, baseSelection)
    assert.equal(e.lines[0].key, "foundation")
    assert.equal(e.total % defaultCatalog.settings.roundTo, 0)
    // Every applicable multiplier is listed, so the builder can show "no change"
    // rather than silently omitting it. At ×1.00 the amount is zero.
    assert.ok(e.adjustments.every((a) => a.amount === 0))
  })

  it("adds an explained adjustment line when timeline changes the price", () => {
    const e = estimate(defaultCatalog, { ...baseSelection, timeline: "asap" })
    const adj = e.adjustments.find((a) => a.key === "timeline")
    assert.ok(adj, "expected a timeline adjustment line")
    assert.ok(adj!.amount > 0)
    assert.ok(adj!.reason.length > 0)
    assert.ok(e.total > estimate(defaultCatalog, baseSelection).total)
  })
})

describe("activeRecommendations", () => {
  const rules = [
    { id: "fin", when: { industries: ["finance"], features: ["portal", "payments"] }, suggest: ["kyc", "2fa"], reason: "" },
    { id: "saas", when: { solutionTypes: ["saas"] }, suggest: ["2fa", "billing"], reason: "" },
  ]

  it("requires every group to match", () => {
    assert.equal(activeRecommendations(rules, { ...none, industries: ["finance"] }).length, 0)
    const [hit] = activeRecommendations(rules, { ...none, industries: ["finance"], features: ["payments"] })
    assert.equal(hit.rule.id, "fin")
    assert.deepEqual(hit.because, [
      { group: "industries", ids: ["finance"] },
      { group: "features", ids: ["payments"] },
    ])
  })

  it("never re-suggests selected or already-offered items, across priced groups", () => {
    const res = activeRecommendations(rules, { ...none, industries: ["finance"], features: ["payments", "kyc"], solutionTypes: ["saas"] })
    assert.deepEqual(res.map((r) => r.suggest), [["2fa"], ["billing"]])
  })

  it("treats an item selected in another group (e.g. integrations) as already chosen", () => {
    const res = activeRecommendations(rules, { ...none, industries: ["finance"], features: ["payments"], integrations: ["2fa"] })
    assert.deepEqual(res[0].suggest, ["kyc"])
  })

  it("skips dismissed rules", () => {
    assert.equal(activeRecommendations(rules, { ...none, solutionTypes: ["saas"] }, new Set(["saas"])).length, 0)
  })
})

describe("missingDependencies", () => {
  it("lists only unselected recommendations", () => {
    assert.deepEqual(missingDependencies(["a", "b", "c"], ["b"]), ["a", "c"])
    assert.deepEqual(missingDependencies(undefined, []), [])
  })
})

describe("catalogue / recommendation integrity", () => {
  const ids = new Set(defaultCatalog.items.map((i) => i.id))

  it("every catalogue item's requires/recommends points at a real item", () => {
    for (const item of defaultCatalog.items) {
      for (const r of item.requires) assert.ok(ids.has(r), `${item.id} requires unknown ${r}`)
      for (const r of item.recommends) assert.ok(ids.has(r), `${item.id} recommends unknown ${r}`)
    }
  })

  it("every builder recommendation rule suggests a real catalogue item", () => {
    for (const rule of recommendations) for (const s of rule.suggest) assert.ok(ids.has(s), `${rule.id} suggests unknown ${s}`)
  })
})
