"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { createProjectRequestSchema, type CreateProjectRequestInput } from "@/lib/project-request"
import { API_URL, readApiError } from "@/lib/server/api"

export type SubmitResult = {
  reference: string
  accessToken: string
  currency: string
  exchangeRate: number
  amountInCurrency: number
}

export type ProjectRequestState =
  | { status: "idle" }
  | { status: "success"; result: SubmitResult }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }

/**
 * Submits a configured project to the API. The API is the only authority on
 * price — it recomputes the estimate from the persisted catalogue and returns
 * the reference plus the private access token for the customer's request page.
 */
export async function submitProjectRequest(input: CreateProjectRequestInput): Promise<ProjectRequestState> {
  const parsed = createProjectRequestSchema.safeParse(input)
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error)
    return {
      status: "error",
      message: "Some details need checking before we can send this.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    }
  }

  const h = await headers()
  const forwardedFor = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? ""

  let res: Response
  try {
    res = await fetch(`${API_URL}/project-requests`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        "user-agent": h.get("user-agent") ?? "",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError"
    console.error("Project request API unreachable:", error instanceof Error ? error.message : error)
    return {
      status: "error",
      message: timedOut
        ? "The request took too long to send. Your configuration is saved — please try again."
        : "We couldn't reach our servers just now. Your configuration is saved in this browser — please try again in a moment.",
    }
  }

  if (res.ok) {
    const result = (await res.json()) as SubmitResult
    return { status: "success", result }
  }

  const err = await readApiError(res)
  if (res.status === 429) {
    return { status: "error", message: "That's a few submissions in a row. Please wait a minute and try again." }
  }
  if (res.status === 400 || res.status === 422) {
    return {
      status: "error",
      message: err?.message ?? "Some details need checking before we can send this.",
      fieldErrors: err?.details?.fieldErrors,
    }
  }
  console.error("Project request API responded with", res.status, err?.code ?? "", err?.message ?? "")
  return {
    status: "error",
    message: "Something went wrong on our side while saving your project. Nothing was lost — please try again, or call us on 020 7046 6615.",
  }
}

export type PaymentPlanState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string }

/** Customer-chosen payment plan for a submitted request, addressed by its access token. */
export async function choosePaymentPlan(token: string, plan: string, secondDueDate?: string): Promise<PaymentPlanState> {
  try {
    const res = await fetch(`${API_URL}/public/requests/${encodeURIComponent(token)}/payment-plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, ...(secondDueDate ? { secondDueDate } : {}) }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
    if (res.ok) return { status: "success" }

    const err = await readApiError(res)
    if (res.status === 404) return { status: "error", message: "We couldn't find this request. Please use the link from your confirmation email." }
    if (res.status === 409) return { status: "error", message: err?.message ?? "A payment plan has already been set for this proposal." }
    if (res.status === 400 || res.status === 422) {
      return { status: "error", message: err?.message ?? "That payment date doesn't fit the project timeline. Please choose another." }
    }
    console.error("Payment plan API responded with", res.status, err?.code ?? "")
  } catch (error) {
    console.error("Payment plan API unreachable:", error instanceof Error ? error.message : error)
  }
  return { status: "error", message: "We couldn't save your payment plan just now. Please try again shortly." }
}
