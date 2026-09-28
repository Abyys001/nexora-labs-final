import { roundToStep } from "./round.js";
import type { Estimate, EstimateAdjustment, EstimateLine, PricingCatalog, PricingItem, Selection } from "./types.js";

function byId(items: PricingItem[]): Map<string, PricingItem> {
  return new Map(items.map((item) => [item.id, item]));
}

function sumSelected(items: Map<string, PricingItem>, ids: string[]): number {
  return ids.reduce((total, id) => total + (items.get(id)?.price ?? 0), 0);
}

/**
 * Builds the automated estimate from the catalogue and the customer's selection.
 * The API is the only trusted caller for money purposes — always recompute
 * server-side from the persisted catalogue, never trust a client-sent total.
 */
export function estimate(catalog: PricingCatalog, selection: Selection): Estimate {
  const items = byId(catalog.items);
  const lines: EstimateLine[] = [];

  const solutions = selection.solutionTypes.map((id) => items.get(id)).filter((x): x is PricingItem => Boolean(x));
  if (solutions.length > 0) {
    const [primary, ...extra] = solutions;
    const extraTotal = extra.reduce((total, item) => total + item.price * catalog.settings.additionalSolutionFactor, 0);
    const amount = primary.price + extraTotal;
    lines.push({
      key: "foundation",
      label: "Foundation",
      amount,
      detail: extra.length > 0 ? `${primary.label} + ${extra.length} more` : primary.label,
    });
  }

  const groups: { key: string; label: string; ids: string[] }[] = [
    { key: "features", label: "Features", ids: selection.features },
    { key: "platforms", label: "Platforms", ids: selection.platforms },
    { key: "integrations", label: "Integrations", ids: selection.integrations },
    { key: "ai", label: "AI", ids: selection.ai },
    { key: "design", label: "Design", ids: selection.design },
  ];

  for (const group of groups) {
    if (group.ids.length === 0) continue;
    lines.push({
      key: group.key,
      label: group.label,
      amount: sumSelected(items, group.ids),
      detail: `${group.ids.length} selected`,
    });
  }

  const subtotal = lines.reduce((total, line) => total + line.amount, 0);

  const adjustments: EstimateAdjustment[] = [];
  let running = subtotal;

  // Amounts are whole GBP pounds throughout — round each adjustment so
  // floating-point multiplication (e.g. 8000 * 0.15) never leaks into totals.
  const complexity = catalog.complexity.find((m) => m.id === selection.complexity);
  if (complexity) {
    const amount = Math.round(running * (complexity.multiplier - 1));
    adjustments.push({ key: "complexity", label: complexity.label, multiplier: complexity.multiplier, amount, reason: complexity.description });
    running += amount;
  }

  const scale = selection.userScale ? catalog.scale.find((m) => m.id === selection.userScale) : undefined;
  if (scale) {
    const amount = Math.round(running * (scale.multiplier - 1));
    adjustments.push({ key: "scale", label: scale.label, multiplier: scale.multiplier, amount, reason: scale.description });
    running += amount;
  }

  const timeline = catalog.timelines.find((m) => m.id === selection.timeline);
  if (timeline) {
    const amount = Math.round(running * (timeline.multiplier - 1));
    adjustments.push({ key: "timeline", label: timeline.label, multiplier: timeline.multiplier, amount, reason: timeline.description });
    running += amount;
  }

  const total = roundToStep(running, catalog.settings.roundTo);
  const range = {
    low: roundToStep(total * catalog.settings.rangeLow, catalog.settings.roundTo),
    high: roundToStep(total * catalog.settings.rangeHigh, catalog.settings.roundTo),
  };

  const support = selection.support ? (items.get(selection.support)?.price ?? 0) : 0;
  const maintenance = selection.maintenance ? (items.get(selection.maintenance)?.price ?? 0) : 0;

  return {
    catalogVersion: catalog.version,
    lines,
    subtotal,
    adjustments,
    total,
    range,
    monthly: { support, maintenance },
  };
}
