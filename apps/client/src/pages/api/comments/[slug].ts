import type { CommentRow } from "@thelunan/db";
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
    .from("comments")
    .select("*")
    .eq("post_slug", slug!)
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);

  const rows = data ?? [];
  const topLevel = rows.filter((r) => r.parent_id === null);
  const nested = topLevel.map((comment) => ({
    ...comment,
    replies: rows.filter((r) => r.parent_id === comment.id),
  }));

  return json(nested);
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const supabase = getClient();

  let body: { body?: string; parent_id?: string };
  try {
    body = (await request.json()) as { body?: string; parent_id?: string };
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body.body?.trim()) {
    return json({ error: "Comment body is required" }, 400);
  }

  const insert: Partial<CommentRow> = {
    post_slug: slug!,
    body: body.body.trim(),
    parent_id: body.parent_id ?? null,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(insert)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);

  return json(data, 201);
};
