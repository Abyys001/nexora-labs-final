import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const bodySchema = z.object({ label: z.string().trim().min(1).max(160), icon: z.string().trim().min(1).max(80), sort: z.number().int() }).partial()

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/pricing/categories/[id]">) {
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, { status: 404 })
  return relay(await adminApi(`/admin/pricing/categories/${id}`))
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/admin/pricing/categories/[id]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid category" } }, { status: 400 })
  return relay(await adminApi(`/admin/pricing/categories/${id}`, { method: "PUT", body: JSON.stringify(parsed.data) }))
}
