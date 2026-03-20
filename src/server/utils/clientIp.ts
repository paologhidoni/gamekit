import type { IncomingHttpHeaders } from "node:http";

/**
 * First address in a forwarded chain (leftmost = original client on typical proxies).
 * Strips IPv6 zone id (e.g. fe80::1%en0) for a stable Redis key segment.
 */
function firstForwardedIp(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  const raw = Array.isArray(value) ? value.join(",") : value;
  const first = raw.split(",")[0]?.trim() ?? "";
  if (!first) return "";
  return first.split("%")[0]!.trim();
}

/**
 * Client IP string for rate limiting. Prefer Vercel's edge header, then standard proxies.
 */
export function getClientIpForRateLimit(headers: IncomingHttpHeaders): string {
  const vercel = firstForwardedIp(headers["x-vercel-forwarded-for"]);
  if (vercel) return vercel;

  const xff = firstForwardedIp(headers["x-forwarded-for"]);
  if (xff) return xff;

  const realIp = firstForwardedIp(headers["x-real-ip"]);
  if (realIp) return realIp;

  return "unknown";
}
