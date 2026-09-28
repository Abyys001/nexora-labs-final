import { NextResponse, type NextRequest } from "next/server"

import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  return relay(await adminApi("/admin/currencies/refresh", { method: "POST" }))
}
