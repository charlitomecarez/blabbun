import { createHash } from "node:crypto";

import type { SupabaseClient } from "@blabbun/db";
import { createSupabaseClient } from "@blabbun/db";

/**
 * Returns a Supabase client authenticated with the service role key.
 * Use only in server-side API routes — never expose this key to the browser.
 */
export function getSupabaseClient(): SupabaseClient {
  return createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Serialises data to a JSON Response with the correct Content-Type header.
 * Default status is 200; pass a second argument to override (e.g. 201, 400, 500).
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Returns a SHA-256 hex digest of the client's IP address.
 * Reads the first entry in x-forwarded-for (set by the upstream proxy; Vercel in production).
 * Falls back to "unknown" when the header is absent — prevents server errors
 * while still allowing dedup logic to function (all unknown IPs share one hash).
 */
export function hashIp(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(ip).digest("hex");
}
