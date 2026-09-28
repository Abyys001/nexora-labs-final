import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { projectBodySchema } from "@/lib/server/admin-schemas"
import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()
const patchSchema = projectBodySchema.partial()

const notFound = () => NextResponse.json({ error: { code: "NOT_FOUND", message: "Project not found" } }, { status: 404 })
const crossOrigin = () => NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/projects/[id]">) {
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return notFound()
  return relay(await adminApi(`/admin/projects/${id}`))
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/projects/[id]">) {
  if (!isSameOrigin(request)) return crossOrigin()
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return notFound()
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid project" } }, { status: 400 })
  return relay(await adminApi(`/admin/projects/${id}`, { method: "PATCH", body: JSON.stringify(parsed.data) }))
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/admin/projects/[id]">) {
  if (!isSameOrigin(request)) return crossOrigin()
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return notFound()
  return relay(await adminApi(`/admin/projects/${id}`, { method: "DELETE" }))
}
