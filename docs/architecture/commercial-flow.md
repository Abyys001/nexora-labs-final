# Commercial flow — pricing, requests, proposals, payments

The single contract for the Project Builder → request → proposal → payment
journey. Web, API and admin all build against this document. Money is stored
as **integer GBP pounds** (no pence; every price in this product is a whole
pound figure). Converted amounts are stored alongside the rate used.

## 1. Shared pricing engine — `packages/pricing` (`@cybercina/pricing`)

Pure TypeScript, no runtime deps except `zod`, built with `tsc` to `dist/`
(ESM + `.d.ts`). Imported by `apps/api` (authoritative) and `apps/web` (live
preview). The API **always recomputes** the estimate on submission; the
browser's number is display-only.

```ts
type ItemKind = "solution" | "feature" | "platform" | "integration" | "ai" | "design" | "support" | "maintenance"

type PricingItem = {
  id: string            // stable slug, e.g. "payment-processing"
  kind: ItemKind
  categoryId: string    // feature categories, e.g. "commerce"; for other kinds the kind itself
  label: string
  blurb: string
  icon: string          // icon key resolved by the web app (lucide name or brand icon name)
  price: number         // GBP. For support/maintenance: per month
  complexity: "s" | "m" | "l" | "xl"
  recommends: string[]  // suggested companions ("Recommended with this feature")
  requires: string[]    // hard dependencies — auto-suggested, flagged if missing
  addons: string[]      // optional add-ons shown on the card
  active: boolean
  sort: number
}

type Multiplier = { id: string; label: string; description: string; multiplier: number; sort: number }
type TimelineOption = Multiplier & { weeks: number }   // delivery window used for payment-date validation

type PricingCatalog = {
  version: string                  // ISO timestamp of last change
  items: PricingItem[]
  categories: { id: string; label: string; icon: string; sort: number }[]
  complexity: Multiplier[]         // "standard" 1.0, "advanced" 1.15, "enterprise-grade" 1.3
  timelines: TimelineOption[]      // flexible 1.00 (26w), 3-6-months 1.00 (24w), 2-3-months 1.10 (13w), 1-2-months 1.20 (8w), asap 1.35 (6w)
  scale: Multiplier[]              // userScales: under-100 1.0 … 100k-plus 1.25; "enterprise multiplier"
  settings: {
    additionalSolutionFactor: number   // 0.5 — extra solution types reuse the primary's foundation
    rangeLow: number                   // 0.9 — indicative band shown to visitors
    rangeHigh: number                  // 1.2
    roundTo: number                    // 250
  }
}

type Selection = {
  solutionTypes: string[]; features: string[]; platforms: string[]; integrations: string[];
  ai: string[]; design: string[]; support?: string; maintenance?: string;
  complexity: string; timeline: string; userScale?: string
}

type EstimateLine = { key: string; label: string; amount: number; detail?: string }
type Estimate = {
  catalogVersion: string
  lines: EstimateLine[]      // foundation, features, platforms, integrations, ai, design,
                             // then adjustments: complexity, scale, timeline (each explained)
  subtotal: number           // before adjustments
  adjustments: { key: "complexity" | "scale" | "timeline"; label: string; multiplier: number; amount: number; reason: string }[]
  total: number              // rounded to settings.roundTo
  range: { low: number; high: number }
  monthly: { support: number; maintenance: number }   // not part of total
}

export function estimate(catalog: PricingCatalog, selection: Selection): Estimate
export function convert(amountGbp: number, rate: number, rounding: Rounding): number
export function buildSchedule(input: ScheduleInput): ScheduleItem[]   // §5
export const selectionSchema, catalogSchema   // zod, shared validation
```

Adjustments apply multiplicatively to the subtotal in the order complexity →
scale → timeline; each adjustment line shows its own £ amount so the price
never changes silently ("Accelerated delivery ×1.20 +£8,400").

## 2. Database (Drizzle, `apps/api/src/db/schema.ts`)

New / changed tables:

