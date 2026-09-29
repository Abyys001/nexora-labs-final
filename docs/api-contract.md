# API contract

Base path: `/api`. JSON only (body limit 256kb; the Stripe webhook route keeps
the raw body for signature verification). The API is internal-only (no
published port — see `docker-compose.yml`); the web app is the only intended
client and is trusted to set `x-client-ip` with the real visitor IP on every
proxied request. The API falls back to `req.ip` when that header is absent
(local/dev/test calls).

See `docs/architecture/commercial-flow.md` for the full pricing/request/
proposal/payment design this contract implements.

## Error envelope

Every non-2xx response:

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Human readable", "details": { "fieldErrors": { "email": ["Invalid email"] } } } }
```

`details` is only present for `VALIDATION_FAILED`. Codes: `VALIDATION_FAILED`
(400), `INVALID_JSON` (400, malformed request body), `UNAUTHORIZED` (401),
`FORBIDDEN` (403, insufficient role), `NOT_FOUND` (404), `CONFLICT` (409),
`PAYLOAD_TOO_LARGE` (413), `UNPROCESSABLE` (422), `RATE_LIMITED` (429),
`PAYMENTS_OFFLINE` (404, Stripe not configured), `PAYMENT_PROVIDER_ERROR`
(502), `INVALID_SIGNATURE` (400, Stripe webhook), `INTERNAL` (500). Every
`HttpException` status Nest/Express can raise is mapped — none fall through
to a bare 500.

## Enquiry shape

| Field | Type | Notes |
|---|---|---|
| `source` | `"contact" \| "quote"` | required |
| `name` | string 2–120 | required |
| `email` | email ≤ 254 | required |
| `company` | string ≤ 160 | optional |
| `phone` | string ≤ 40 | optional |
| `projectType` | `website \| web-app \| mobile-app \| ai \| crm \| saas \| automation \| ecommerce \| other` | required |
| `budget` | `2k-5k \| 5k-10k \| 10k-25k \| 25k-50k \| 50k-plus \| not-sure` | required |
| `description` | string 20–5000 | required |
| `preferredContact` | `email \| phone \| video-call` | optional, default `email` |
| `industry` | string ≤ 80 | optional (quote) |
| `companySize` | `1-10 \| 11-50 \| 51-200 \| 201-1000 \| 1000-plus` | optional (quote) |
| `website` | url ≤ 300 | optional (quote) |
| `features` | string[] ≤ 20 items, each ≤ 80 | optional (quote) |
| `timeline` | `asap \| 1-3-months \| 3-6-months \| 6-plus-months \| flexible` | optional (quote) |
| `startDate` | string ≤ 40 | optional (quote) |
| `configuration` | `Configuration` object, see below | optional — Project Builder output |
| `hp` | string | honeypot; if non-empty respond 201 but do not store |

### `Configuration` shape

| Field | Type | Notes |
|---|---|---|
| `solutionTypes` | string[] 1–15 items, each id ≤ 60 | required |
| `industries` | string[] ≤ 25 items, each id ≤ 60 | required (may be empty) |
| `goals` | string[] ≤ 20 items, each id ≤ 60 | required (may be empty) |
| `successCriteria` | string ≤ 1000 | optional |
| `features` | string[] ≤ 120 items, each id ≤ 60 | required (may be empty) |
| `platforms` | string[] ≤ 8 items, each id ≤ 60 | required (may be empty) |
| `userScale` | `under-100 \| 100-1k \| 1k-10k \| 10k-100k \| 100k-plus \| not-sure` | optional |
| `stage` | `idea \| prototype \| live-product \| replacing-system` | optional |
| `estimate` | `{ min, max, currency }` — `min`/`max` non-negative ints ≤ 10,000,000 with `max >= min`, `currency` always `"GBP"` | required |

Stored record adds: `id` (uuid), `status` (`new \| contacted \| qualified \| won \| lost \| archived`, default `new`),
`notes` (text, admin only), `ipHash` (sha256 of ip + server salt, never the raw IP), `userAgent`, `createdAt`, `updatedAt`.

## Endpoints

- `GET /api/health` → `200 { "status": "ok", "db": "ok" }`
- `POST /api/enquiries` (public, throttled 5/min per IP) → `201 { "id": "<uuid>" }`
- `POST /api/auth/login` `{ email, password }` (throttled 10/min per IP) → `200 { "accessToken": "<jwt>", "expiresIn": 28800, "admin": { "id", "email", "name" } }`
- `GET /api/auth/me` (Bearer) → `200 { "id", "email", "name" }`
- `GET /api/admin/enquiries?status=&source=&q=&page=1&pageSize=20` (Bearer) → `200 { "items": Enquiry[], "total", "page", "pageSize" }` — newest first; `q` matches name/email/company, case-insensitive
- `GET /api/admin/enquiries/stats` (Bearer) → `200 { "total", "byStatus": { "new": n, ... } }`
- `GET /api/admin/enquiries/:id` (Bearer) → `200 Enquiry`
- `PATCH /api/admin/enquiries/:id` `{ status?, notes? }` (Bearer) → `200 Enquiry`

Enquiry JSON uses camelCase and ISO-8601 timestamps; `ipHash` and
`accessTokenHash` are not exposed. Commercial-flow requests (submitted via
`POST /api/project-requests`) additionally populate `reference`, `selection`,
`estimate`, `estimateGbp`, `currency`, `exchangeRate`, `rateRecordedAt`,
`finalPriceGbp`, `projectDetails`; plain contact-form enquiries leave these
`null`. `GET /api/admin/enquiries/:id` returns the full detail shape:
`{ ...Enquiry, priceChanges, proposals, paymentPlan, paymentStatus }`.

## Admin roles

JWTs carry a `role`: `owner > manager > viewer`. Every admin endpoint below is
tagged with the **minimum** role required; higher roles can do everything a
lower role can. The env-seeded admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) is
always `owner`. A `403 FORBIDDEN` is returned when the caller's role is below
the minimum. Every admin write is recorded to `audit_logs` with a before/after
snapshot.

## Commercial flow — pricing

- `GET /api/public/pricing` (public, cached 60s) → `{ catalog: PricingCatalog, currencies: { code, rate, rounding, rateUpdatedAt }[] }` — enabled currencies only. `PricingCatalog` is the `@cybercina/pricing` type (items, categories, complexity/timeline/scale multipliers, settings). Seeded from `packages/pricing/src/defaults.ts` on first boot.
- `GET /api/admin/pricing/items/:id` [viewer] / `POST /api/admin/pricing/items` [manager] `CreatePricingItem` / `PUT /api/admin/pricing/items/:id` [manager] `Partial<CreatePricingItem>` (without `id`)
- `GET /api/admin/pricing/categories/:id` [viewer] / `PUT /api/admin/pricing/categories/:id` [manager] `{ label?, icon?, sort? }`
- `GET /api/admin/pricing/multipliers/:id` [viewer] / `PUT /api/admin/pricing/multipliers/:id` [manager] `{ label?, description?, multiplier?, weeks?, sort? }`
- `GET /api/admin/pricing/settings` [viewer] / `PUT /api/admin/pricing/settings` [manager] `{ additionalSolutionFactor, rangeLow, rangeHigh, roundTo }`

## Commercial flow — currencies

- `GET /api/admin/currencies` [viewer] → all currency rows (GBP fixed at rate 1)
- `PUT /api/admin/currencies/:code` [manager] `{ enabled?, rate?, rounding?, source? }` — setting `rate` always flips `source` to `manual`; manual rates are never overwritten by the scheduled provider refresh
- `POST /api/admin/currencies/refresh` [manager] → fetches the provider now
- `GET /api/admin/currencies/history?code=` [viewer] → every fetched/overridden rate, newest first

Provider: Frankfurter (`FX_PROVIDER_URL`, default
`https://api.frankfurter.app/latest?from=GBP&to=EUR,USD`), refreshed on boot
when stale (>24h) and every `FX_REFRESH_HOURS` (default 12) thereafter via an
unref'd timer. Disabled entirely when `NODE_ENV=test`. A failed fetch keeps
the last good rate and records `lastRefreshError`.

