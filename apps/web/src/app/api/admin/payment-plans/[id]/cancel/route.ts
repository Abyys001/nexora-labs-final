import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const bodySchema = z.object({ reason: z.string().trim().min(1).max(2000) }).strict()

export async function POST(request: NextRequest, ctx: RouteContext<"/api/admin/payment-plans/[id]/cancel">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Payment plan not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "A reason is required" } }, { status: 400 })
  return relay(await adminApi(`/admin/payment-plans/${id}/cancel`, { method: "POST", body: JSON.stringify(parsed.data) }))
}