| Table | Purpose |
|---|---|
| `admins` + `role` enum `owner \| manager \| viewer` | Env-seeded admin is `owner`. |
| `pricing_items` | One row per `PricingItem`. |
| `pricing_categories` | Feature categories. |
| `pricing_multipliers` | `group` enum `complexity \| timeline \| scale`, `weeks` nullable (timeline). |
| `pricing_settings` | Single row: `additionalSolutionFactor`, `rangeLow`, `rangeHigh`, `roundTo`, `updatedAt`. |
| `currencies` | `code` (GBP/EUR/USD), `enabled`, `rate` (per 1 GBP, numeric(12,6)), `source` `provider \| manual`, `rounding` (`none\|1\|10\|50\|100`), `rateUpdatedAt`, `lastRefreshError`. GBP rate fixed 1. |
| `exchange_rate_history` | Every fetched/overridden rate: `code`, `rate`, `source`, `recordedAt`. |
| `enquiries` (extended) | `reference` (unique, `NX-YYYY-NNNN`), `accessTokenHash` (sha256, unique), `selection` jsonb, `estimate` jsonb (snapshot), `estimateGbp` int, `currency`, `exchangeRate`, `rateRecordedAt`, `finalPriceGbp` int null, `projectDetails` jsonb. Contact-form enquiries leave these null. |
| `price_changes` | `enquiryId`, `adminId`, `previousGbp`, `newGbp`, `mode` `accept \| adjust \| manual`, `reason` (required), `createdAt`. |
| `proposals` | `enquiryId`, `version`, `status` `draft \| published \| accepted \| superseded \| withdrawn`, `automatedEstimateGbp`, `finalPriceGbp`, `currency`, `exchangeRate`, `rateRecordedAt`, `amountInCurrency`, `content` jsonb (summary, requirements, scope sections, assumptions[], exclusions[], nextSteps[]), `validUntil`, `createdBy`, `publishedAt`, `acceptedAt`. |
| `payment_plans` | `proposalId` (unique), `plan` `full \| split-completion \| split-development`, `secondDueDate` date null, `createdAt`. |
| `payment_schedule_items` | `planId`, `sequence`, `label`, `amountGbp`, `amountInCurrency`, `dueDate`, `status` (derived & persisted) `scheduled \| awaiting \| paid \| partially-paid \| overdue \| cancelled \| refunded`. |
| `payments` | Ledger: `scheduleItemId`, `amountGbp`, `amountInCurrency`, `currency`, `method` `bank-transfer \| stripe \| other`, `status` `pending \| succeeded \| failed \| refunded`, `providerRef` (unique when set), `recordedBy` admin null, `note`, `createdAt`. |
| `audit_logs` | `adminId` null (system/customer), `action`, `entity`, `entityId`, `before` jsonb, `after` jsonb, `reason`, `createdAt`. |

Seed: on boot, if `pricing_items` is empty, insert the default catalogue
(`packages/pricing/src/defaults.ts`, generated from today's
`apps/web/src/content/project-builder.ts` — same ids, labels, icons; feature
`price` = midpoint of its old size band). Currencies seeded GBP/EUR/USD with
EUR/USD disabled until the first successful rate fetch or a manual rate.

## 3. API endpoints (all under `/api`)

Public (throttled):

- `GET /public/pricing` → `{ catalog: PricingCatalog, currencies: {code, rate, rounding, rateUpdatedAt}[] }` (enabled only). Cache 60s.
- `POST /project-requests` (throttle 5/min) body `{ contact: {name,email,company?,phone?,website?,companySize?,preferredContact?}, selection: Selection, details: {goals[], industries[], successCriteria?, notes?, designNotes?, startDate?, paymentPreference?}, currency, hp? }` → `201 { reference, accessToken, estimate, currency, exchangeRate, amountInCurrency }`. Server recomputes estimate from the DB catalogue, snapshots it, generates reference + token (token returned once, only hash stored), writes legacy enquiry columns (projectType, budget `not-sure`, description composed, features ≤20 labels) and fires the email notification.
- `GET /public/requests/:token` → customer view: reference, status, submitted selection + estimate snapshot, currency snapshot, latest **published/accepted** proposal, payment plan + schedule + payment status. 404 on unknown token (constant-time hash lookup).
- `POST /public/requests/:token/payment-plan` `{ plan, secondDueDate? }` → validates (§5), creates plan + schedule, marks proposal `accepted`, audit log. Allowed while proposal is `published` and no payment has succeeded.
- `GET /public/requests/:token/proposal.pdf` → `application/pdf` (pdfkit).
- `POST /public/requests/:token/checkout` `{ scheduleItemId }` → `{ url }` Stripe Checkout (only when `STRIPE_SECRET_KEY` set; otherwise 404 `PAYMENTS_OFFLINE` and the UI shows bank-transfer instructions).
- `POST /webhooks/stripe` raw body, verifies `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET`; `checkout.session.completed` → ledger `succeeded`; `charge.refunded` → `refunded`. Idempotent on `providerRef`.

Admin (JWT; role in brackets = minimum):

