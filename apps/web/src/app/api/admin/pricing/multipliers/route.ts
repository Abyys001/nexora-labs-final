import { relay } from "@/lib/server/relay"
import { adminApi } from "@/lib/server/session"

export async function GET() {
  return relay(await adminApi("/admin/pricing/multipliers"))
}
