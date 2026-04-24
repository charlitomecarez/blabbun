import type { APIRoute } from "astro";

import { getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

/** Basic email format check — full validation happens at the DB constraint level. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { email?: string };

  if (!body.email?.trim() || !isValidEmail(body.email)) {
    return jsonResponse({ error: "Valid email is required" }, 400);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscribers")
    .insert({ email: body.email.trim() })
    .select()
    .single();

  if (error) {
    // Postgres unique-violation code — email already in the subscribers table.
    if (error.code === "23505") {
      return jsonResponse({ error: "Email already subscribed" }, 409);
    }
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse(data, 201);
};
