import { adminApi } from "@/lib/server/session"

import { relay } from "@/lib/server/relay"

export async function GET() {
  return relay(await adminApi("/admin/enquiries/stats"))
}
