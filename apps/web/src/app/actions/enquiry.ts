"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { enquirySchema, formDataToEnquiry, type FieldErrors } from "@/lib/enquiry"
import { API_URL, readApiError } from "@/lib/server/api"

export type EnquiryState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const parsed = enquirySchema.safeParse(formDataToEnquiry(formData))
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors as FieldErrors }
  }

  const h = await headers()
  const forwardedFor = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? ""

  try {
    const res = await fetch(`${API_URL}/enquiries`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        "user-agent": h.get("user-agent") ?? "",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    if (res.ok) return { status: "success" }

    const err = await readApiError(res)
    if (res.status === 429) return { status: "error", message: "Too many submissions. Please wait a minute and try again." }
    if (res.status === 400) {
      return { status: "error", message: err?.message ?? "Please check the highlighted fields.", fieldErrors: err?.details?.fieldErrors as FieldErrors | undefined }
    }
    console.error("Enquiry API responded with", res.status, err?.code)
  } catch (error) {
    console.error("Enquiry API unreachable:", error instanceof Error ? error.message : error)
  }
  return { status: "error", message: "We couldn't send your enquiry right now. Please try again shortly or email us directly." }
}
