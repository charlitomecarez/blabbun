import type { APIRoute } from "astro";

import { getRuntimeEnv, getSupabaseClient, jsonResponse } from "@/lib/api";
import {
  getResendClient,
  welcomeEmailHtml,
  welcomeEmailText,
} from "@/lib/emails";

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

export const POST: APIRoute = async ({ request, locals }) => {
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

  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const resend = getResendClient(
    env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY
  );
  const unsubscribeSecret =
    env.UNSUBSCRIBE_SECRET ?? import.meta.env.UNSUBSCRIBE_SECRET ?? "";

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

      try {
        await resend.emails.send({
          from: "Blab Bun <hello@email.blabbun.com>",
          replyTo: "hello@blabbun.com",
          to: email,
          subject: "you're in.",
          html: welcomeEmailHtml(email, unsubscribeSecret),
          text: welcomeEmailText(email, unsubscribeSecret),
        });
      } catch (err) {
        console.error("resend welcome email failed:", err);
      }

      return { email, status: "subscribed" };
    })
  );

  const hasSuccess = results.some((r) => r.status === "subscribed");
  return jsonResponse({ results }, hasSuccess ? 201 : 409);
};
