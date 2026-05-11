import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { env } from "cloudflare:workers";

import { signToken } from "@/lib/auth";
import { getAppEnv } from "@/lib/env";

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password)
    return json({ error: "email and password are required" }, 400);

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const appEnv = getAppEnv(runtimeEnv);
  const jwtSecret =
    runtimeEnv.JWT_SECRET ?? (import.meta.env.JWT_SECRET as string | undefined);

  if (!jwtSecret) return json({ error: "server misconfigured" }, 500);

  const supabase = createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const DUMMY_HASH =
    "$2b$08$gj3nS5yeObufCruCxiMJ0eAMKTCbV5hdGmOFj62YzCxH3i7gnBRsy";

  const { data: user, error: dbError } = await supabase
    .from("admin_users")
    .select("id, email, role, password_hash")
    .eq("env", appEnv)
    .eq("email", email)
    .maybeSingle();

  if (dbError) return json({ error: "server error" }, 500);

  const passwordMatch = await bcrypt.compare(
    password,
    user?.password_hash ?? DUMMY_HASH
  );

  if (!user || !passwordMatch)
    return json({ error: "invalid credentials" }, 401);

  const token = await signToken(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret
  );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `bb_admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`,
    },
  });
};
