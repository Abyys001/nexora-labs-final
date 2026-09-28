// Shape of the public request endpoints (`/api/public/requests/:token`), mirrored
// from apps/api/src/project-requests/project-requests.service.ts. Shared by the
// server fetchers and the client components that render a request.
import type { Estimate, PaymentPlanKind, Selection } from "@nexora/pricing"

export type CurrencyCode = "GBP" | "EUR" | "USD"

export type ProposalContent = {
  summary: string
  requirements: string[]
  scope: { title: string; body: string }[]
  assumptions: string[]
  exclusions: string[]
  nextSteps: string[]
}

export type PublicProposal = {
  id: string
  version: number
  status: "draft" | "published" | "accepted" | "superseded" | "withdrawn"
  finalPriceGbp: number
  currency: CurrencyCode
  exchangeRate: number | null
  amountInCurrency: number | null
  content: ProposalContent
  validUntil: string | null
  publishedAt: string | null
}

export type ScheduleItemStatus = "scheduled" | "awaiting" | "paid" | "partially-paid" | "overdue" | "cancelled" | "refunded"

export type PaymentScheduleItem = {
  id: string
  sequence: number
  label: string
  amountGbp: number
  amountInCurrency: number | null
  dueDate: string
  status: ScheduleItemStatus
}

export type PaymentPlan = {
  plan: {
    id: string
    proposalId: string
    plan: PaymentPlanKind
    secondDueDate: string | null
    cancelled: boolean
    cancelledAt: string | null
    createdAt: string
  }
  items: PaymentScheduleItem[]
}

export type RequestPaymentStatus =
  | "not-started"
  | "awaiting-payment"
  | "partially-paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded"

export type PublicRequestView = {
  reference: string
  stage: "under-review" | "proposal-ready" | "accepted"
  selection: Selection | null
  estimate: Estimate | null
  currency: CurrencyCode | null
  exchangeRate: number | null
  rateRecordedAt: string | null
  proposal: PublicProposal | null
  paymentPlan: PaymentPlan | null
  paymentStatus: RequestPaymentStatus
  bankDetails: string | null
  stripeEnabled: boolean
}

export const paymentPlanOptions: { id: PaymentPlanKind; label: string; summary: string; detail: string; needsDate: boolean }[] = [
  {
    id: "full",
    label: "Pay 100% upfront",
    summary: "One payment, due seven days after you accept the proposal.",
    detail: "The simplest option — the whole project value is settled in a single invoice before delivery begins.",
    needsDate: false,
  },
  {
    id: "split-completion",
    label: "50 / 50 on completion",
    summary: "50% to start, 50% at the agreed completion milestone.",
    detail: "The balance falls due around the planned completion date. You choose the exact date within the delivery window.",
    needsDate: true,
  },
  {
    id: "split-development",
    label: "50% upfront + 50% during development",
    summary: "50% to start, 50% at a date you choose mid-build.",
    detail: "Spreads the cost across the build. The second date must sit inside the development window, before delivery completes.",
    needsDate: true,
  },
]

export const paymentStatusLabels: Record<RequestPaymentStatus, string> = {
  "not-started": "Not started",
  "awaiting-payment": "Awaiting payment",
  "partially-paid": "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

export const scheduleStatusLabels: Record<ScheduleItemStatus, string> = {
  scheduled: "Scheduled",
  awaiting: "Awaiting payment",
  paid: "Paid",
  "partially-paid": "Partially paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00.000Z` : iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date)
}
