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

export const GET: APIRoute = async () => {
  const appEnv = getAppEnv(runtimeEnv);
  const { data, error } = await getClient()
    .from("comments")
    .select("*")
    .eq("env", appEnv)
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const POST: APIRoute = async ({ request }) => {
  const appEnv = getAppEnv(runtimeEnv);
  const { post_slug, body, anon_name, parent_id } = (await request.json()) as {
    post_slug?: string;
    body?: string;
    anon_name?: string;
    parent_id?: string;
  };
  if (!post_slug?.trim() || !body?.trim())
    return json({ error: "post_slug and body are required" }, 400);

  const { data, error } = await getClient()
    .from("comments")
    .insert({
      env: appEnv,
      post_slug: post_slug.trim(),
      body: body.trim(),
      anon_name: anon_name ?? null,
      parent_id: parent_id ?? null,
    })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
};
