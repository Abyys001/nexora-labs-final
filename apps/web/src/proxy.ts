import { NextResponse, type NextRequest } from "next/server"

// Optimistic gate only: the API verifies the token on every admin request.
export function proxy(request: NextRequest) {
  if (request.cookies.has("nx_admin")) return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = "/admin/login"
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
}
