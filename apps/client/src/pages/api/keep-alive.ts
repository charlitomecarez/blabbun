import type { APIRoute } from "astro";

import { getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

/** Pings Supabase with a lightweight query to prevent connection timeouts on the free tier. */
export const GET: APIRoute = async () => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("comments").select("id").limit(1);

  if (error) {
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  return jsonResponse({ ok: true });
};
