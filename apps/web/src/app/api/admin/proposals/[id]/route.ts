import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { dateStringSchema, proposalContentSchema } from "@/lib/server/admin-schemas"
import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const patchSchema = z.object({ content: proposalContentSchema.optional(), validUntil: dateStringSchema.optional() }).strict()

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/proposals/[id]">) {
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Proposal not found" } }, { status: 404 })
  return relay(await adminApi(`/admin/proposals/${id}`))
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/proposals/[id]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Proposal not found" } }, { status: 404 })
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid update" } }, { status: 400 })
  return relay(await adminApi(`/admin/proposals/${id}`, { method: "PATCH", body: JSON.stringify(parsed.data) }))
}
