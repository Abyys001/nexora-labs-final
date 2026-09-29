# Cybercina

The Cybercina website, project configurator and commercial back office, in one monorepo.

A visitor configures a project step by step, gets an automated estimate, and submits it. A specialist reviews the request, sets the final commercial price, issues a written proposal, and the customer chooses how to pay — all from the same system, with a proper PDF at the end of it.

| Path | What it is |
|---|---|
| `apps/web` | Next.js 16 (App Router, RSC), TypeScript, Tailwind v4, shadcn/ui. Marketing pages are statically generated; the Project Builder and admin panel are client-side over server actions and route handlers. |
| `apps/api` | NestJS 12 API — project requests, pricing, proposals, payments, currencies, portfolio, admin auth and audit. PostgreSQL via Drizzle ORM. |
| `packages/pricing` | The shared pricing engine: estimate calculation, currency conversion, payment schedules and status derivation. Used by both apps so the browser and the server can never disagree about the shape of a price. |
| `docs/` | API contract, commercial-flow architecture and the design system notes. |

---

## Technology stack

**Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), TanStack Query (admin only), Zod, Lucide icons. No animation library: motion is CSS, driven by scroll-linked animations and a small IntersectionObserver hook, and every effect is disabled under `prefers-reduced-motion`.

**Backend** — NestJS 12 (ESM), Drizzle ORM, PostgreSQL 17, Zod validation pipes, JWT auth with role guards, Helmet, per-route throttling, PDFKit for proposal documents, Nodemailer for notifications.

**Shared** — `@cybercina/pricing`, a dependency-light TypeScript package with its own test suite.

---

## Architecture overview

```
Browser ──▶ Next.js (apps/web)
              │  server actions + /api/* route handlers
              │  (the API is never called from the browser directly)
              ▼
            NestJS (apps/api) ──▶ PostgreSQL
              │
              └─▶ SMTP · exchange-rate provider · Stripe (all optional)
```

Three rules hold the system together:

1. **The API is the only authority on money.** The browser computes an estimate live for feedback, but every submission is re-priced server-side from the persisted catalogue. A client-sent total is never trusted.
2. **The web app is the only thing the browser talks to.** The admin JWT lives in an httpOnly, SameSite=strict cookie; route handlers under `app/api/admin/*` attach it as a Bearer token. In Docker the API isn't published to the host at all.
3. **Rates and prices are snapshotted, never recomputed.** A request stores the GBP amount, the currency, the exchange rate and when that rate was recorded. A rate change tomorrow cannot alter a proposal issued today.

### The commercial flow

```
Project Builder ──▶ POST /project-requests ──▶ automated estimate + reference + private token
                                                  │
  Customer's private page  ◀── /request/<token> ──┘
                                                  │
  Admin sets the final commercial price  ────────▶ price change recorded (who, when, why)
  Admin drafts and publishes a proposal  ────────▶ visible on the customer's page
  Customer picks a payment plan + date   ────────▶ schedule generated, proposal accepted
  Admin records payments                 ────────▶ status derived from the ledger
                                                  │
                                    Proposal PDF ─┘
```

---

## Local setup

Requires Node 20+ and npm 10+.

```bash
npm install
```

### Option A — Docker (closest to production)

```bash
cp .env.example .env        # fill in every empty value
docker compose up -d --build
```

- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- The API is internal to the compose network; the web container reaches it at `http://api:4000/api`.

### Option B — No Docker, no Postgres

The API can run against an in-process PGlite database, which is how the end-to-end tests run. Useful for development on a machine without Postgres.

```bash
# Terminal 1 — API
cd apps/api
DATABASE_URL="pglite://./.pgdata" \
JWT_SECRET="a-random-string-of-at-least-32-characters" \
IP_HASH_SALT="any-random-salt" \
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="a-long-password" \
PORT=4000 CORS_ORIGIN=http://localhost:3000 PUBLIC_SITE_URL=http://localhost:3000 \
npm run start:dev

# Terminal 2 — web
cd apps/web
API_URL=http://127.0.0.1:4000/api npm run dev
```

