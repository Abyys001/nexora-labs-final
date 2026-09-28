import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const bodySchema = z
  .object({
    mode: z.enum(["accept", "adjust", "manual"]),
    amountGbp: z.number().int().positive().optional(),
    deltaGbp: z.number().int().optional(),
    reason: z.string().trim().min(1).max(2000),
  })
  .strict()

export async function POST(request: NextRequest, ctx: RouteContext<"/api/admin/enquiries/[id]/final-price">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Enquiry not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid final price" } }, { status: 400 })
  return relay(await adminApi(`/admin/enquiries/${id}/final-price`, { method: "POST", body: JSON.stringify(parsed.data) }))
}
