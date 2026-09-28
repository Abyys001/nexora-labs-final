import { NextResponse, type NextRequest } from "next/server"

import { API_URL } from "@/lib/server/api"

/**
 * Streams the proposal PDF for a request. The access token is the only
 * credential — the same one that addresses the customer's request page — so
 * the document is never reachable without the private link.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let res: Response
  try {
    res = await fetch(`${API_URL}/public/requests/${encodeURIComponent(token)}/proposal.pdf`, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    })
  } catch (error) {
    console.error("Proposal PDF unavailable:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: { code: "upstream_unavailable", message: "The proposal could not be generated right now." } }, { status: 503 })
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: { code: res.status === 404 ? "not_found" : "pdf_failed", message: "The proposal could not be generated right now." } },
      { status: res.status === 404 ? 404 : 502 },
    )
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/pdf",
      "content-disposition": res.headers.get("content-disposition") ?? "inline",
      "cache-control": "private, no-store",
    },
  })
}
