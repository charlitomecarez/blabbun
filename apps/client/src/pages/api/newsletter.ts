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

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { email?: string };

  if (!body.email?.trim() || !isValidEmail(body.email)) {
    return json({ error: "Valid email is required" }, 400);
  }

  const supabase = getClient();
  const { data, error } = await supabase
    .from("subscribers")
    .insert({ email: body.email.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return json({ error: "Email already subscribed" }, 409);
    }
    return json({ error: error.message }, 500);
  }

  return json(data, 201);
};
