"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { API_URL } from "@/lib/server/api"
import { clearSession, setSession } from "@/lib/server/session"

export type LoginState = { error?: string }

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
})

// Only allow redirects back into the admin area to prevent open redirects.
function safeNext(next?: string) {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin"
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Enter a valid email and password." }

  let res: Response
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return { error: "The server is unavailable. Please try again shortly." }
  }
  if (res.status === 401) return { error: "Incorrect email or password." }
  if (res.status === 429) return { error: "Too many attempts. Please wait a minute and try again." }
  if (!res.ok) return { error: "Sign-in failed. Please try again." }

  const body = (await res.json()) as { accessToken: string; expiresIn: number }
  await setSession(body.accessToken, body.expiresIn)
  redirect(safeNext(parsed.data.next))
}

export async function logout() {
  await clearSession()
  redirect("/admin/login")
}
