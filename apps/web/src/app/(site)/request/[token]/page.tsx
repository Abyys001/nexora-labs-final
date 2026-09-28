import { CheckCircle2, Clock3, Download, FileText, Mail, Phone, ShieldCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PaymentPlanPicker } from "@/components/request/payment-plan-picker"
import { PageHero } from "@/components/sections/page-hero"
import { Section, SectionHeader } from "@/components/sections/section"
import { Button } from "@/components/ui/button"
import { site } from "@/content/site"
import { formatMoney } from "@/lib/catalog"
import { formatDate, paymentStatusLabels, scheduleStatusLabels, type PublicRequestView } from "@/lib/request-view"
import { getPublicPricing, getRequestView } from "@/lib/server/public-api"
import { cn } from "@/lib/utils"

// A private, token-addressed page: never indexed, never cached.
export const metadata: Metadata = {
  title: "Your Project Request",
  robots: { index: false, follow: false },
}

const stageCopy: Record<PublicRequestView["stage"], { label: string; title: string; intro: string }> = {
  "under-review": {
    label: "Under review",
    title: "Your Project Is With Our Team",
    intro:
      "We've received your configuration and an automated estimate has been generated from it. A specialist is now reviewing the scope and will confirm a final commercial price in a written proposal.",
  },
  "proposal-ready": {
    label: "Proposal ready",
    title: "Your Proposal Is Ready",
    intro: "Review the scope and the final commercial price below, then choose how you'd like to pay.",
  },
  accepted: {
    label: "Accepted",
    title: "Your Project Is Confirmed",
    intro: "Your payment schedule is set. Here's everything agreed, including the documents you can download.",
  },
}

