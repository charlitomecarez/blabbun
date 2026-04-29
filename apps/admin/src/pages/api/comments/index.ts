import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

function getClient() {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
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
  const { post_slug, body, anon_name, parent_id } = await request.json();
  if (!post_slug?.trim() || !body?.trim())
    return json({ error: "post_slug and body are required" }, 400);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_slug: post_slug.trim(),
      body: body.trim(),
      anon_name: anon_name?.trim() || null,
      parent_id: parent_id || null,
    })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
};