## Commercial flow — project requests (public)

- `POST /api/project-requests` (throttled 5/min) `{ contact: {name,email,company?,phone?,website?,companySize?,preferredContact?}, selection: Selection, details: {goals[],industries[],successCriteria?,notes?,designNotes?,startDate?,paymentPreference?}, currency, hp? }` → `201 { reference, accessToken, estimate, currency, exchangeRate, amountInCurrency }`. The server **always recomputes** the estimate from the DB catalogue — any price sent by the client is ignored. `reference` is `NX-<year>-<0001-padded sequence>`, allocated with retry-on-collision so it stays unique under concurrent submissions. `accessToken` is a 32-byte base64url token, returned once; only its SHA-256 hash is stored. Notifies the admin inbox (reference, customer link, estimate) and, when SMTP is configured, emails the customer their private link.
- `GET /api/public/requests/:token` → `{ reference, stage: "under-review"|"proposal-ready"|"accepted", selection, estimate, currency, exchangeRate, rateRecordedAt, proposal, paymentPlan, paymentStatus, bankDetails, stripeEnabled }`. `proposal` is the latest **published/accepted** proposal only (never a draft). `404 NOT_FOUND` for an unknown token.
- `POST /api/public/requests/:token/payment-plan` `{ plan: "full"|"split-completion"|"split-development", secondDueDate? }` → creates the schedule and marks the proposal `accepted`. Only allowed while the proposal is `published` and no plan exists yet. `422 UNPROCESSABLE` when `secondDueDate` is outside the allowed window (see commercial-flow.md §5).
- `GET /api/public/requests/:token/proposal.pdf` → `application/pdf`
- `POST /api/public/requests/:token/checkout` `{ scheduleItemId }` → `{ url }` (Stripe Checkout). `404 PAYMENTS_OFFLINE` when `STRIPE_SECRET_KEY` is unset — the UI should show bank-transfer instructions instead.
- `POST /api/webhooks/stripe` (raw body, `Stripe-Signature` header) → `checkout.session.completed` records a succeeded payment; `charge.refunded` marks it refunded. Idempotent on the Stripe `payment_intent` id. Invalid/missing signature → `400 INVALID_SIGNATURE`.

