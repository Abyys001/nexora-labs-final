import { selectionSchema } from "@cybercina/pricing"
import { z } from "zod"

// Mirrors apps/api/src/project-requests/dto/create-project-request.dto.ts.
// The API re-validates and re-prices everything server-side; this schema only
// catches mistakes before a round trip.

export const companySizeValues = ["1-10", "11-50", "51-200", "201-1000", "1000-plus"] as const
export const preferredContactValues = ["email", "phone", "video-call"] as const
export const currencyCodes = ["GBP", "EUR", "USD"] as const

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional())

export const projectRequestContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email address").max(254),
  company: optionalText(160),
  phone: optionalText(40),
  website: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.url("Please enter a full URL, e.g. https://example.com").max(300).optional(),
  ),
  companySize: z.enum(companySizeValues).optional(),
  preferredContact: z.enum(preferredContactValues).default("email"),
})

export const projectRequestDetailsSchema = z.object({
  goals: z.array(z.string().trim().max(60)).max(20).default([]),
  industries: z.array(z.string().trim().max(60)).max(25).default([]),
  successCriteria: optionalText(1000),
  notes: optionalText(3000),
  designNotes: optionalText(2000),
  startDate: optionalText(40),
  paymentPreference: optionalText(80),
})

export const createProjectRequestSchema = z.object({
  contact: projectRequestContactSchema,
  selection: selectionSchema,
  details: projectRequestDetailsSchema,
  currency: z.enum(currencyCodes).default("GBP"),
  hp: z.string().optional(),
})

export type CreateProjectRequestInput = z.input<typeof createProjectRequestSchema>
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>

export const companySizeOptions = [
  { value: "1-10", label: "1 – 10 people" },
  { value: "11-50", label: "11 – 50 people" },
  { value: "51-200", label: "51 – 200 people" },
  { value: "201-1000", label: "201 – 1,000 people" },
  { value: "1000-plus", label: "1,000+ people" },
] as const

export const preferredContactOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "video-call", label: "Video call" },
] as const

export const paymentPreferenceOptions = [
  { value: "full", label: "Pay 100% upfront", hint: "Settled in one invoice once the proposal is accepted." },
  { value: "split-completion", label: "50 / 50 on completion", hint: "Half to start, half at the agreed completion milestone." },
  { value: "split-development", label: "50% upfront + 50% during development", hint: "Half to start, half at a date you choose mid-build." },
  { value: "undecided", label: "Decide once I've seen the proposal", hint: "No commitment now — you choose when the proposal arrives." },
] as const
