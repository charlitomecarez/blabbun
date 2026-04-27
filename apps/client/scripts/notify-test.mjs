/**
 * Standalone subscriber notification test script.
 * Runs directly against Supabase + Resend — no dev server needed.
 *
 * Usage (from repo root):
 *   node --env-file=apps/client/.env.local apps/client/scripts/notify-test.mjs
 *   node --env-file=apps/client/.env.local apps/client/scripts/notify-test.mjs --send
 *   node --env-file=apps/client/.env.local apps/client/scripts/notify-test.mjs --send --force
 *
 * Flags:
 *   --send   Actually send emails and record in DB (default: dry-run)
 *   --force  Re-send even for already-notified posts (useful for re-testing)
 *   --to     Override recipient (e.g. --to=you@example.com). Sends only to this address.
 */

import { createHmac } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LOGO_SRC = `data:image/png;base64,${readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../public/blabbun-email.png")
).toString("base64")}`;

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, "../src/content/posts");

const args = process.argv.slice(2);
const DRY_RUN = !args.includes("--send");
const FORCE = args.includes("--force");
const TO_OVERRIDE = (() => {
  const flag = args.find((a) => a.startsWith("--to="));
  return flag ? flag.slice(5) : null;
})();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  process.exit(1);
}
if (!DRY_RUN && !RESEND_KEY) {
  console.error("error: RESEND_API_KEY is required when using --send");
  process.exit(1);
}

// ─── Frontmatter parser ───────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const raw = match[1];
  const get = (key) => {
    const m = raw.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : undefined;
  };
  return {
    title: get("title"),
    description: get("description"),
    pubDate: get("pubDate"),
    draft: get("draft") === "true",
    image: get("image"),
  };
}

function readPosts() {
  return readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const slug = basename(file).replace(/\.(mdx?|md)$/, "");
      const content = readFileSync(join(POSTS_DIR, file), "utf-8");
      return { slug, ...parseFrontmatter(content) };
    })
    .filter((p) => p.title && p.pubDate && !p.draft);
}

// ─── Unsubscribe URL ──────────────────────────────────────────────────────────

function unsubscribeUrl(email) {
  if (!UNSUBSCRIBE_SECRET) return "https://blabbun.com/unsubscribe";
  const token = createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(email.toLowerCase())
    .digest("hex");
  return `https://blabbun.com/unsubscribe?${new URLSearchParams({ email, token })}`;
}

// ─── Email HTML (mirrors emails.ts) ──────────────────────────────────────────

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function newPostEmailHtml(post, email) {
  const url = `https://blabbun.com/${esc(post.slug)}`;
  const unsubUrl = esc(unsubscribeUrl(email));
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
              <a href="https://blabbun.com" style="text-decoration:none">
                <img src="${LOGO_SRC}" alt="" width="22" height="22" style="display:inline-block;vertical-align:middle;border-radius:3px;margin-right:8px" />
                <span style="font-size:0.95rem;font-weight:500;color:#c4832a;letter-spacing:0.04em;vertical-align:middle">blab bun</span>
              </a>
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
                done reading? <a href="${unsubUrl}" style="color:#c4832a;text-decoration:none">unsubscribe</a>.
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

// ─── Main ─────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

console.log(`\n🐰 blab bun · notify-subscribers`);
console.log(
  `   mode: ${DRY_RUN ? "dry-run (pass --send to actually send)" : "SEND"}`
);
if (FORCE) console.log("   force: re-sending already-notified posts");
if (TO_OVERRIDE) console.log(`   to: ${TO_OVERRIDE} (override)`);
console.log("");

// 1. Fetch state
const [subscribersResult, notifiedResult] = await Promise.all([
  supabase.from("subscribers").select("email"),
  supabase.from("post_notifications").select("post_slug"),
]);

if (subscribersResult.error) {
  console.error("supabase error:", subscribersResult.error.message);
  process.exit(1);
}

const subscribers = TO_OVERRIDE
  ? [{ email: TO_OVERRIDE }]
  : (subscribersResult.data ?? []);

const notifiedSlugs = new Set(
  notifiedResult.data?.map((r) => r.post_slug) ?? []
);

console.log(
  `subscribers : ${subscribersResult.data?.length ?? 0} total${TO_OVERRIDE ? ` (overridden → ${TO_OVERRIDE})` : ""}`
);
console.log(`notified    : ${notifiedSlugs.size} posts already sent`);

// 2. Find the single most-recent unnotified post
const today = new Date();
const allPosts = readPosts();
const post = allPosts
  .filter(
    (p) => new Date(p.pubDate) <= today && (FORCE || !notifiedSlugs.has(p.slug))
  )
  .sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )[0];

console.log(`posts found : ${allPosts.length} published`);
console.log(
  `to notify   : ${post ? `"${post.title}"` : "none (all already sent)"}\n`
);

if (!post) {
  console.log("nothing to send. publish a new post or use --force to re-send.");
  process.exit(0);
}

if (subscribers.length === 0) {
  console.log("no subscribers yet — nothing to send.");
  process.exit(0);
}

// 3. Preview / send
{
  const date = new Date(post.pubDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  console.log(`── ${post.title}`);
  console.log(`   slug : ${post.slug}`);
  console.log(`   date : ${date}`);
  console.log(`   image: ${post.image ?? "(none)"}`);
  console.log(`   to   : ${subscribers.length} subscriber(s)`);

  if (DRY_RUN) {
    console.log("   (dry-run — skipping send)\n");
  } else {
    const messages = subscribers.map((sub) => ({
      from: "onboarding@resend.dev",
      to: sub.email,
      subject: post.title,
      html: newPostEmailHtml({ ...post, date }, sub.email),
    }));

    // Resend batch limit: 100 per call
    for (let i = 0; i < messages.length; i += 100) {
      const { error } = await resend.batch.send(messages.slice(i, i + 100));
      if (error) {
        console.error(`   resend error: ${error.message}`);
        process.exit(1);
      }
    }

    if (!FORCE) {
      const { error } = await supabase
        .from("post_notifications")
        .insert({ post_slug: post.slug });
      if (error) {
        console.error(`   db error: ${error.message}`);
        process.exit(1);
      }
    }

    console.log(`   ✓ sent\n`);
  }
}

if (!DRY_RUN) {
  console.log(
    `done. notified ${subscribers.length} subscriber(s) about "${post.title}".`
  );
} else {
  console.log(`dry-run complete. run with --send to actually send.`);
}
