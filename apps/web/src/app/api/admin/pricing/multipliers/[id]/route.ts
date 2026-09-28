import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const bodySchema = z
  .object({
    label: z.string().trim().min(1).max(160),
    description: z.string().trim().max(500),
    multiplier: z.number().positive(),
    weeks: z.number().int().positive().nullable(),
    sort: z.number().int(),
  })
  .partial()

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/pricing/multipliers/[id]">) {
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Multiplier not found" } }, { status: 404 })
  return relay(await adminApi(`/admin/pricing/multipliers/${id}`))
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/admin/pricing/multipliers/[id]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Multiplier not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid multiplier" } }, { status: 400 })
  return relay(await adminApi(`/admin/pricing/multipliers/${id}`, { method: "PUT", body: JSON.stringify(parsed.data) }))
}