### Option C — Local Postgres

```bash
docker run -d --name cybercina-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cybercina -p 5432:5432 postgres:17-alpine
cp apps/api/.env.example apps/api/.env   # then edit it
npm run dev:api        # http://localhost:4000/api
npm run dev:web        # http://localhost:3000
```

---

## Environment variables

Every value is read from the environment; nothing secret is committed. `.env.example` (root, for Docker) and `apps/api/.env.example` (for running the API directly) list them all.

| Variable | Required | What it does |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string, or `pglite://<path>` for a local file-backed database |
| `JWT_SECRET` | yes | Signs admin sessions. At least 32 characters |
| `JWT_EXPIRES_IN_SECONDS` | no | Admin session lifetime (default 28800 = 8 hours) |
| `IP_HASH_SALT` | yes | Salt for hashing submitter IPs — only the hash is ever stored |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | first boot | Seeds the first owner account, once, if no admin exists |
| `PORT` | no | API port (default 4000) |
| `CORS_ORIGIN` | yes | The site origin allowed to call the API |
| `PUBLIC_SITE_URL` | yes | Used in notification emails and links |
| `API_URL` | yes (web) | Where the web app reaches the API, server-side only |
| `NEXT_PUBLIC_SITE_URL` | yes (web) | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no | Contact address shown on the site |
| `SMTP_URL`, `NOTIFY_EMAIL_TO`, `MAIL_FROM` | no | Enables email notifications for new requests |
| `FX_PROVIDER_URL`, `FX_REFRESH_HOURS` | no | Exchange-rate source and refresh interval |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | no | Enables card payment against schedule items |
| `PAYMENT_BANK_DETAILS` | no | Bank details shown on a customer's payment schedule |

---

## Database

Drizzle migrations live in `apps/api/drizzle/` and run automatically on boot, before anything else touches the database.

```bash
cd apps/api
npm run db:generate     # after editing src/db/schema.ts
```

On an empty database the API seeds, once:

- the pricing catalogue (`packages/pricing/src/defaults.ts`),
- the currency table (GBP base, EUR and USD disabled until a rate is fetched or set),
- the portfolio (`apps/api/src/projects/default-projects.ts`),
- the first admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Nothing is ever overwritten — seeding only runs when a table is empty.

---

## Development commands

Run from the repository root; each one fans out across the workspaces.

```bash
npm run typecheck     # tsc across web, api and the pricing package
npm run lint          # eslint across all workspaces
npm test              # pricing unit tests + API end-to-end tests (PGlite, no Docker needed)
npm run build         # pricing package, then the API and the production Next.js build
```

Per workspace:

```bash
npm run dev:web                       # next dev
npm run dev:api                       # nest start --watch
npm test -w @cybercina/pricing           # 34 unit tests
npm test -w api                       # 49 end-to-end tests against a real HTTP server
```

---

## Production build and deployment

```bash
npm run build
docker compose up -d --build     # or deploy the two images separately
```

The web app builds in `standalone` mode with `outputFileTracingRoot` set to the workspace root, so the monorepo traces correctly. Notes for a real deployment:

- Put the web container behind TLS. The app already sends HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, a `Referrer-Policy` and a `Permissions-Policy`.
- Keep the API unpublished; only the web app should be able to reach it.
- Set `NEXT_PUBLIC_SITE_URL` to the real domain at **build** time — canonical URLs and the sitemap are baked in.
- Provide `SMTP_URL` so new project requests are emailed, and `FX_PROVIDER_URL` if you want live exchange rates.
- Back up the database. Proposals, payment schedules and the audit log are the record of what was agreed.

---

## Admin

`/admin`, signed in with the seeded owner account.

