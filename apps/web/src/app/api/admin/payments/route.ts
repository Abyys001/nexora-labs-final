import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const bodySchema = z
  .object({
    scheduleItemId: z.uuid(),
    amountGbp: z.number().int().positive(),
    method: z.enum(["bank-transfer", "other"]),
    note: z.string().trim().max(2000).optional(),
  })
  .strict()

export async function GET() {
  return relay(await adminApi("/admin/payments"))
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid payment" } }, { status: 400 })
  return relay(await adminApi("/admin/payments", { method: "POST", body: JSON.stringify(parsed.data) }))
}
