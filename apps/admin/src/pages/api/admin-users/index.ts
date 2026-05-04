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

export const GET: APIRoute = async () => {
  const { data, error } = await getClient()
    .from("admin_users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "admin";

  if (!email || !password)
    return json({ error: "email and password are required" }, 400);
  if (password.length < 8)
    return json({ error: "password must be at least 8 characters" }, 400);
  if (!["admin"].includes(role)) return json({ error: "invalid role" }, 400);

  const password_hash = await bcrypt.hash(password, 8);
  const { data, error } = await getClient()
    .from("admin_users")
    .insert({ email, password_hash, role })
    .select("id, email, role, created_at")
    .single();

  if (error) {
    if (error.code === "23505")
      return json({ error: "email already exists" }, 409);
    return json({ error: error.message }, 500);
  }
  return json(data, 201);
};