## Commercial flow — admin

- `GET /api/admin/dashboard` [viewer] → `{ byStatus, pipelineValueGbp, outstandingPaymentsGbp, overdueCount, recentRequests }`
- `POST /api/admin/enquiries/:id/final-price` [manager] `{ mode: "accept"|"adjust"|"manual", amountGbp?, deltaGbp?, reason }` → sets `finalPriceGbp`, writes a `price_changes` row and an audit log entry
- `POST /api/admin/enquiries/:id/proposals` [manager] `{ content: {summary, requirements[], scope[{title,body}], assumptions[], exclusions[], nextSteps[]}, validUntil? }` → draft proposal (requires a final price first)
- `GET /api/admin/proposals` [viewer] / `GET /api/admin/proposals/:id` [viewer] / `PATCH /api/admin/proposals/:id` [manager] (draft only) `{ content?, validUntil? }`
- `POST /api/admin/proposals/:id/publish` [manager] — supersedes the previous published proposal, snapshots the currency rate
- `POST /api/admin/proposals/:id/withdraw` [manager]
- `GET /api/admin/proposals/:id/pdf` [viewer] → `application/pdf`
- `GET /api/admin/payments` [viewer] → per request: `{ enquiryId, proposalId, plan, totalGbp, paidGbp, remainingGbp, nextDue, status }`
- `POST /api/admin/payments` [manager] `{ scheduleItemId, amountGbp, method: "bank-transfer"|"other", note? }` — records a completed payment against a schedule item
- `POST /api/admin/payments/:id/refund` [manager] `{ reason }`
- `POST /api/admin/payment-plans/:id/cancel` [manager] `{ reason }`
- `GET /api/admin/audit-logs?entity=&page=&pageSize=` [manager]
- `GET /api/admin/admins` [owner] / `POST /api/admin/admins` [owner] `{ email, name, role, password }` / `PATCH /api/admin/admins/:id` [owner] `{ role?, name?, password? }` — the last remaining `owner` can never be demoted

Payment schedule item statuses: `scheduled | awaiting | paid | partially-paid
| overdue | cancelled | refunded`, recomputed on every ledger write and once
a day. Request-level payment status: `not-started | awaiting-payment |
partially-paid | paid | overdue | cancelled | refunded`.

## Environment

New variables (see `docs/architecture/commercial-flow.md` §7):
`FX_PROVIDER_URL`, `FX_REFRESH_HOURS` (default 12), `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `PAYMENT_BANK_DETAILS`, `PUBLIC_SITE_URL` (required
— builds `/p/<token>` links and Stripe return URLs).
