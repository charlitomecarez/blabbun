import type { APIRoute } from "astro";

import { getRuntimeEnv, getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("post_views")
    .select("count")
    .eq("post_slug", slug!)
    .maybeSingle();

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ count: data?.count ?? 0 });
};

export const POST: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase
    .from("post_views")
    .select("count")
    .eq("post_slug", slug!)
    .maybeSingle();

  const newCount = (existing?.count ?? 0) + 1;

  const { error } = await supabase
    .from("post_views")
    .upsert({ post_slug: slug!, count: newCount });

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ count: newCount });
};
