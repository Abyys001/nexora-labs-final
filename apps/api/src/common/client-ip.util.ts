import type { Request } from "express";

/**
 * The API is internal-only (no published port, see docker-compose.yml) — it is
 * never reached directly by the public internet, so a generic X-Forwarded-For
 * read would trust whatever the caller sends. Only the web app's own
 * `x-client-ip` header (set server-side from the real visitor IP) is trusted;
 * `req.ip` is the fallback for direct/local calls (e.g. tests, curl).
 */
export function getClientIp(req: Request): string | undefined {
  const header = req.headers["x-client-ip"];
  const value = Array.isArray(header) ? header[0] : header;
  return value?.trim() || req.ip;
}
