import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { dateStringSchema, proposalContentSchema } from "@/lib/server/admin-schemas"
import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const bodySchema = z.object({ content: proposalContentSchema, validUntil: dateStringSchema.optional() }).strict()

export async function POST(request: NextRequest, ctx: RouteContext<"/api/admin/enquiries/[id]/proposals">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Enquiry not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid proposal" } }, { status: 400 })
  return relay(await adminApi(`/admin/enquiries/${id}/proposals`, { method: "POST", body: JSON.stringify(parsed.data) }))
}
