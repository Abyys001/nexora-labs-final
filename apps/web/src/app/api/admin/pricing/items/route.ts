import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { idField } from "@/lib/server/admin-schemas"
import { isSameOrigin, relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

const bodySchema = z.object({
  id: idField,
  kind: z.enum(["solution", "feature", "platform", "integration", "ai", "design", "support", "maintenance"]),
  categoryId: idField,
  label: z.string().trim().min(1).max(160),
  blurb: z.string().trim().max(500).default(""),
  icon: z.string().trim().min(1).max(80),
  price: z.number().int().nonnegative(),
  complexity: z.enum(["s", "m", "l", "xl"]),
  recommends: z.array(idField).default([]),
  requires: z.array(idField).default([]),
  addons: z.array(idField).default([]),
  active: z.boolean().default(true),
  sort: z.number().int().default(0),
})

export async function GET() {
  return relay(await adminApi("/admin/pricing/items"))
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cross-origin request rejected" } }, { status: 403 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid pricing item" } }, { status: 400 })
  return relay(await adminApi("/admin/pricing/items", { method: "POST", body: JSON.stringify(parsed.data) }))
}