| Area | What it does |
|---|---|
| Dashboard | Open requests, pipeline value, outstanding payments, overdue instalments |
| Requests | Every project request, its configuration, the automated estimate, the final price control and its proposals |
| Pipeline | The same requests as a board, by stage |
| Proposals | Draft, edit, publish and withdraw commercial proposals; download any as a PDF |
| Payments | Plans, schedules, recorded payments, refunds and plan cancellation |
| Portfolio | The projects shown on `/work` and the homepage |
| Pricing | Item prices, complexity / timeline / scale multipliers, and the global estimate settings |
| Currencies | Rates, rounding, availability, manual overrides and rate history |
| Audit Log | Every privileged change: who, what, when and the reason given |
| Admins | Accounts and roles |

**Roles.** `viewer` reads everything and changes nothing. `manager` can set prices, issue proposals and record payments. `owner` can additionally manage admins. No one can change their own role, so the last owner can never be locked out.

---

## Pricing configuration

No price is hard-coded in a component. The estimate is:

```
subtotal   = foundation + features + platforms + integrations + AI + design
             (each extra solution counts at `additionalSolutionFactor`)
× complexity multiplier
× scale multiplier
× timeline multiplier
→ rounded to `roundTo`, with an indicative range of [rangeLow, rangeHigh]
```

Everything in that calculation is a database row editable at **Admin → Pricing**: item prices, the three multiplier groups, and the settings. `packages/pricing/src/defaults.ts` is only the first-boot seed.

**Timelines change the price, visibly.** Each timeline option carries a multiplier and a delivery length in weeks. The builder shows the base project, the uplift and the new total as separate lines, and explains why — the price is never adjusted silently. The shipped defaults are Flexible ×1.00, 3–6 months ×1.00, 2–3 months ×1.10, 1–2 months ×1.20, ASAP ×1.35; all editable.

**Automated estimate vs final commercial price.** The estimate is generated. The final price is set by an authorised admin — accept the estimate, adjust it by an amount, or enter a figure directly — always with a reason, always recorded against the admin who set it, and always visible as history on the request.

---

## Currency configuration

GBP is the base currency; every amount is stored in pounds. **Admin → Currencies** controls rates, rounding step, and which currencies customers may choose.

- With `FX_PROVIDER_URL` set, rates refresh on boot and on a timer. Any JSON endpoint returning `{ "rates": { "EUR": 1.17, "USD": 1.27 } }` for a GBP base works.
- A hand-entered rate is marked `manual` and is never overwritten by a later refresh.
- A failed refresh keeps the last good rate and records the error, which the admin sees.
- Every rate change is written to a history table.

Each request and proposal stores the base GBP amount, the chosen currency, the exchange rate used, the converted amount and the timestamp of that rate. Old documents keep their value when rates move.

---

## Payment configuration

Three plans, offered once a proposal is published:

| Plan | Schedule |
|---|---|
| `full` | One payment, seven days after acceptance |
| `split-completion` | 50% deposit, 50% at the completion milestone — the customer picks the date |
| `split-development` | 50% deposit, 50% at a date during the build — the customer picks the date |

Second-payment dates are validated against the project's own delivery window on both sides. `split-completion` allows two weeks before the planned completion date through 30 days after it; `split-development` requires at least two weeks after start and at least a week before completion. A date outside the window is refused with an explanation, not a generic error.

Payment status is derived from the recorded ledger and the due dates — never from anything the browser reports. Statuses: Not started, Awaiting payment, Partially paid, Paid, Overdue, Cancelled, Refunded.

---

## Project Builder architecture

`/project-builder`, a fourteen-step configurator.

- **Catalogue** — fetched server-side from `GET /public/pricing` and passed to the client component. If the API is unreachable the bundled defaults render instead, in GBP only, with a notice; the API still re-prices on submit, so a stale catalogue can never produce a binding price.
- **State** — `useBuilderState` keeps the configuration in `sessionStorage`, so a refresh or a detour doesn't lose it.
- **Live estimate** — `estimate()` from `@cybercina/pricing`, recomputed on every change, with an animated total, a line-by-line breakdown and each multiplier shown as its own adjustment.
- **Summary** — a sticky rail on desktop (`0x00C0DE · project.config`, with the branded `.pb-scroll` scrollbar), a collapsible bar on mobile.
- **Recommendations** — rules in `content/project-builder.ts` suggest companion features based on what has been selected. Suggestions are additive and dismissible.
- **Submit** — a server action posts to `POST /project-requests`. The API re-prices, allocates a reference (`NX-YYYY-NNNN`), stores a hashed access token and emails both sides. The customer lands on `/request/<token>`, their private page for the whole engagement.

