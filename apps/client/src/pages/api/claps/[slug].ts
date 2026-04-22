import { createSupabaseClient } from "@thelunan/db";
import type { APIRoute } from "astro";

export const prerender = false;

function getClient() {
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

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  const supabase = getClient();

  const { data, error } = await supabase
    .from("post_claps")
    .select("count")
    .eq("post_slug", slug!)
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);

  return json({ count: data?.count ?? 0 });
};

export const POST: APIRoute = async ({ params }) => {
  const { slug } = params;
  const supabase = getClient();

  const { data: existing } = await supabase
    .from("post_claps")
    .select("count")
    .eq("post_slug", slug!)
    .maybeSingle();

  const newCount = (existing?.count ?? 0) + 1;

  const { data, error } = await supabase
    .from("post_claps")
    .upsert({ post_slug: slug!, count: newCount })
    .select("count")
    .single();

  if (error) return json({ error: error.message }, 500);

  return json({ count: data.count });
};
