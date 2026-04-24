import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";

export const prerender = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): any {
  return createSupabaseClient(
    import.meta.env.SUPABASE_URL,
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
  const { post_slug, count } = await request.json();
  if (!post_slug?.trim()) return json({ error: "post_slug is required" }, 400);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("post_claps")
    .insert({ post_slug: post_slug.trim(), count: count ?? 0 })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
};
