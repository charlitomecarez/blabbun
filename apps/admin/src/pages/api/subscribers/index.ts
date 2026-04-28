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

export const POST: APIRoute = async ({ request, locals }) => {
  const { email } = await request.json();
  if (!email?.trim()) return json({ error: "email is required" }, 400);

  const supabase = getClient(locals);
  const { data, error } = await supabase
    .from("subscribers")
    .insert({ email: email.trim() })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
};
