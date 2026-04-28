import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Resend } from "resend";

import { unsubscribeUrl } from "@/lib/unsubscribe";

// Read once on first import — swap to a hosted URL once you have a domain
const LOGO_SRC = `data:image/png;base64,${readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../public/blabbun-email.png"
  )
).toString("base64")}`;

export function getResendClient(apiKey: string): Resend {
  return new Resend(apiKey);
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function welcomeEmailHtml(
  email: string,
  unsubscribeSecret: string
): string {
  const unsubUrl = esc(unsubscribeUrl(email, unsubscribeSecret));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>you're in.</title>
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
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 28px">
              <h1 style="font-size:1.1rem;font-weight:500;color:#231e17;margin:0 0 14px;line-height:1.4">you're in.</h1>
              <p style="font-size:0.82rem;color:#9c8b78;line-height:1.75;margin:0 0 8px">
                no schedule. no issues.
              </p>
              <p style="font-size:0.82rem;color:#9c8b78;line-height:1.75;margin:0 0 28px">
                just an email when something new drops — could be tomorrow. could be never.
              </p>
              <a href="https://blabbun.com" style="display:inline-block;background:#c4832a;color:#fff;font-size:0.78rem;font-family:'IBM Plex Mono',monospace;padding:10px 22px;border-radius:3px;text-decoration:none;letter-spacing:0.02em">read the archive →</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;border-top:1px solid #e0d4c0">
              <p style="font-size:0.7rem;color:#c5b8a8;margin:0;line-height:1.7">
                you subscribed at <a href="https://blabbun.com" style="color:#c4832a;text-decoration:none">blabbun.com</a>.
                changed your mind? <a href="${unsubUrl}" style="color:#c4832a;text-decoration:none">unsubscribe</a>.
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

export function newPostEmailHtml(
  post: {
    title: string;
    slug: string;
    description: string;
    date: string;
    image?: string;
  },
  email: string,
  unsubscribeSecret: string
): string {
  const url = `https://blabbun.com/${esc(post.slug)}`;
  const unsubUrl = esc(unsubscribeUrl(email, unsubscribeSecret));
  const imageRow = post.image
    ? `<tr>
            <td style="padding:0;margin:0;line-height:0">
              <img src="${esc(post.image)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:220px;object-fit:cover;border-bottom:1px solid #e0d4c0" />
            </td>
          </tr>`
    : "";
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
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#f5ede0;border:1px solid #e0d4c0;border-radius:4px;overflow:hidden">
          <tr>
            <td style="padding:28px 36px 24px;border-bottom:1px solid #e0d4c0">
              <a href="https://blabbun.com" style="text-decoration:none">
                <img src="${LOGO_SRC}" alt="" width="22" height="22" style="display:inline-block;vertical-align:middle;border-radius:3px;margin-right:8px" />
                <span style="font-size:0.95rem;font-weight:500;color:#c4832a;letter-spacing:0.04em;vertical-align:middle">blab bun</span>
              </a>
              <span style="font-size:0.72rem;color:#c5b8a8;margin-left:10px">new post</span>
            </td>
          </tr>
          ${imageRow}
          <tr>
            <td style="padding:32px 36px 28px">
              <div style="font-size:0.68rem;color:#9c8b78;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">${esc(post.date)}</div>
              <h1 style="font-size:1.2rem;font-weight:500;color:#231e17;margin:0 0 16px;line-height:1.4">
                <a href="${url}" style="color:#231e17;text-decoration:none">${esc(post.title)}</a>
              </h1>
              <p style="font-size:0.83rem;color:#9c8b78;line-height:1.75;margin:0 0 28px">${esc(post.description)}</p>
              <a href="${url}" style="display:inline-block;background:#c4832a;color:#fff;font-size:0.78rem;font-family:'IBM Plex Mono',monospace;padding:10px 22px;border-radius:3px;text-decoration:none;letter-spacing:0.02em">read it →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 28px;border-top:1px solid #e0d4c0;padding-top:24px">
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
