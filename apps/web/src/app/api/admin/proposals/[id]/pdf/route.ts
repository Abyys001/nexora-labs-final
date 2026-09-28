import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { relayBinary } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const idSchema = z.uuid()

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/admin/proposals/[id]/pdf">) {
  const { id } = await ctx.params
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Proposal not found" } }, { status: 404 })
  return relayBinary(await adminApi(`/admin/proposals/${id}/pdf`))
}
