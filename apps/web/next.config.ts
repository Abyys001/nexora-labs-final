import path from "node:path"

import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
]

const nextConfig: NextConfig = {
  output: "standalone",
  // Monorepo: trace dependencies from the workspace root so the standalone build is complete.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  // The illustrative case-study pages were replaced by the real portfolio at
  // /work, and the quote form by the Project Builder. Both keep their inbound
  // links and indexed URLs working.
  async redirects() {
    return [
      { source: "/case-studies", destination: "/work", permanent: true },
      { source: "/case-studies/:slug", destination: "/work", permanent: true },
      { source: "/portfolio", destination: "/work", permanent: true },
      { source: "/request-a-quote", destination: "/project-builder", permanent: true },
    ]
  },
}

export default nextConfig
