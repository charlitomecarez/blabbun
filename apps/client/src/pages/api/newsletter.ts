import type { APIRoute } from "astro";

import { getSupabaseClient, jsonResponse } from "@/lib/api";
import { getResendClient, welcomeEmailHtml } from "@/lib/emails";

export const prerender = false;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseEmails(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw.map((e) => e.trim()).filter(Boolean);
  return raw
    .split(/[,\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);
}

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { email?: string | string[] };

  if (!body.email) {
    return jsonResponse({ error: "email is required" }, 400);
  }

  const emails = parseEmails(body.email);
  if (!emails.length) {
    return jsonResponse({ error: "at least one email is required" }, 400);
  }

  const invalid = emails.filter((e) => !isValidEmail(e));
  if (invalid.length) {
    return jsonResponse(
      { error: `invalid email(s): ${invalid.join(", ")}` },
      400
    );
  }

  const supabase = getSupabaseClient();
  const resend = getResendClient();

  const results = await Promise.all(
    emails.map(async (email) => {
      const { error } = await supabase
        .from("subscribers")
        .insert({ email })
        .select()
        .single();

      if (error) {
        if (error.code === "23505")
          return { email, status: "already_subscribed" };
        return { email, status: "error", error: error.message };
      }

      // Fire-and-forget — don't block the response on email delivery
      resend.emails
        .send({
          from: "onboarding@resend.dev",
          to: email,
          subject: "you're in.",
          html: welcomeEmailHtml(email),
        })
        .catch(console.error);

      return { email, status: "subscribed" };
    })
  );

  const hasSuccess = results.some((r) => r.status === "subscribed");
  return jsonResponse({ results }, hasSuccess ? 201 : 409);
};
