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

export const PUT: APIRoute = async ({ params, request }) => {
  const slug = decodeURIComponent(params.slug!);
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const count = typeof body.count === "number" ? body.count : 0;

  const supabase = getClient();
  const { error } = await supabase
    .from("post_claps")
    .update({ count })
    .eq("post_slug", slug);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

export const DELETE: APIRoute = async ({ params }) => {
  const slug = decodeURIComponent(params.slug!);
  const supabase = getClient();

  const { error } = await supabase
    .from("post_claps")
    .delete()
    .eq("post_slug", slug);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
