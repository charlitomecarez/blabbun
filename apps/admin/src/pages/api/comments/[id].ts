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

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  const supabase = getClient();

  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("*")
    .eq("id", id!)
    .single();

  if (fetchError) {
    return json({ error: "Comment not found" }, 404);
  }

  if (!comment) {
    return json({ error: "Comment not found" }, 404);
  }

  const { error: deleteError } = await supabase
    .from("comments")
    .delete()
    .eq("id", id!);

  if (deleteError) {
    return json({ error: deleteError.message }, 500);
  }

  return json({ success: true, message: "Comment deleted" });
};
