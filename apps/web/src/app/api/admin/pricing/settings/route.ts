import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const bodySchema = z
  .object({
    additionalSolutionFactor: z.number().nonnegative(),
    rangeLow: z.number().positive(),
    rangeHigh: z.number().positive(),
    roundTo: z.number().int().positive(),
  })
  .strict()

export async function GET() {
  return relay(await adminApi("/admin/pricing/settings"))
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid settings" } }, { status: 400 })
  return relay(await adminApi("/admin/pricing/settings", { method: "PUT", body: JSON.stringify(parsed.data) }))
}
