import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { Resend } from "resend";

import { getAppEnv } from "@/lib/env";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function newPostEmailHtml(post: {
  title: string;
  slug: string;
  description: string;
  date: string;
}): string {
  const url = `https://blabbun.com/${esc(post.slug)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(post.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#fdf9f4;font-family:'IBM Plex Mono',monospace;color:#231e17">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf9f4;padding:48px 20px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#f5ede0;border:1px solid #e0d4c0;border-radius:4px;padding:36px">
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #e0d4c0">
              <a href="https://blabbun.com" style="font-size:0.95rem;font-weight:500;color:#c4832a;text-decoration:none;letter-spacing:0.04em">blab bun</a>
              <span style="font-size:0.72rem;color:#c5b8a8;margin-left:10px">new post</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 28px">
              <div style="font-size:0.68rem;color:#9c8b78;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">${esc(post.date)}</div>
              <h1 style="font-size:1.2rem;font-weight:500;color:#231e17;margin:0 0 16px;line-height:1.4">
                <a href="${url}" style="color:#231e17;text-decoration:none">${esc(post.title)}</a>
              </h1>
              <p style="font-size:0.83rem;color:#9c8b78;line-height:1.75;margin:0 0 28px">${esc(post.description)}</p>
              <a href="${url}" style="display:inline-block;background:#c4832a;color:#fff;font-size:0.78rem;font-family:'IBM Plex Mono',monospace;padding:10px 22px;border-radius:3px;text-decoration:none;letter-spacing:0.02em">read it →</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;border-top:1px solid #e0d4c0">
              <p style="font-size:0.7rem;color:#c5b8a8;margin:0;line-height:1.7">
                you're on the <a href="https://blabbun.com" style="color:#c4832a;text-decoration:none">blab bun</a> mailing list.
                done reading? <a href="https://blabbun.com/unsubscribe" style="color:#c4832a;text-decoration:none">unsubscribe</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const POST: APIRoute = async ({ request }) => {
  const { title, slug, description, date } = (await request.json()) as {
    title?: string;
    slug?: string;
    description?: string;
    date?: string;
  };

  if (!title?.trim() || !slug?.trim()) {
    return json({ error: "title and slug are required" }, 400);
  }

  const appEnv = getAppEnv(runtimeEnv);
  const supabase = createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const resend = new Resend(
    runtimeEnv.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY
  );

  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email")
    .eq("env", appEnv);

  if (error) return json({ error: error.message }, 500);
  if (!subscribers?.length) return json({ sent: 0 }, 200);

  const postDate =
    date ??
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const html = newPostEmailHtml({
    title,
    slug,
    description: description ?? "",
    date: postDate,
  });

  const postUrl = `https://blabbun.com/${slug}`;
  const textBody = `${title}

${description ?? ""}

read it → ${postUrl}

---
you're on the blab bun mailing list. done reading? https://blabbun.com/unsubscribe`;

  const BATCH = 100;
  let sent = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emails = (subscribers as any[]).map((s) => s.email as string);

  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH);
    const { error: sendError } = await resend.batch.send(
      batch.map((to) => ({
        from: "Blab Bun <noreply@email.blabbun.com>",
        to,
        subject: `new post: ${title}`,
        html,
        text: textBody,
        headers: {
          "List-Unsubscribe":
            "<mailto:noreply@email.blabbun.com?subject=unsubscribe>",
        },
      }))
    );
    if (sendError) return json({ error: sendError.message, sent }, 500);
    sent += batch.length;
  }

  return json({ sent }, 200);
};
