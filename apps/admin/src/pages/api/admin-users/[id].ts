import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { env } from "cloudflare:workers";

import { getAppEnv } from "@/lib/env";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!id || !UUID_RE.test(id)) return json({ error: "invalid id" }, 400);
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const updates: Partial<{
    email: string;
    role: string;
    password_hash: string;
  }> = {};
  if (typeof body.email === "string" && body.email.trim())
    updates.email = body.email.trim().toLowerCase();
  if (typeof body.role === "string" && body.role.trim()) {
    if (!["admin"].includes(body.role.trim()))
      return json({ error: "invalid role" }, 400);
    updates.role = body.role.trim();
  }
  if (typeof body.password === "string" && body.password) {
    if (body.password.length < 8)
      return json({ error: "password must be at least 8 characters" }, 400);
    updates.password_hash = await bcrypt.hash(body.password, 8);
  }

  if (Object.keys(updates).length === 0)
    return json({ error: "no valid fields to update" }, 400);

  const appEnv = getAppEnv(runtimeEnv);
  const { data, error } = await getClient()
    .from("admin_users")
    .update(updates)
    .eq("env", appEnv)
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
  if (!id || !UUID_RE.test(id)) return json({ error: "invalid id" }, 400);

  if (locals.admin?.id === id)
    return json({ error: "cannot delete your own account" }, 403);

  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getClient();

  const { count } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("env", appEnv);

  if ((count ?? 0) <= 1)
    return json({ error: "cannot delete the last admin" }, 403);

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("env", appEnv)
    .eq("id", id!);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
