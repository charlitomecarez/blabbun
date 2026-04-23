import type { CommentRow } from "@blabbun/db";
import { createSupabaseClient } from "@blabbun/db";
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
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);

  const rows: CommentRow[] = data ?? [];
  const topLevel = rows.filter((c) => c.parent_id === null);
  const replies = rows.filter((c) => c.parent_id !== null);

  const tree = topLevel.map((comment) => ({
    ...comment,
    replies: replies
      .filter((r) => r.parent_id === comment.id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
  }));

  return json(tree);
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const body = (await request.json()) as { body?: string; parent_id?: string };

  if (!body.body?.trim()) {
    return json({ error: "Comment body is required" }, 400);
  }

  const insert: Partial<CommentRow> = {
    post_slug: slug!,
    body: body.body.trim(),
    parent_id: body.parent_id ?? null,
  };

  const supabase = getClient();
  const { data, error } = await supabase
    .from("comments")
    .insert(insert)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);

  return json(data, 201);
};
