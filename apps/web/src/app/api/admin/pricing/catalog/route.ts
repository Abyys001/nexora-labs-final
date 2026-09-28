import { adminApi } from "@/lib/server/session"

import { relay } from "@/lib/server/relay"

/** Admin listing reuses the public catalogue endpoint (includes inactive items, unlike the storefront). */
export async function GET() {
  return relay(await adminApi("/public/pricing"))
}
