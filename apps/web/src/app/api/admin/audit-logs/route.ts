import type { NextRequest } from "next/server"

import { adminApi } from "@/lib/server/session"

import { relay } from "@/lib/server/relay"

const allowed = ["entity", "page", "pageSize"]

export async function GET(request: NextRequest) {
  const params = new URLSearchParams()
  for (const key of allowed) {
    const value = request.nextUrl.searchParams.get(key)
    if (value) params.set(key, value)
  }
  return relay(await adminApi(`/admin/audit-logs?${params}`))
}
