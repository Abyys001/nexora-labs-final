import { z } from "zod"

// Mirrors docs/api-contract.md; the API re-validates everything server-side.
export const projectTypes = [
  { value: "website", label: "Website" },
  { value: "web-app", label: "Web Application" },
  { value: "mobile-app", label: "Mobile App" },
  { value: "ai", label: "AI Solution" },
  { value: "crm", label: "CRM" },
  { value: "saas", label: "SaaS" },
  { value: "automation", label: "Automation" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "other", label: "Other" },
] as const

export const budgets = [
  { value: "2k-5k", label: "£2,000 – £5,000" },
  { value: "5k-10k", label: "£5,000 – £10,000" },
  { value: "10k-25k", label: "£10,000 – £25,000" },
  { value: "25k-50k", label: "£25,000 – £50,000" },
  { value: "50k-plus", label: "£50,000+" },
  { value: "not-sure", label: "Not sure yet" },
] as const

export const contactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "video-call", label: "Video call" },
] as const

export const companySizes = [
  { value: "1-10", label: "1 – 10 people" },
  { value: "11-50", label: "11 – 50 people" },
  { value: "51-200", label: "51 – 200 people" },
  { value: "201-1000", label: "201 – 1,000 people" },
  { value: "1000-plus", label: "1,000+ people" },
] as const

export const timelines = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "Within 1 – 3 months" },
  { value: "3-6-months", label: "Within 3 – 6 months" },
  { value: "6-plus-months", label: "6+ months" },
  { value: "flexible", label: "Flexible" },
] as const

export const enquiryStatuses = ["new", "contacted", "qualified", "won", "lost", "archived"] as const
export type EnquiryStatus = (typeof enquiryStatuses)[number]

const values = <T extends readonly { value: string }[]>(opts: T) =>
  opts.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]]

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional())

export const userScales = ["under-100", "100-1k", "1k-10k", "10k-100k", "100k-plus", "not-sure"] as const
export const projectStages = ["idea", "prototype", "live-product", "replacing-system"] as const

const idList = (max: number) => z.array(z.string().trim().min(1).max(60)).max(max)

// Project Builder selections. Ids resolve to labels via content/project-builder.ts.
export const configurationSchema = z.object({
  solutionTypes: idList(15).min(1, "Choose at least one thing you need"),
  industries: idList(25),
  goals: idList(20),
  successCriteria: optional(z.string().trim().max(1000)),
  features: idList(120),
  platforms: idList(8),
  userScale: optional(z.enum(userScales)),
  stage: optional(z.enum(projectStages)),
  estimate: z
    .object({ min: z.int().nonnegative().max(10_000_000), max: z.int().nonnegative().max(10_000_000), currency: z.literal("GBP") })
    .refine((e) => e.max >= e.min, "Estimate max must be at least min"),
})

export type ProjectConfiguration = z.infer<typeof configurationSchema>

export const enquirySchema = z.object({
  source: z.enum(["contact", "quote"]),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email address").max(254),
  company: optional(z.string().trim().max(160)),
  phone: optional(z.string().trim().max(40)),
  projectType: z.enum(values(projectTypes), "Please choose a project type"),
  budget: z.enum(values(budgets), "Please choose a budget range"),
  description: z
    .string()
    .trim()
    .min(20, "Please tell us a little more (at least 20 characters)")
    .max(5000),
  preferredContact: optional(z.enum(values(contactMethods))),
  industry: optional(z.string().trim().max(80)),
  companySize: optional(z.enum(values(companySizes))),
  website: optional(z.url("Please enter a full URL, e.g. https://example.com").max(300)),
  features: z.array(z.string().max(80)).max(20).optional(),
  timeline: optional(z.enum(values(timelines))),
  startDate: optional(z.string().trim().max(40)),
  configuration: configurationSchema.optional(),
  hp: z.string().optional(),
})

export type EnquiryInput = z.infer<typeof enquirySchema>
export type FieldErrors = Partial<Record<keyof EnquiryInput, string[]>>

// Commercial-flow fields (docs/architecture/commercial-flow.md §2-3) — null for plain contact-form enquiries.
export type EnquirySelection = {
  solutionTypes: string[]
  features: string[]
  platforms: string[]
  integrations: string[]
  ai: string[]
  design: string[]
  support?: string
  maintenance?: string
  complexity: string
  timeline: string
  userScale?: string
}

export type EstimateLine = { key: string; label: string; amount: number; detail?: string }
export type EstimateAdjustment = { key: "complexity" | "scale" | "timeline"; label: string; multiplier: number; amount: number; reason: string }
export type EnquiryEstimate = {
  catalogVersion: string
  lines: EstimateLine[]
  subtotal: number
  adjustments: EstimateAdjustment[]
  total: number
  range: { low: number; high: number }
  monthly: { support: number; maintenance: number }
}

export type CurrencyCode = "GBP" | "EUR" | "USD"

export type Enquiry = Omit<EnquiryInput, "hp" | "configuration"> & {
  id: string
  configuration: ProjectConfiguration | null
  status: EnquiryStatus
  notes: string | null
  userAgent: string | null
  reference: string | null
  selection: EnquirySelection | null
  estimate: EnquiryEstimate | null
  estimateGbp: number | null
  currency: CurrencyCode | null
  exchangeRate: number | null
  rateRecordedAt: string | null
  finalPriceGbp: number | null
  projectDetails: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export function labelFor(options: readonly { value: string; label: string }[], value?: string | null) {
  return options.find((o) => o.value === value)?.label ?? value ?? "—"
}

export function formDataToEnquiry(formData: FormData) {
  const raw: Record<string, unknown> = {}
  for (const key of new Set(formData.keys())) {
    if (key === "features") raw[key] = formData.getAll(key).map(String)
    else if (key === "configuration") raw[key] = parseJson(String(formData.get(key) ?? ""))
    else raw[key] = String(formData.get(key) ?? "")
  }
  return raw
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
