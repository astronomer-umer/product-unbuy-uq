import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  // In production behind a proxy, set the right headers in your proxy.
  // Next 16 surfaces the client IP via these standard headers.
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return h.get("x-real-ip") ?? "unknown";
}