Presentation data (industries, goals, icon mapping, recommendation rules) is separate from priced data (the catalogue). Only the catalogue carries money.

---

## SEO architecture

- `lib/seo.ts` builds page metadata: unique title, description, canonical, Open Graph and Twitter card.
- JSON-LD helpers for Organization, WebSite, BreadcrumbList, Service, BlogPosting and FAQPage. Structured data is only emitted where it genuinely applies.
- `app/sitemap.ts` generates `sitemap.xml` from the content modules and the live portfolio; `app/robots.ts` generates `robots.txt`.
- `app/icon.svg`, `app/apple-icon.tsx`, `app/manifest.ts` and a generated `app/opengraph-image.tsx`.
- Retired URLs redirect permanently in `next.config.ts` rather than 404.
- Private pages — a customer's `/request/<token>` and everything under `/admin` — are explicitly `noindex`.

---

## Portfolio architecture

Projects are database rows, managed at **Admin → Portfolio**, served from `GET /public/projects` and rendered at `/work` and `/work/<slug>`.

Previews are **not** screenshots. `components/portfolio/site-preview.tsx` renders an original, abstract representation of each site's structure — navigation, hero, and the layout that does the work — inside a browser frame, tinted by a per-project accent. This communicates what a project looks like without reproducing anyone's copyrighted photography or artwork.

Every project description is limited to functionality verifiable on the live site. There are no invented metrics, outcomes, testimonials or awards anywhere in the portfolio, and none should be added.

---

## Design system

Documented in `docs/design/DESIGN.md`. In short:

- **Palette** — `#000000`, `#1B1B1B`, `#BFF747` (lime), `#C2C2C2`, `#FFFFFF`. Lime on white is ~1.2:1, so light surfaces lead with ink and lime leads on dark. Section tones are `light`, `soft`, `wash` (tinted with a dot grid and a lime bloom) and `dark`.
- **Type** — Boldonse for headings, DM Sans for body, JetBrains Mono for data and labels, Silkscreen for the terminal accents. All self-hosted, subset, variable where available.
- **Motion** — CSS only, defined once in `globals.css`: scroll reveals, four rotating card behaviours, arrow nudges, icon micro-animations. Everything is inside `@media (prefers-reduced-motion: no-preference)`, and continuous decoration pauses when its section is off-screen.
- **Accessibility** — semantic landmarks, visible focus rings on a `:focus-visible` outline, `aria-pressed` on every toggle card, labelled form controls, live regions for async state, and touch targets sized for thumbs.

---

## Content rules

The site makes no claim it cannot support:

- No invented clients, awards, testimonials, partnerships, statistics or business results.
- Portfolio entries describe only functionality visible on the live site.
- Blog posts are labelled as sample articles.
- Prices are indicative ranges, and the site says so.
- Legal pages are templates and are flagged for legal review before launch.

---

## Before launch

1. Set the real `NEXT_PUBLIC_SITE_URL` before building — canonical URLs and the sitemap are baked in at build time.
2. Have the privacy, terms and cookie pages reviewed by a solicitor.
3. Configure `SMTP_URL`, `NOTIFY_EMAIL_TO` and `MAIL_FROM` so new requests are emailed.
4. Set `PAYMENT_BANK_DETAILS`, and `STRIPE_SECRET_KEY` if you want card payments.
5. Set `FX_PROVIDER_URL`, or set EUR and USD rates manually in Admin → Currencies, before offering either currency.
6. Change the seeded admin password and create individual accounts with the narrowest role each person needs.
7. Put the web container behind TLS and back up the database.
