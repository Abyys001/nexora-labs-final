import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { idField } from "@/lib/server/admin-schemas"
import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const bodySchema = z
  .object({
    kind: z.enum(["solution", "feature", "platform", "integration", "ai", "design", "support", "maintenance"]),
    categoryId: idField,
    label: z.string().trim().min(1).max(160),
    blurb: z.string().trim().max(500),
    icon: z.string().trim().min(1).max(80),
    price: z.number().int().nonnegative(),
    complexity: z.enum(["s", "m", "l", "xl"]),
    recommends: z.array(idField),
    requires: z.array(idField),
    addons: z.array(idField),
    active: z.boolean(),
    sort: z.number().int(),
  })
  .partial()

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/pricing/items/[id]">) {
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Pricing item not found" } }, { status: 404 })
  return relay(await adminApi(`/admin/pricing/items/${id}`))
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/admin/pricing/items/[id]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Pricing item not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid pricing item" } }, { status: 400 })
  return relay(await adminApi(`/admin/pricing/items/${id}`, { method: "PUT", body: JSON.stringify(parsed.data) }))
}
