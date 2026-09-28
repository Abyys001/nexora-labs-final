import type { NextRequest } from "next/server"

import { adminApi } from "@/lib/server/session"

import { relay } from "@/lib/server/relay"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const params = new URLSearchParams()
  if (code) params.set("code", code)
  return relay(await adminApi(`/admin/currencies/history?${params}`))
}
