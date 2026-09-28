import "server-only"

import { cookies } from "next/headers"

import { API_URL } from "./api"

export const SESSION_COOKIE = "nx_admin"

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value
}

export async function setSession(token: string, maxAgeSeconds: number) {
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  })
}

export async function clearSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

/** Calls the API as the signed-in admin; returns 401 without calling out when there is no session. */
export async function adminApi(path: string, init: RequestInit = {}) {
  const token = await getSessionToken()
  if (!token) return new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Not signed in" } }), { status: 401 })
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${token}`, "content-type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })
}
