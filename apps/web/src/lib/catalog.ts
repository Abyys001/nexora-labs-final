// Helpers over the live `@cybercina/pricing` catalogue — grouping, lookup and
// currency formatting. The catalogue itself (items, prices, multipliers)
// always comes from the API (or `defaults` in demo mode); nothing here
// invents a price.
import type { CurrencyContext, Multiplier, PricingCatalog, PricingItem, Rounding } from "@cybercina/pricing"
import { convert } from "@cybercina/pricing"

export type PublicCurrency = { code: string; rate: number; rounding: Rounding; rateUpdatedAt: string }

export function itemMap(catalog: PricingCatalog): Map<string, PricingItem> {
  return new Map(catalog.items.map((item) => [item.id, item]))
}

export function itemsOfKind(catalog: PricingCatalog, kind: PricingItem["kind"]): PricingItem[] {
  return catalog.items.filter((item) => item.kind === kind && item.active).sort((a, b) => a.sort - b.sort)
}

export function categoriesWithFeatures(catalog: PricingCatalog): { id: string; label: string; icon: string; features: PricingItem[] }[] {
  const features = itemsOfKind(catalog, "feature")
  return [...catalog.categories]
    .sort((a, b) => a.sort - b.sort)
    .map((c) => ({ ...c, features: features.filter((f) => f.categoryId === c.id) }))
    .filter((c) => c.features.length > 0)
}

export function multiplierLabel(list: Multiplier[], id: string | undefined): string {
  return list.find((m) => m.id === id)?.label ?? "—"
}

const currencyLocale: Record<string, string> = { GBP: "en-GB", EUR: "de-DE", USD: "en-US" }

export function formatMoney(amount: number, currencyCode: string): string {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2
  return new Intl.NumberFormat(currencyLocale[currencyCode] ?? "en-GB", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Converts a GBP amount into the selected currency using the live rate table (GBP itself is a no-op). */
export function toCurrency(amountGbp: number, currencyCode: string, currencies: PublicCurrency[]): number {
  if (currencyCode === "GBP") return amountGbp
  const currency = currencies.find((c) => c.code === currencyCode)
  if (!currency) return amountGbp
  return convert(amountGbp, currency.rate, currency.rounding)
}

export function currencyContext(currencyCode: string, currencies: PublicCurrency[]): CurrencyContext | undefined {
  if (currencyCode === "GBP") return { rate: 1, rounding: "none" }
  const currency = currencies.find((c) => c.code === currencyCode)
  return currency ? { rate: currency.rate, rounding: currency.rounding } : undefined
}

/** Resolves an item's `kind` from its id — used to toggle a cross-category suggestion chip. */
export function kindOf(catalog: PricingCatalog, id: string): PricingItem["kind"] | undefined {
  return itemMap(catalog).get(id)?.kind
}

export const complexityLabel: Record<string, string> = { s: "S", m: "M", l: "L", xl: "XL" }
