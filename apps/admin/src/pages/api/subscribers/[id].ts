import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";

export const prerender = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(locals: App.Locals): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (locals as any).runtime?.env ?? {};
  return createSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  const payload = (await request.json()) as { email?: string };
  const email = payload.email?.trim();
  if (!email) return json({ error: "email is required" }, 400);

  const supabase = getClient(locals);
  const { data, error } = await supabase
    .from("subscribers")
    .update({ email })
    .eq("id", id!)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  const supabase = getClient(locals);

  const { error } = await supabase.from("subscribers").delete().eq("id", id!);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
