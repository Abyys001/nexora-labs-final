import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultCatalog } from "../dist/defaults.js";
import { catalogSchema } from "../dist/schemas.js";
import { estimate } from "../dist/estimate.js";

test("defaultCatalog: validates against catalogSchema", () => {
  assert.doesNotThrow(() => catalogSchema.parse(defaultCatalog));
});

test("defaultCatalog: every item id is unique", () => {
  const ids = defaultCatalog.items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("defaultCatalog: has default items for every kind", () => {
  const kinds = new Set(defaultCatalog.items.map((i) => i.kind));
  for (const kind of ["solution", "feature", "platform", "integration", "ai", "design", "support", "maintenance"]) {
    assert.ok(kinds.has(kind as (typeof defaultCatalog.items)[number]["kind"]), `missing items for kind ${kind}`);
  }
});

test("defaultCatalog: recommends/requires reference existing item ids where present", () => {
  const ids = new Set(defaultCatalog.items.map((i) => i.id));
  for (const i of defaultCatalog.items) {
    for (const r of i.recommends) assert.ok(ids.has(r), `${i.id} recommends unknown id ${r}`);
  }
});

test("defaultCatalog: estimate() runs end-to-end against the default catalogue", () => {
  const result = estimate(defaultCatalog, {
    solutionTypes: ["web-app"],
    features: ["customer-accounts", "checkout"],
    platforms: ["web", "ios"],
    integrations: ["payment-gateway"],
    ai: [],
    design: ["new-ui-design"],
    support: "support-basic",
    maintenance: "maintenance-standard",
    complexity: "standard",
    timeline: "flexible",
    userScale: "under-100",
  });
  assert.ok(result.total > 0);
  assert.equal(result.catalogVersion, defaultCatalog.version);
});
