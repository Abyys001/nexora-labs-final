import { NextResponse, type NextRequest } from "next/server"

import { projectBodySchema } from "@/lib/server/admin-schemas"
import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

export async function GET() {
  return relay(await adminApi("/admin/projects"))
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const parsed = projectBodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid project" } }, { status: 400 })
  return relay(await adminApi("/admin/projects", { method: "POST", body: JSON.stringify(parsed.data) }))
}
