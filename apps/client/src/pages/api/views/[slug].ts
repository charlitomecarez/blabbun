import type { APIRoute } from "astro";

import {
  getAppEnv,
  getRuntimeEnv,
  getSupabaseClient,
  jsonResponse,
} from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const runtimeEnv = getRuntimeEnv(locals);
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("post_views")
    .select("count")
    .eq("env", appEnv)
    .eq("post_slug", slug!)
    .maybeSingle();

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ count: data?.count ?? 0 });
};

export const POST: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const runtimeEnv = getRuntimeEnv(locals);
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase
    .from("post_views")
    .select("count")
    .eq("env", appEnv)
    .eq("post_slug", slug!)
    .maybeSingle();

  const newCount = (existing?.count ?? 0) + 1;

  const { error } = await supabase
    .from("post_views")
    .upsert({ env: appEnv, post_slug: slug!, count: newCount });

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ count: newCount });
};
