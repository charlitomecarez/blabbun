import type { APIRoute } from "astro";

import { getRuntimeEnv, getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

/** Pings Supabase with a lightweight query to prevent connection timeouts on the free tier. */
export const GET: APIRoute = async ({ locals }) => {
  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { error } = await supabase.from("comments").select("id").limit(1);

  if (error) {
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  return jsonResponse({ ok: true });
};
