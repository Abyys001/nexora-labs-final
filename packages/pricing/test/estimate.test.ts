import assert from "node:assert/strict";
import { test } from "node:test";
import { estimate } from "../dist/estimate.js";
import type { PricingCatalog, Selection } from "../dist/types.js";

function catalog(overrides: Partial<PricingCatalog> = {}): PricingCatalog {
  return {
    version: "v1",
    items: [
      { id: "web-app", kind: "solution", categoryId: "solution", label: "Web App", blurb: "", icon: "AppWindow", price: 8000, complexity: "m", recommends: [], requires: [], addons: [], active: true, sort: 0 },
      { id: "saas", kind: "solution", categoryId: "solution", label: "SaaS", blurb: "", icon: "Layers", price: 20000, complexity: "l", recommends: [], requires: [], addons: [], active: true, sort: 1 },
      { id: "customer-accounts", kind: "feature", categoryId: "customer-experience", label: "Customer Accounts", blurb: "", icon: "UserCheck", price: 1450, complexity: "m", recommends: [], requires: [], addons: [], active: true, sort: 0 },
      { id: "checkout", kind: "feature", categoryId: "commerce", label: "Checkout", blurb: "", icon: "Receipt", price: 1450, complexity: "m", recommends: [], requires: [], addons: [], active: true, sort: 1 },
      { id: "web", kind: "platform", categoryId: "platform", label: "Web", blurb: "", icon: "Globe", price: 0, complexity: "s", recommends: [], requires: [], addons: [], active: true, sort: 0 },
      { id: "support-basic", kind: "support", categoryId: "support", label: "Basic Support", blurb: "", icon: "LifeBuoy", price: 150, complexity: "s", recommends: [], requires: [], addons: [], active: true, sort: 0 },
      { id: "maintenance-standard", kind: "maintenance", categoryId: "maintenance", label: "Standard Maintenance", blurb: "", icon: "Wrench", price: 250, complexity: "s", recommends: [], requires: [], addons: [], active: true, sort: 0 },
    ],
    categories: [],
    complexity: [
      { id: "standard", label: "Standard", description: "Well-understood build.", multiplier: 1.0, sort: 0 },
      { id: "advanced", label: "Advanced", description: "Higher complexity.", multiplier: 1.15, sort: 1 },
    ],
    timelines: [
      { id: "flexible", label: "Flexible", description: "No fixed deadline.", multiplier: 1.0, weeks: 26, sort: 0 },
      { id: "1-2-months", label: "1-2 Months", description: "Accelerated delivery, dedicated capacity.", multiplier: 1.2, weeks: 8, sort: 1 },
    ],
    scale: [
      { id: "under-100", label: "Under 100", description: "Small user base.", multiplier: 1.0, sort: 0 },
      { id: "100k-plus", label: "100,000+", description: "Enterprise scale.", multiplier: 1.25, sort: 1 },
    ],
    settings: { additionalSolutionFactor: 0.5, rangeLow: 0.9, rangeHigh: 1.2, roundTo: 250 },
    ...overrides,
  };
}

function selection(overrides: Partial<Selection> = {}): Selection {
  return {
    solutionTypes: ["web-app"],
    features: [],
    platforms: [],
    integrations: [],
    ai: [],
    design: [],
    complexity: "standard",
    timeline: "flexible",
    ...overrides,
  };
}

test("estimate: foundation line uses primary solution price", () => {
  const result = estimate(catalog(), selection());
  const foundation = result.lines.find((l) => l.key === "foundation");
  assert.equal(foundation?.amount, 8000);
  assert.equal(result.subtotal, 8000);
});

test("estimate: extra solution types reuse the primary's foundation at the additional factor", () => {
  const result = estimate(catalog(), selection({ solutionTypes: ["web-app", "saas"] }));
  const foundation = result.lines.find((l) => l.key === "foundation");
  // primary 8000 + extra 20000 * 0.5 = 18000
  assert.equal(foundation?.amount, 18000);
});

test("estimate: feature/platform lines sum selected item prices", () => {
  const result = estimate(catalog(), selection({ features: ["customer-accounts", "checkout"], platforms: ["web"] }));
  const features = result.lines.find((l) => l.key === "features");
  const platforms = result.lines.find((l) => l.key === "platforms");
  assert.equal(features?.amount, 2900);
  assert.equal(platforms?.amount, 0);
  assert.equal(result.subtotal, 8000 + 2900 + 0);
});

test("estimate: adjustments apply multiplicatively in order complexity -> scale -> timeline, each explained", () => {
  const result = estimate(
    catalog(),
    selection({ complexity: "advanced", userScale: "100k-plus", timeline: "1-2-months" }),
  );
  // subtotal 8000
  // complexity 1.15: 8000 * 0.15 = 1200 -> running 9200
  // scale 1.25: 9200 * 0.25 = 2300 -> running 11500
  // timeline 1.20: 11500 * 0.20 = 2300 -> running 13800
  assert.equal(result.adjustments.length, 3);
  assert.equal(result.adjustments[0].key, "complexity");
  assert.equal(result.adjustments[0].amount, 1200);
  assert.equal(result.adjustments[1].key, "scale");
  assert.equal(result.adjustments[1].amount, 2300);
  assert.equal(result.adjustments[2].key, "timeline");
  assert.equal(result.adjustments[2].amount, 2300);
  for (const adjustment of result.adjustments) assert.ok(adjustment.reason.length > 0);
});

test("estimate: timeline example — £42,000 at ×1.20 -> +£8,400 -> £50,400", () => {
  const c = catalog({ settings: { additionalSolutionFactor: 0.5, rangeLow: 0.9, rangeHigh: 1.2, roundTo: 1 } });
  c.items = [{ id: "solo", kind: "solution", categoryId: "solution", label: "Solo", blurb: "", icon: "Code2", price: 42000, complexity: "l", recommends: [], requires: [], addons: [], active: true, sort: 0 }];
  const result = estimate(c, selection({ solutionTypes: ["solo"], timeline: "1-2-months" }));
  const timeline = result.adjustments.find((a) => a.key === "timeline");
  assert.equal(timeline?.amount, 8400);
  assert.equal(result.total, 50400);
});

test("estimate: total rounds to settings.roundTo, range uses rangeLow/rangeHigh", () => {
  const result = estimate(catalog(), selection({ features: ["customer-accounts"] })); // 8000 + 1450 = 9450 -> round to 250 -> 9500
  assert.equal(result.total, 9500);
  assert.equal(result.range.low, Math.round((9500 * 0.9) / 250) * 250);
  assert.equal(result.range.high, Math.round((9500 * 1.2) / 250) * 250);
});

test("estimate: monthly support/maintenance are not part of total", () => {
  const result = estimate(catalog(), selection({ support: "support-basic", maintenance: "maintenance-standard" }));
  assert.equal(result.monthly.support, 150);
  assert.equal(result.monthly.maintenance, 250);
  assert.equal(result.total, 8000); // unaffected by monthly amounts
});

test("estimate: unknown ids are ignored, not thrown", () => {
  const result = estimate(catalog(), selection({ features: ["does-not-exist"] }));
  assert.equal(result.subtotal, 8000);
});
