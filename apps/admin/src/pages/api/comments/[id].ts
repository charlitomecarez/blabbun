import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { getAppEnv } from "@/lib/env";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
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
  const appEnv = getAppEnv(runtimeEnv);
  const payload = (await request.json()) as { body?: string };
  const body = payload.body?.trim();
  if (!body) return json({ error: "body is required" }, 400);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ body })
    .eq("env", appEnv)
    .eq("id", id!)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("env", appEnv)
    .eq("id", id!);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
