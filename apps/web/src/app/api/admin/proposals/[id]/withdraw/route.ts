import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()

export async function POST(request: NextRequest, ctx: RouteContext<"/api/admin/proposals/[id]/withdraw">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Proposal not found" } }, { status: 404 })
  return relay(await adminApi(`/admin/proposals/${id}/withdraw`, { method: "POST" }))
}