- `GET /admin/dashboard` [viewer] — counts by status, pipeline value (sum of final or estimate), outstanding payments, overdue items, recent requests.
- existing `/admin/enquiries…` keep working; add `GET /admin/enquiries/:id` fields above + `priceChanges`, `proposals`, `paymentPlan`, `payments`.
- `POST /admin/enquiries/:id/final-price` [manager] `{ mode, amountGbp?, deltaGbp?, reason }` → sets `finalPriceGbp`, writes `price_changes` + audit.
- `POST /admin/enquiries/:id/proposals` [manager] create draft from current final price (+ editable content); `PATCH /admin/proposals/:id` (draft only); `POST /admin/proposals/:id/publish` (supersedes previous published, snapshots currency rate at publish time); `POST /admin/proposals/:id/withdraw`; `GET /admin/proposals` list; `GET /admin/proposals/:id/pdf`.
- `GET /admin/payments` [viewer] — per request: total, plan, paid, remaining, next due, status. `POST /admin/payments` [manager] record bank transfer / other against a schedule item; `POST /admin/payments/:id/refund` [manager]; `POST /admin/payment-plans/:id/cancel` [manager].
- Pricing [viewer read, manager write]: `GET/PUT /admin/pricing/items/:id`, `POST /admin/pricing/items`, `GET/PUT /admin/pricing/multipliers/:id`, `GET/PUT /admin/pricing/settings`, `GET/PUT /admin/pricing/categories/:id`. Every write → audit log with before/after.
- Currencies [viewer read, manager write]: `GET /admin/currencies`, `PUT /admin/currencies/:code` `{ enabled?, rate?, rounding?, source? }` (manual rate sets `source=manual`), `POST /admin/currencies/refresh` (fetch provider now), `GET /admin/currencies/history`.
- `GET /admin/audit-logs?entity=&page=` [manager].
- Admins [owner]: `GET /admin/admins`, `POST /admin/admins` `{email,name,role,password}`, `PATCH /admin/admins/:id` `{role?, name?, password?}`; cannot demote/delete the last owner.

Errors: the existing envelope. `HttpExceptionFilter` must map **every**
HttpException status (403 `FORBIDDEN`, 409 `CONFLICT`, 413 `PAYLOAD_TOO_LARGE`,
422 `UNPROCESSABLE`, …) and malformed JSON → 400 `INVALID_JSON`. JSON body
limit 256kb (webhook route keeps raw body).

## 4. Currency

- Base GBP. Provider: Frankfurter (ECB) `FX_PROVIDER_URL` default
  `https://api.frankfurter.app/latest?from=GBP&to=EUR,USD`. No key needed; if
  a keyed provider is configured later the key stays server-side.
- Refresh on boot if older than 24h, then every 12h (`setInterval`, unref'd),
  plus manual refresh. Failures keep the last good rate and store
  `lastRefreshError`; manual rates are never overwritten by the provider.
- Every stored amount in a non-GBP currency keeps `exchangeRate` +
  `rateRecordedAt`. Proposals snapshot the rate at publish time; later rate
  changes never alter an existing proposal or schedule.
- Rounding: converted amount rounded to the currency's `rounding` step
  (half-up). GBP amounts round per `settings.roundTo`.

## 5. Payment plans & schedule

- `full`: one item, 100%, due on acceptance (+7 days).
- `split-completion` (50/50): 50% due on acceptance (+7 days); 50% due on the
  customer-chosen date, allowed range **[estimated completion − 14 days,
  estimated completion + 30 days]**.
- `split-development`: 50% on acceptance (+7 days); 50% on the chosen date,
  allowed range **[acceptance + 14 days, estimated completion − 7 days]**.
- Estimated completion = acceptance date + selected timeline `weeks`.
- Odd amounts: the first instalment takes the remainder (e.g. £60,001 →
  £30,001 + £30,000). Amounts in the proposal currency use the proposal's
  stored rate.
- Status (server-derived, recomputed on every ledger change and daily):
  schedule item `paid` when succeeded payments ≥ amount, `partially-paid`
  when > 0, `overdue` when unpaid and past due, else `awaiting` once the plan
  exists. Request-level payment status: `not-started` (no plan) →
  `awaiting-payment` → `partially-paid` → `paid`; `overdue` if any item
  overdue; `cancelled` / `refunded` from plan cancellation / full refund.

## 6. Customer journey

Builder submit → success screen shows **reference** and a private link
`/p/<accessToken>` (also emailed to the customer when SMTP is set) → page
shows "Under review" with the automated estimate → admin sets final price and
publishes a proposal → the page shows the proposal (automated estimate vs
final commercial price clearly separated), plan picker, calendar for the
second date, schedule, PDF download, and pay buttons (Stripe) or bank
transfer instructions (`PAYMENT_BANK_DETAILS` env, shown only when set).

## 7. Environment (new)

| Var | Where | Required | Notes |
|---|---|---|---|
| `FX_PROVIDER_URL` | api | no | defaults to Frankfurter |
| `FX_REFRESH_HOURS` | api | no | default 12 |
| `STRIPE_SECRET_KEY` | api | no | enables card payments |
| `STRIPE_WEBHOOK_SECRET` | api | with Stripe | webhook signature |
| `PAYMENT_BANK_DETAILS` | api | no | shown to customers for bank transfer |
| `PUBLIC_SITE_URL` | api | yes | builds `/p/<token>` links + Stripe return URLs |
| `NEXT_PUBLIC_DEMO_MODE` | web | no | static/demo builds: simulate submission, clearly labelled |
