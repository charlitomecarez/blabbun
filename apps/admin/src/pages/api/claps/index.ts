import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { getAppEnv } from "@/lib/env";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const appEnv = getAppEnv(runtimeEnv);
  const { post_slug, count } = (await request.json()) as {
    post_slug?: string;
    count?: number;
  };
  if (!post_slug?.trim()) return json({ error: "post_slug is required" }, 400);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("post_claps")
    .insert({ env: appEnv, post_slug: post_slug.trim(), count: count ?? 0 })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
};
