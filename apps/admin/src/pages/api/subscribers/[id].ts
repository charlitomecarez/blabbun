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

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const payload = (await request.json()) as { email?: string };
  const email = payload.email?.trim();
  if (!email) return json({ error: "email is required" }, 400);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("subscribers")
    .update({ email })
    .eq("id", id!)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  const supabase = getClient();

  const { error } = await supabase.from("subscribers").delete().eq("id", id!);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
