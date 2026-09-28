import "server-only"

import { defaultCatalog, type PricingCatalog } from "@nexora/pricing"

import type { PublicCurrency } from "@/lib/catalog"
import type { PublicRequestView } from "@/lib/request-view"
import { API_URL } from "@/lib/server/api"

export type PublicPricing = { catalog: PricingCatalog; currencies: PublicCurrency[]; live: boolean }

/** GBP is the base currency and is always offered, even when the API is unreachable. */
const gbpOnly: PublicCurrency[] = [{ code: "GBP", rate: 1, rounding: "none", rateUpdatedAt: new Date(0).toISOString() }]

/**
 * Live pricing catalogue for the Project Builder. Falls back to the bundled
 * defaults so the builder still renders (in GBP only) if the API is down —
 * the API always recomputes the estimate on submit, so a stale catalogue can
 * never produce a binding price.
 */
export async function getPublicPricing(): Promise<PublicPricing> {
  try {
    const res = await fetch(`${API_URL}/public/pricing`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) throw new Error(`Pricing API responded ${res.status}`)
    const body = (await res.json()) as { catalog: PricingCatalog; currencies: PublicCurrency[] }
    const currencies = body.currencies?.length ? body.currencies : gbpOnly
    return { catalog: body.catalog, currencies, live: true }
  } catch (error) {
    console.error("Pricing catalogue unavailable, using bundled defaults:", error instanceof Error ? error.message : error)
    return { catalog: defaultCatalog, currencies: gbpOnly, live: false }
  }
}

export type RequestViewResult =
  | { status: "ok"; view: PublicRequestView }
  | { status: "not-found" }
  | { status: "unavailable" }

/** Customer-facing view of a submitted request, addressed by its private access token. */
export async function getRequestView(token: string): Promise<RequestViewResult> {
  try {
    const res = await fetch(`${API_URL}/public/requests/${encodeURIComponent(token)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    if (res.status === 404) return { status: "not-found" }
    if (!res.ok) throw new Error(`Request API responded ${res.status}`)
    return { status: "ok", view: (await res.json()) as PublicRequestView }
  } catch (error) {
    console.error("Request view unavailable:", error instanceof Error ? error.message : error)
    return { status: "unavailable" }
  }
}
