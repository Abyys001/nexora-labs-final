import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const bodySchema = z
  .object({ role: z.enum(["owner", "manager", "viewer"]), name: z.string().trim().min(1).max(160), password: z.string().min(8).max(200) })
  .partial()
  .strict()

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/admins/[id]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Admin not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid update" } }, { status: 400 })
  return relay(await adminApi(`/admin/admins/${id}`, { method: "PATCH", body: JSON.stringify(parsed.data) }))
}