export default async function RequestPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ new?: string }> }) {
  const { token } = await params
  const { new: isNew } = await searchParams
  const result = await getRequestView(token)

  if (result.status !== "ok") {
    return <RequestUnavailable reason={result.status} />
  }

  const view = result.view
  const stage = stageCopy[view.stage]
  const { catalog } = await getPublicPricing()
  const timelineWeeks = catalog.timelines.find((t) => t.id === view.selection?.timeline)?.weeks ?? 12
  const currency = view.proposal?.currency ?? view.currency ?? "GBP"
  const rate = view.proposal?.exchangeRate ?? view.exchangeRate ?? 1
  const inCurrency = (gbp: number) => formatMoney(currency === "GBP" ? gbp : Math.round(gbp * rate * 100) / 100, currency)

  const proposal = view.proposal
  const plan = view.paymentPlan
  const paidLabel = paymentStatusLabels[view.paymentStatus]

  return (
    <>
      <PageHero
        next="dark"
        eyebrow={`Request ${view.reference}`}
        title={stage.title}
        intro={stage.intro}
        actions={
          <>
            <Button asChild size="xl" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <a href={site.phone.href}>
                <Phone className="size-4" data-icon="inline-start" aria-hidden="true" /> {site.phone.display}
              </a>
            </Button>
            <Button asChild size="xl" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <a href={`mailto:${site.email}?subject=${encodeURIComponent(`Request ${view.reference}`)}`}>
                <Mail className="size-4" data-icon="inline-start" aria-hidden="true" /> Email about this request
              </a>
            </Button>
          </>
        }
      />

      <Section tone="dark">
        {isNew ? (
          <div role="status" className="mb-10 flex items-start gap-3 rounded-2xl border border-lime/30 bg-lime/[0.06] p-5">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Request {view.reference} received</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                We&apos;ve emailed you this private link. Keep it — it&apos;s where your proposal, payment schedule and documents will appear.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Reference" value={view.reference} icon={FileText} />
          <StatCard label="Status" value={stage.label} icon={Clock3} />
          <StatCard label="Payments" value={paidLabel} icon={ShieldCheck} />
        </div>

        {view.estimate ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <SectionHeader
                tone="dark"
                eyebrow="Automated estimate"
                title="What your configuration priced at"
                intro="Generated from your selections against our published catalogue. It is an estimate, not a quote — the final commercial price is set by our team."
              />
              <dl className="mt-7 overflow-hidden rounded-2xl border border-white/10">
                {view.estimate.lines.map((line) => (
                  <div key={line.key} className="flex items-baseline justify-between gap-4 border-b border-white/10 px-5 py-3.5 last:border-0">
                    <dt className="text-sm text-white/70">
                      {line.label}
                      {line.detail ? <span className="ml-2 text-white/35">{line.detail}</span> : null}
                    </dt>
                    <dd className="shrink-0 font-mono text-sm text-white">{inCurrency(line.amount)}</dd>
                  </div>
                ))}
                {view.estimate.adjustments.map((adjustment) => (
                  <div key={adjustment.key} className="flex items-baseline justify-between gap-4 border-b border-white/10 bg-white/[0.02] px-5 py-3.5 last:border-0">
                    <dt className="text-sm text-white/70">
                      {adjustment.label}
                      <span className="ml-2 font-mono text-xs text-white/35">×{adjustment.multiplier.toFixed(2)}</span>
                    </dt>
                    <dd className={cn("shrink-0 font-mono text-sm", adjustment.amount === 0 ? "text-white/40" : "text-lime")}>
                      {adjustment.amount === 0 ? "No change" : `+ ${inCurrency(adjustment.amount)}`}
                    </dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 bg-white/[0.04] px-5 py-4">
                  <dt className="font-semibold text-white">Automated estimate</dt>
                  <dd className="shrink-0 font-heading text-lg text-lime">{inCurrency(view.estimate.total)}</dd>
                </div>
              </dl>
              {currency !== "GBP" && view.rateRecordedAt ? (
                <p className="mt-3 font-mono text-xs text-white/40">
                  Converted from GBP at {rate.toFixed(4)} {currency}/GBP, recorded {formatDate(view.rateRecordedAt)}. This rate is fixed for your request.
                </p>
              ) : null}
            </div>

            <aside className="window p-6">
              <p className="font-mono text-[0.7rem] tracking-[0.14em] text-white/45 uppercase">What happens next</p>
              <ol className="mt-4 grid gap-4">
                {[
                  { title: "We review the scope", body: "A specialist reads your configuration and notes anything that needs clarifying." },
                  { title: "We confirm the price", body: "The final commercial price reflects the real engineering effort — it may differ from the automated estimate." },
                  { title: "You get a written proposal", body: "Scope, assumptions, exclusions, timeline and price, downloadable as a PDF." },
                  { title: "You choose how to pay", body: "Pay in full, or split it — and pick your own second payment date." },
                ].map((entry, i) => (
                  <li key={entry.title} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-lime/30 font-mono text-xs text-lime">{i + 1}</span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{entry.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-white/55">{entry.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        ) : null}
      </Section>

      {proposal ? (
        <Section tone="dark" className="border-t border-white/10">
          <SectionHeader
            tone="dark"
            eyebrow={`Proposal v${proposal.version}`}
            title="Final Commercial Price"
            intro="Reviewed and confirmed by our team. This is the price we will contract and invoice against."
            action={
              <Button asChild size="xl" className="bg-lime text-ink hover:bg-lime/90">
                <a href={`/api/public/requests/${encodeURIComponent(token)}/proposal.pdf`} target="_blank" rel="noopener">
                  <Download className="size-4" data-icon="inline-start" aria-hidden="true" /> Download PDF
                </a>
              </Button>
            }
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <PriceCard label="Automated estimate" value={view.estimate ? inCurrency(view.estimate.total) : "—"} muted />
            <PriceCard
              label="Adjustment"
              value={
                view.estimate
                  ? proposal.finalPriceGbp === view.estimate.total
                    ? "No change"
                    : `${proposal.finalPriceGbp > view.estimate.total ? "+" : "−"} ${inCurrency(Math.abs(proposal.finalPriceGbp - view.estimate.total))}`
                  : "—"
              }
              muted
            />
            <PriceCard label="Final commercial price" value={inCurrency(proposal.finalPriceGbp)} />
          </div>

          {proposal.validUntil ? <p className="mt-4 font-mono text-xs text-white/40">Valid until {formatDate(proposal.validUntil)}.</p> : null}

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <ProposalBlock title="Project summary">
              <p className="leading-relaxed whitespace-pre-line text-white/70">{proposal.content.summary}</p>
            </ProposalBlock>
            {proposal.content.requirements.length ? (
              <ProposalBlock title="Requirements">
                <BulletList items={proposal.content.requirements} />
              </ProposalBlock>
            ) : null}
            {proposal.content.scope.length ? (
              <ProposalBlock title="Scope of work" wide>
                <div className="grid gap-5 sm:grid-cols-2">
                  {proposal.content.scope.map((entry) => (
                    <div key={entry.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="font-semibold text-white">{entry.title}</p>
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-white/60">{entry.body}</p>
                    </div>
                  ))}
                </div>
              </ProposalBlock>
            ) : null}
            {proposal.content.assumptions.length ? (
              <ProposalBlock title="Assumptions">
                <BulletList items={proposal.content.assumptions} />
              </ProposalBlock>
            ) : null}
            {proposal.content.exclusions.length ? (
              <ProposalBlock title="Not included">
                <BulletList items={proposal.content.exclusions} />
              </ProposalBlock>
            ) : null}
            {proposal.content.nextSteps.length ? (
              <ProposalBlock title="Next steps" wide>
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {proposal.content.nextSteps.map((entry, i) => (
                    <li key={entry} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="font-mono text-xs text-lime">{String(i + 1).padStart(2, "0")}</span>
                      <p className="mt-1.5 text-sm leading-snug text-white/70">{entry}</p>
                    </li>
                  ))}
                </ol>
              </ProposalBlock>
            ) : null}
          </div>
        </Section>
      ) : null}

      {proposal ? (
        <Section tone="dark" className="border-t border-white/10">
          <SectionHeader
            tone="dark"
            eyebrow="Payment"
            title={plan ? "Your Payment Schedule" : "Choose How You'd Like to Pay"}
            intro={
              plan
                ? "Agreed and locked against your proposal. We invoice each instalment as it falls due."
                : "Three options. Split plans let you choose the exact date of the second payment, validated against your delivery window."
            }
          />
          <div className="mt-8">
            {plan ? (
              <PaymentSchedule plan={plan} currency={currency} rate={rate} bankDetails={view.bankDetails} status={paidLabel} />
            ) : (
              <PaymentPlanPicker token={token} totalGbp={proposal.finalPriceGbp} currency={currency} exchangeRate={rate} timelineWeeks={timelineWeeks} />
            )}
          </div>
        </Section>
      ) : null}
    </>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-lime/25 bg-lime/10 text-lime">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[0.65rem] tracking-[0.12em] text-white/40 uppercase">{label}</span>
        <span className="mt-0.5 block truncate font-semibold text-white">{value}</span>
      </span>
    </div>
  )
}

function PriceCard({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-5", muted ? "border-white/10 bg-white/[0.02]" : "border-lime/40 bg-lime/[0.07]")}>
      <p className="font-mono text-[0.65rem] tracking-[0.12em] text-white/45 uppercase">{label}</p>
      <p className={cn("mt-2 font-heading", muted ? "text-xl text-white/80" : "text-2xl text-lime")}>{value}</p>
    </div>
  )
}

function ProposalBlock({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={cn(wide && "lg:col-span-2")}>
      <h3 className="font-heading text-lg text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-white/65">
          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function PaymentSchedule({
  plan,
  currency,
  rate,
  bankDetails,
  status,
}: {
  plan: NonNullable<PublicRequestView["paymentPlan"]>
  currency: string
  rate: number
  bankDetails: string | null
  status: string
}) {
  const inCurrency = (gbp: number) => formatMoney(currency === "GBP" ? gbp : Math.round(gbp * rate * 100) / 100, currency)
  const total = plan.items.reduce((sum, item) => sum + item.amountGbp, 0)
  const paid = plan.items.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amountGbp, 0)
  const next = plan.items.find((item) => item.status !== "paid" && item.status !== "cancelled" && item.status !== "refunded")

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
      <ol className="grid gap-4">
        {plan.items.map((item, i) => (
          <li key={item.id} className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-lime/25 bg-lime/10 font-mono text-sm text-lime">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-semibold text-white">{item.label}</p>
                <p className="font-heading text-lg text-lime">{inCurrency(item.amountGbp)}</p>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-white/45">
                <span>Due {formatDate(item.dueDate)}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5",
                    item.status === "paid"
                      ? "bg-lime/15 text-lime"
                      : item.status === "overdue"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-white/10 text-white/60",
                  )}
                >
                  {scheduleStatusLabels[item.status]}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <aside className="window p-6">
        <p className="font-mono text-[0.7rem] tracking-[0.14em] text-white/45 uppercase">Payment summary</p>
        <dl className="mt-4 grid gap-2.5 font-mono text-sm">
          <Row label="Total project" value={inCurrency(total)} />
          <Row label="Payment plan" value={plan.plan.plan === "full" ? "100% upfront" : plan.plan.plan === "split-completion" ? "50 / 50 on completion" : "50% + 50% during build"} />
          <Row label="Paid" value={inCurrency(paid)} />
          <Row label="Remaining" value={inCurrency(total - paid)} />
          {next ? <Row label="Next payment" value={`${inCurrency(next.amountGbp)} · ${formatDate(next.dueDate)}`} /> : null}
          <Row label="Status" value={status} />
        </dl>
        {bankDetails ? (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="font-mono text-[0.65rem] tracking-[0.12em] text-white/40 uppercase">Bank details</p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-white/65">{bankDetails}</p>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-white/50">{label}</dt>
      <dd className="shrink-0 text-white/85">{value}</dd>
    </div>
  )
}

function RequestUnavailable({ reason }: { reason: "not-found" | "unavailable" }) {
  const notFound = reason === "not-found"
  return (
    <>
      <PageHero
        next="light"
        eyebrow="Project request"
        title={notFound ? "We Couldn't Find That Request" : "We Can't Load Your Request Right Now"}
        intro={
          notFound
            ? "The link may have been mistyped or superseded. Use the link in your confirmation email, or get in touch and we'll resend it."
            : "This is a problem on our side, not yours. Your request is safe — please try again in a moment."
        }
        actions={
          <>
            <Button asChild size="xl" className="bg-lime text-ink hover:bg-lime/90">
              <a href={site.phone.href}>
                <Phone className="size-4" data-icon="inline-start" aria-hidden="true" /> {site.phone.display}
              </a>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">Contact us</Link>
            </Button>
          </>
        }
      />
      <Section>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Every project request gets a private link like this one, showing your automated estimate, your written proposal and your payment schedule in one place. If
          you&apos;ve lost yours, we can send it again — just quote your name or company.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="xl">
            <Link href="/project-builder">Start a new project</Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </Section>
    </>
  )
}
