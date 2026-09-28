import "server-only"

import { NextResponse, type NextRequest } from "next/server"

import { clearSession } from "@/lib/server/session"

/** Relays an API response to the browser, dropping the session when the token is rejected. */
export async function relay(res: Response) {
  if (res.status === 401) await clearSession()
  const body = await res.text()
  return new NextResponse(body || null, { status: res.status, headers: { "content-type": "application/json" } })
}

/** Relays a binary API response (e.g. the proposal PDF) without decoding it as text. */
export async function relayBinary(res: Response) {
  if (res.status === 401) await clearSession()
  if (!res.ok) return relay(res)
  return new NextResponse(res.body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": res.headers.get("content-disposition") ?? "inline",
    },
  })
}

/** Rejects cross-site mutation attempts in addition to the SameSite=strict cookie. */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  return !origin || origin === request.nextUrl.origin
}
