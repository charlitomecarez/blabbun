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

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const payload = (await request.json()) as { body?: string };
  const body = payload.body?.trim();
  if (!body) return json({ error: "body is required" }, 400);

  const supabase = getClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("comments") as any)
    .update({ body })
    .eq("id", id!)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  const supabase = getClient();

  const { error } = await supabase.from("comments").delete().eq("id", id!);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
