import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { enquiryStatuses } from "@/lib/enquiry"
import { adminApi } from "@/lib/server/session"

import { isSameOrigin, relay } from "@/lib/server/relay"

const idSchema = z.uuid()
const patchSchema = z.object({ status: z.enum(enquiryStatuses).optional(), notes: z.string().max(10_000).optional() }).strict()

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/enquiries/[id]">) {
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Enquiry not found" } }, { status: 404 })
  return relay(await adminApi(`/admin/enquiries/${id}`))
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/enquiries/[id]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Enquiry not found" } }, { status: 404 })
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid update" } }, { status: 400 })
  return relay(await adminApi(`/admin/enquiries/${id}`, { method: "PATCH", body: JSON.stringify(parsed.data) }))
}
