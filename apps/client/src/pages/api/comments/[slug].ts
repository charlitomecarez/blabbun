import type { APIRoute } from "astro";

import { getRuntimeEnv, getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_slug", slug!)
    .order("created_at", { ascending: true });

  if (error) return jsonResponse({ error: error.message }, 500);

  // Nest replies under their parent comments in a single pass.
  const rows = data ?? [];
  const topLevel = rows.filter((r) => r.parent_id === null);
  const nested = topLevel.map((comment) => ({
    ...comment,
    replies: rows.filter((r) => r.parent_id === comment.id),
  }));

  return jsonResponse(nested);
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let body: { body?: string; parent_id?: string; anon_name?: string };
  try {
    body = (await request.json()) as {
      body?: string;
      parent_id?: string;
      anon_name?: string;
    };
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (!body.body?.trim()) {
    return jsonResponse({ error: "Comment body is required" }, 400);
  }

  const insert = {
    post_slug: slug!,
    body: body.body.trim(),
    parent_id: body.parent_id ?? null,
    anon_name: body.anon_name ?? null,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(insert)
    .select()
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse(data, 201);
};
