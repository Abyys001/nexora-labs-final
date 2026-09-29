import type { PricingCatalog } from "@cybercina/pricing"

import type { Enquiry, EnquiryStatus } from "@/lib/enquiry"

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers } })
  if (res.status === 401) {
    // Full navigation on purpose: it drops every cached query from the expired session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`)
    throw new ApiError(401, "Your session has expired")
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null
    throw new ApiError(res.status, body?.error?.message ?? "Request failed")
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Shared admin domain types (docs/architecture/commercial-flow.md §2-3)
// ---------------------------------------------------------------------------

export type AdminRole = "owner" | "manager" | "viewer"
export type AdminProfile = { id: string; email: string; name: string; role: AdminRole }
export type AdminSummary = { id: string; email: string; name: string; role: AdminRole; createdAt: string; updatedAt: string }

export type PriceChangeMode = "accept" | "adjust" | "manual"
export type PriceChange = {
  id: string
  enquiryId: string
  adminId: string | null
  previousGbp: number | null
  newGbp: number
  mode: PriceChangeMode
  reason: string
  createdAt: string
}

export type ProposalStatus = "draft" | "published" | "accepted" | "superseded" | "withdrawn"
export type ProposalContent = {
  summary: string
  requirements: string[]
  scope: { title: string; body: string }[]
  assumptions: string[]
  exclusions: string[]
  nextSteps: string[]
}
export type Proposal = {
  id: string
  enquiryId: string
  version: number
  status: ProposalStatus
  automatedEstimateGbp: number
  finalPriceGbp: number
  currency: "GBP" | "EUR" | "USD"
  exchangeRate: number | null
  rateRecordedAt: string | null
  amountInCurrency: number | null
  content: ProposalContent
  validUntil: string | null
  createdBy: string | null
  publishedAt: string | null
  acceptedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentPlanKind = "full" | "split-completion" | "split-development"
export type ScheduleStatus = "scheduled" | "awaiting" | "paid" | "partially-paid" | "overdue" | "cancelled" | "refunded"
export type RequestPaymentStatus = "not-started" | "awaiting-payment" | "partially-paid" | "paid" | "overdue" | "cancelled" | "refunded"

export type PaymentPlan = {
  id: string
  proposalId: string
  plan: PaymentPlanKind
  secondDueDate: string | null
  cancelled: boolean
  cancelledAt: string | null
  createdAt: string
}
export type ScheduleItem = {
  id: string
  planId: string
  sequence: number
  label: string
  amountGbp: number
  amountInCurrency: number | null
  dueDate: string
  status: ScheduleStatus
  createdAt: string
  updatedAt: string
}
export type PlanWithSchedule = { plan: PaymentPlan; items: ScheduleItem[] }

export type PaymentMethod = "bank-transfer" | "stripe" | "other"
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded"
export type Payment = {
  id: string
  scheduleItemId: string
  amountGbp: number
  amountInCurrency: number | null
  currency: "GBP" | "EUR" | "USD"
  method: PaymentMethod
  status: PaymentStatus
  providerRef: string | null
  recordedBy: string | null
  note: string | null
  createdAt: string
}

export type AdminPaymentSummary = {
  enquiryId: string
  proposalId: string
  plan: PaymentPlanKind
  totalGbp: number
  paidGbp: number
  remainingGbp: number
  nextDue: { dueDate: string; amountGbp: number } | null
  status: RequestPaymentStatus
}

export type EnquiryDetail = Enquiry & {
  priceChanges: PriceChange[]
  proposals: Proposal[]
  paymentPlan: PlanWithSchedule | null
  paymentStatus: RequestPaymentStatus
}

export type DashboardSummary = {
  byStatus: Record<string, number>
  pipelineValueGbp: number
  outstandingPaymentsGbp: number
  overdueCount: number
  recentRequests: {
    id: string
    reference: string | null
    name: string
    company: string | null
    estimateGbp: number | null
    finalPriceGbp: number | null
    status: string
    createdAt: string
  }[]
}

export type PricingItemRow = {
  id: string
  itemId: string
  kind: "solution" | "feature" | "platform" | "integration" | "ai" | "design" | "support" | "maintenance"
  categoryId: string
  label: string
  blurb: string
  icon: string
  price: number
  complexity: "s" | "m" | "l" | "xl"
  recommends: string[]
  requires: string[]
  addons: string[]
  active: boolean
  sort: number
  createdAt: string
  updatedAt: string
}
export type PricingCategoryRow = { id: string; categoryId: string; label: string; icon: string; sort: number; createdAt: string; updatedAt: string }
export type PricingMultiplierRow = {
  id: string
  group: "complexity" | "timeline" | "scale"
  multiplierId: string
  label: string
  description: string
  multiplier: number
  weeks: number | null
  sort: number
  createdAt: string
  updatedAt: string
}
export type PricingSettingsRow = { id: string; additionalSolutionFactor: number; rangeLow: number; rangeHigh: number; roundTo: number; updatedAt: string }
export type PublicPricingResponse = { catalog: PricingCatalog; currencies: { code: string; rate: number; rounding: string; rateUpdatedAt: string | null }[] }

export type CurrencyRow = {
  code: "GBP" | "EUR" | "USD"
  enabled: boolean
  rate: number
  source: "provider" | "manual"
  rounding: string
  rateUpdatedAt: string | null
  lastRefreshError: string | null
}
export type ExchangeRateHistoryRow = { id: string; code: "GBP" | "EUR" | "USD"; rate: number; source: "provider" | "manual"; recordedAt: string }

export type AuditLogRow = {
  id: string
  adminId: string | null
  action: string
  entity: string
  entityId: string | null
  before: unknown
  after: unknown
  reason: string | null
  createdAt: string
}
export type AuditLogListResult = { items: AuditLogRow[]; total: number; page: number; pageSize: number }

// ---------------------------------------------------------------------------
// Requests / enquiries
// ---------------------------------------------------------------------------

export type EnquiryFilters = { status?: string; source?: string; q?: string; page: number; pageSize: number }
export type EnquiryPage = { items: Enquiry[]; total: number; page: number; pageSize: number }
export type EnquiryStats = { total: number; byStatus: Partial<Record<EnquiryStatus, number>> }

export const enquiryKeys = {
  all: ["enquiries"] as const,
  list: (f: EnquiryFilters) => ["enquiries", "list", f] as const,
  stats: ["enquiries", "stats"] as const,
  detail: (id: string) => ["enquiries", "detail", id] as const,
}

export function fetchEnquiries(f: EnquiryFilters) {
  const params = new URLSearchParams({ page: String(f.page), pageSize: String(f.pageSize) })
  if (f.status) params.set("status", f.status)
  if (f.source) params.set("source", f.source)
  if (f.q) params.set("q", f.q)
  return request<EnquiryPage>(`/api/admin/enquiries?${params}`)
}

export const fetchStats = () => request<EnquiryStats>("/api/admin/enquiries/stats")
export const fetchEnquiry = (id: string) => request<EnquiryDetail>(`/api/admin/enquiries/${id}`)
export const updateEnquiry = (id: string, patch: { status?: EnquiryStatus; notes?: string }) =>
  request<EnquiryDetail>(`/api/admin/enquiries/${id}`, { method: "PATCH", body: JSON.stringify(patch) })

export const setFinalPrice = (
  enquiryId: string,
  body: { mode: PriceChangeMode; amountGbp?: number; deltaGbp?: number; reason: string },
) => request<{ enquiryId: string; finalPriceGbp: number }>(`/api/admin/enquiries/${enquiryId}/final-price`, { method: "POST", body: JSON.stringify(body) })

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const dashboardKeys = { summary: ["dashboard"] as const }
export const fetchDashboard = () => request<DashboardSummary>("/api/admin/dashboard")

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------

export const proposalKeys = {
  all: ["proposals"] as const,
  list: ["proposals", "list"] as const,
  detail: (id: string) => ["proposals", "detail", id] as const,
}

export const fetchProposals = () => request<Proposal[]>("/api/admin/proposals")
export const fetchProposal = (id: string) => request<Proposal>(`/api/admin/proposals/${id}`)
export const createProposalDraft = (enquiryId: string, body: { content: ProposalContent; validUntil?: string }) =>
  request<Proposal>(`/api/admin/enquiries/${enquiryId}/proposals`, { method: "POST", body: JSON.stringify(body) })
export const updateProposal = (id: string, body: { content?: ProposalContent; validUntil?: string }) =>
  request<Proposal>(`/api/admin/proposals/${id}`, { method: "PATCH", body: JSON.stringify(body) })
export const publishProposal = (id: string) => request<Proposal>(`/api/admin/proposals/${id}/publish`, { method: "POST" })
export const withdrawProposal = (id: string) => request<Proposal>(`/api/admin/proposals/${id}/withdraw`, { method: "POST" })
export const proposalPdfUrl = (id: string) => `/api/admin/proposals/${id}/pdf`

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const paymentKeys = { all: ["payments"] as const, list: ["payments", "list"] as const }

export const fetchPayments = () => request<AdminPaymentSummary[]>("/api/admin/payments")
export const recordPayment = (body: { scheduleItemId: string; amountGbp: number; method: "bank-transfer" | "other"; note?: string }) =>
  request<Payment>("/api/admin/payments", { method: "POST", body: JSON.stringify(body) })
export const refundPayment = (id: string, reason: string) =>
  request<Payment>(`/api/admin/payments/${id}/refund`, { method: "POST", body: JSON.stringify({ reason }) })
export const cancelPaymentPlan = (id: string, reason: string) =>
  request<PaymentPlan>(`/api/admin/payment-plans/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) })

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export const pricingKeys = {
  catalog: ["pricing", "catalog"] as const,
  settings: ["pricing", "settings"] as const,
}

export const fetchPricingCatalog = () => request<PublicPricingResponse>("/api/admin/pricing/catalog")
export const createPricingItem = (dto: Omit<PricingItemRow, "id" | "createdAt" | "updatedAt">) =>
  request<PricingItemRow>("/api/admin/pricing/items", { method: "POST", body: JSON.stringify(dto) })
export const updatePricingItem = (id: string, patch: Partial<Omit<PricingItemRow, "id" | "itemId" | "createdAt" | "updatedAt">>) =>
  request<PricingItemRow>(`/api/admin/pricing/items/${id}`, { method: "PUT", body: JSON.stringify(patch) })
export const updatePricingCategory = (id: string, patch: Partial<Pick<PricingCategoryRow, "label" | "icon" | "sort">>) =>
  request<PricingCategoryRow>(`/api/admin/pricing/categories/${id}`, { method: "PUT", body: JSON.stringify(patch) })
export const updatePricingMultiplier = (id: string, patch: Partial<Pick<PricingMultiplierRow, "label" | "description" | "multiplier" | "weeks" | "sort">>) =>
  request<PricingMultiplierRow>(`/api/admin/pricing/multipliers/${id}`, { method: "PUT", body: JSON.stringify(patch) })
export const fetchPricingSettings = () => request<PricingSettingsRow>("/api/admin/pricing/settings")
export const updatePricingSettings = (dto: { additionalSolutionFactor: number; rangeLow: number; rangeHigh: number; roundTo: number }) =>
  request<PricingSettingsRow>("/api/admin/pricing/settings", { method: "PUT", body: JSON.stringify(dto) })

// ---------------------------------------------------------------------------
// Currencies
// ---------------------------------------------------------------------------

export const currencyKeys = {
  all: ["currencies"] as const,
  list: ["currencies", "list"] as const,
  history: (code?: string) => ["currencies", "history", code ?? "all"] as const,
}

export const fetchCurrencies = () => request<CurrencyRow[]>("/api/admin/currencies")
export const fetchCurrencyHistory = (code?: string) =>
  request<ExchangeRateHistoryRow[]>(`/api/admin/currencies/history${code ? `?code=${code}` : ""}`)
export const updateCurrency = (code: string, patch: { enabled?: boolean; rate?: number; rounding?: "none" | 1 | 10 | 50 | 100; source?: "provider" | "manual" }) =>
  request<CurrencyRow>(`/api/admin/currencies/${code}`, { method: "PUT", body: JSON.stringify(patch) })
export const refreshCurrencies = () => request<{ ok: true }>("/api/admin/currencies/refresh", { method: "POST" })

// ---------------------------------------------------------------------------
// Portfolio projects
// ---------------------------------------------------------------------------

export type ProjectRow = {
  id: string
  slug: string
  title: string
  client: string
  industry: string
  category: string
  location: string | null
  websiteUrl: string | null
  shortDescription: string
  detailedDescription: string
  clientNeed: string
  whatWeBuilt: string
  customerExperience: string
  businessFunctionality: string
  services: string[]
  capabilities: string[]
  technologies: string[]
  previewTheme: "ink" | "amber" | "azure" | "violet" | "steel"
  previewLayout: "standard" | "hospitality" | "commerce" | "services" | "booking"
  heroImage: string | null
  previewImage: string | null
  gallery: string[]
  featured: boolean
  homepageVisible: boolean
  status: "draft" | "published" | "archived"
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type ProjectInput = Omit<ProjectRow, "id" | "createdAt" | "updatedAt" | "location" | "websiteUrl" | "heroImage" | "previewImage"> & {
  location?: string
  websiteUrl?: string
  heroImage?: string
  previewImage?: string
}

export const projectKeys = { list: ["projects"] as const, detail: (id: string) => ["projects", id] as const }

export const fetchProjects = () => request<ProjectRow[]>("/api/admin/projects")
export const createProject = (dto: ProjectInput) => request<ProjectRow>("/api/admin/projects", { method: "POST", body: JSON.stringify(dto) })
export const updateProject = (id: string, dto: Partial<ProjectInput>) =>
  request<ProjectRow>(`/api/admin/projects/${id}`, { method: "PATCH", body: JSON.stringify(dto) })
export const archiveProject = (id: string) => request<ProjectRow>(`/api/admin/projects/${id}`, { method: "DELETE" })

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export const auditLogKeys = { list: (entity: string | undefined, page: number) => ["audit-logs", entity ?? "all", page] as const }
export const fetchAuditLogs = (f: { entity?: string; page: number; pageSize: number }) => {
  const params = new URLSearchParams({ page: String(f.page), pageSize: String(f.pageSize) })
  if (f.entity) params.set("entity", f.entity)
  return request<AuditLogListResult>(`/api/admin/audit-logs?${params}`)
}

// ---------------------------------------------------------------------------
// Admins
// ---------------------------------------------------------------------------

export const adminKeys = { list: ["admins"] as const }
export const fetchAdmins = () => request<AdminSummary[]>("/api/admin/admins")
export const createAdmin = (dto: { email: string; name: string; role: AdminRole; password: string }) =>
  request<AdminSummary>("/api/admin/admins", { method: "POST", body: JSON.stringify(dto) })
export const updateAdmin = (id: string, dto: { role?: AdminRole; name?: string; password?: string }) =>
  request<AdminSummary>(`/api/admin/admins/${id}`, { method: "PATCH", body: JSON.stringify(dto) })
