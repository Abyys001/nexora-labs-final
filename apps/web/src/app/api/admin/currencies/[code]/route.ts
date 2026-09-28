import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const codeSchema = z.enum(["GBP", "EUR", "USD"])
const roundingSchema = z.union([z.literal("none"), z.literal(1), z.literal(10), z.literal(50), z.literal(100)])
const bodySchema = z
  .object({ enabled: z.boolean(), rate: z.number().positive(), rounding: roundingSchema, source: z.enum(["provider", "manual"]) })
  .partial()

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/admin/currencies/[code]">) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const { code } = await ctx.params
  if (!codeSchema.safeParse(code).success) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Currency not found" } }, { status: 404 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid currency update" } }, { status: 400 })
  return relay(await adminApi(`/admin/currencies/${code}`, { method: "PUT", body: JSON.stringify(parsed.data) }))
}
