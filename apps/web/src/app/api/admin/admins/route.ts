import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const bodySchema = z
  .object({
    email: z.email().max(254),
    name: z.string().trim().min(1).max(160),
    role: z.enum(["owner", "manager", "viewer"]),
    password: z.string().min(8).max(200),
  })
  .strict()

export async function GET() {
  return relay(await adminApi("/admin/admins"))
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid admin" } }, { status: 400 })
  return relay(await adminApi("/admin/admins", { method: "POST", body: JSON.stringify(parsed.data) }))
}
