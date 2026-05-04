import { Resend } from "resend";

import { unsubscribeUrl } from "@/lib/unsubscribe";

const LOGO_SRC = "https://blabbun.com/blabbun-email.png";
const LOGO_SRC_FULL = "https://blabbun.com/blabbun.png";

// BIMI sender avatar — add this DNS TXT record to show the blab bun logo
// next to the sender name in Apple Mail, Outlook, and (with VMC) Gmail:
//
//   Name:  default._bimi.blabbun.com
//   Type:  TXT
//   Value: v=BIMI1; l=https://blabbun.com/bimi-logo.svg;
//
// Also requires a DMARC policy of p=quarantine or p=reject on blabbun.com.

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

export function welcomeEmailText(
  email: string,
  unsubscribeSecret: string
): string {
  const unsubUrl = unsubscribeUrl(email, unsubscribeSecret);
  return `you're in.

no schedule. no issues.

just an email when something new drops — could be tomorrow. could be never.

read the archive → https://blabbun.com

---
you subscribed at blabbun.com. changed your mind? ${unsubUrl}`;
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
  <!-- Preheader: visible in inbox preview, hidden in email body -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">you're now on the blab bun list. no noise, just new posts.&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
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
              <p style="font-size:0.7rem;color:#c5b8a8;margin:0 0 8px;line-height:1.7">
                📌 <strong style="color:#9c8b78">using gmail?</strong> drag this email to your <strong style="color:#9c8b78">Primary</strong> tab so you don't miss new posts. you only have to do it once.
              </p>
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

export function issueReportEmailHtml(report: {
  title: string;
  description: string;
  url?: string | null;
  reporterEmail?: string | null;
  imageCount?: number;
}): string {
  const { title, description, url, reporterEmail, imageCount = 0 } = report;
  const urlRow = url
    ? `<tr><td style="padding:0 0 14px"><span style="font-size:0.68rem;color:#9c8b78;letter-spacing:0.06em;text-transform:uppercase">page</span><br><a href="${esc(url)}" style="font-size:0.82rem;color:#c4832a;text-decoration:none">${esc(url)}</a></td></tr>`
    : "";
  const fromRow = reporterEmail
    ? `<tr><td style="padding:0 0 14px"><span style="font-size:0.68rem;color:#9c8b78;letter-spacing:0.06em;text-transform:uppercase">from</span><br><span style="font-size:0.82rem;color:#231e17">${esc(reporterEmail)}</span></td></tr>`
    : "";
  const attachNote =
    imageCount > 0
      ? `<p style="font-size:0.72rem;color:#9c8b78;margin:20px 0 0">📎 ${imageCount} image${imageCount !== 1 ? "s" : ""} attached</p>`
      : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[issue] ${esc(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#fdf9f4;font-family:'IBM Plex Mono',monospace;color:#231e17">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf9f4;padding:48px 20px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#f5ede0;border:1px solid #e0d4c0;border-radius:4px;padding:36px">
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #e0d4c0;text-align:center">
              <a href="https://blabbun.com" style="text-decoration:none;display:inline-block">
                <img src="${LOGO_SRC_FULL}" alt="blab bun" width="48" height="48" style="display:block;margin:0 auto 10px;border-radius:6px;object-fit:contain" />
                <span style="font-size:0.95rem;font-weight:500;color:#c4832a;letter-spacing:0.04em">blab bun</span>
              </a>
              <div style="font-size:0.68rem;color:#c5b8a8;margin-top:4px;letter-spacing:0.06em;text-transform:uppercase">issue report</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 0">
              <h1 style="font-size:1.05rem;font-weight:500;color:#231e17;margin:0 0 24px;line-height:1.4">${esc(title)}</h1>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${urlRow}
                ${fromRow}
                <tr>
                  <td style="padding:0 0 8px">
                    <span style="font-size:0.68rem;color:#9c8b78;letter-spacing:0.06em;text-transform:uppercase">description</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px;border-bottom:1px solid #e0d4c0">
                    <p style="font-size:0.83rem;color:#231e17;line-height:1.8;margin:0;white-space:pre-wrap">${esc(description)}</p>
                  </td>
                </tr>
              </table>
              ${attachNote}
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px">
              <p style="font-size:0.7rem;color:#c5b8a8;margin:0">submitted via <a href="https://blabbun.com/help" style="color:#c4832a;text-decoration:none">blabbun.com/help</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function newPostEmailText(
  post: { title: string; slug: string; description: string; date: string },
  email: string,
  unsubscribeSecret: string
): string {
  const url = `https://blabbun.com/${post.slug}`;
  const unsubUrl = unsubscribeUrl(email, unsubscribeSecret);
  return `${post.title}

${post.date}

${post.description}

read it → ${url}

---
you're on the blab bun mailing list. done reading? ${unsubUrl}`;
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
