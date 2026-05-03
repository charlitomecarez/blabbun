import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
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
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, string> = {};
  if (typeof body.email === "string" && body.email.trim())
    updates.email = body.email.trim().toLowerCase();
  if (typeof body.role === "string" && body.role.trim())
    updates.role = body.role.trim();
  if (typeof body.password === "string" && body.password)
    updates.password_hash = await bcrypt.hash(body.password, 8);

  if (Object.keys(updates).length === 0)
    return json({ error: "no valid fields to update" }, 400);

  const { data, error } = await getClient()
    .from("admin_users")
    .update(updates)
    .eq("id", id!)
    .select("id, email, role, created_at")
    .single();

  if (error) {
    if (error.code === "23505")
      return json({ error: "email already exists" }, 409);
    return json({ error: error.message }, 500);
  }
  return json(data);
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;

  if (locals.admin?.id === id)
    return json({ error: "cannot delete your own account" }, 403);

  const supabase = getClient();

  const { count } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) <= 1)
    return json({ error: "cannot delete the last admin" }, 403);

  const { error } = await supabase.from("admin_users").delete().eq("id", id!);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
