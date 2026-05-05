import { Resend } from "resend";

import { unsubscribeUrl } from "@/lib/unsubscribe";

const LOGO_SRC = "https://blabbun.com/blabbun-logo.webp";
const LOGO_SRC_FULL = "https://blabbun.com/blabbun-logo.webp";

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
  <meta name="color-scheme" content="dark">
  <title>you're in.</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#16120e;font-family:'IBM Plex Mono',monospace;color:#e6ddd1">
  <!-- Preheader: visible in inbox preview, hidden in email body -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">you're now on the blab bun list. no noise, just new posts.&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#16120e;padding:48px 20px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#1f1a14;border:1px solid #2c241c;border-radius:4px;padding:36px">
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #2c241c">
              <a href="https://blabbun.com" style="text-decoration:none">
                <img src="${LOGO_SRC}" alt="" width="22" height="22" style="display:inline-block;vertical-align:middle;border-radius:3px;margin-right:8px" />
                <span style="font-size:0.95rem;font-weight:500;color:#d4a040;letter-spacing:0.04em;vertical-align:middle">blab bun</span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 28px">
              <h1 style="font-size:1.4rem;font-family:'Fraunces',Georgia,serif;font-weight:400;font-style:italic;color:#e6ddd1;margin:0 0 14px;line-height:1.2">you're in.</h1>
              <p style="font-size:0.82rem;color:#7a6e60;line-height:1.75;margin:0 0 8px">
                no schedule. no issues.
              </p>
              <p style="font-size:0.82rem;color:#7a6e60;line-height:1.75;margin:0 0 28px">
                just an email when something new drops — could be tomorrow. could be never.
              </p>
              <a href="https://blabbun.com" style="display:inline-block;background:#d4a040;color:#16120e;font-size:0.78rem;font-family:'IBM Plex Mono',monospace;padding:10px 22px;border-radius:3px;text-decoration:none;letter-spacing:0.02em">read the archive →</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;border-top:1px solid #2c241c">
              <p style="font-size:0.7rem;color:#4a4038;margin:0 0 8px;line-height:1.7">
                📌 <strong style="color:#7a6e60">using gmail?</strong> drag this email to your <strong style="color:#7a6e60">Primary</strong> tab so you don't miss new posts. you only have to do it once.
              </p>
              <p style="font-size:0.7rem;color:#4a4038;margin:0;line-height:1.7">
                you subscribed at <a href="https://blabbun.com" style="color:#d4a040;text-decoration:none">blabbun.com</a>.
                changed your mind? <a href="${unsubUrl}" style="color:#d4a040;text-decoration:none">unsubscribe</a>.
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
    ? `<tr><td style="padding:0 0 14px"><span style="font-size:0.68rem;color:#7a6e60;letter-spacing:0.06em;text-transform:uppercase">page</span><br><a href="${esc(url)}" style="font-size:0.82rem;color:#d4a040;text-decoration:none">${esc(url)}</a></td></tr>`
    : "";
  const fromRow = reporterEmail
    ? `<tr><td style="padding:0 0 14px"><span style="font-size:0.68rem;color:#7a6e60;letter-spacing:0.06em;text-transform:uppercase">from</span><br><span style="font-size:0.82rem;color:#e6ddd1">${esc(reporterEmail)}</span></td></tr>`
    : "";
  const attachNote =
    imageCount > 0
      ? `<p style="font-size:0.72rem;color:#7a6e60;margin:20px 0 0">📎 ${imageCount} image${imageCount !== 1 ? "s" : ""} attached</p>`
      : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>[issue] ${esc(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#16120e;font-family:'IBM Plex Mono',monospace;color:#e6ddd1">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#16120e;padding:48px 20px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#1f1a14;border:1px solid #2c241c;border-radius:4px;padding:36px">
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #2c241c;text-align:center">
              <a href="https://blabbun.com" style="text-decoration:none;display:inline-block">
                <img src="${LOGO_SRC_FULL}" alt="blab bun" width="48" height="48" style="display:block;margin:0 auto 10px;border-radius:6px;object-fit:contain" />
                <span style="font-size:0.95rem;font-weight:500;color:#d4a040;letter-spacing:0.04em">blab bun</span>
              </a>
              <div style="font-size:0.68rem;color:#4a4038;margin-top:4px;letter-spacing:0.06em;text-transform:uppercase">issue report</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 0">
              <h1 style="font-size:1.3rem;font-family:'Fraunces',Georgia,serif;font-weight:400;color:#e6ddd1;margin:0 0 24px;line-height:1.3">${esc(title)}</h1>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${urlRow}
                ${fromRow}
                <tr>
                  <td style="padding:0 0 8px">
                    <span style="font-size:0.68rem;color:#7a6e60;letter-spacing:0.06em;text-transform:uppercase">description</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px;border-bottom:1px solid #2c241c">
                    <p style="font-size:0.83rem;color:#e6ddd1;line-height:1.8;margin:0;white-space:pre-wrap">${esc(description)}</p>
                  </td>
                </tr>
              </table>
              ${attachNote}
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px">
              <p style="font-size:0.7rem;color:#4a4038;margin:0">submitted via <a href="https://blabbun.com/help" style="color:#d4a040;text-decoration:none">blabbun.com/help</a></p>
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
              <img src="${esc(post.image)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:220px;object-fit:cover;border-bottom:1px solid #2c241c" />
            </td>
          </tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>${esc(post.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#16120e;font-family:'IBM Plex Mono',monospace;color:#e6ddd1">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#16120e;padding:48px 20px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#1f1a14;border:1px solid #2c241c;border-radius:4px;overflow:hidden">
          <tr>
            <td style="padding:28px 36px 24px;border-bottom:1px solid #2c241c">
              <a href="https://blabbun.com" style="text-decoration:none">
                <img src="${LOGO_SRC}" alt="" width="22" height="22" style="display:inline-block;vertical-align:middle;border-radius:3px;margin-right:8px" />
                <span style="font-size:0.95rem;font-weight:500;color:#d4a040;letter-spacing:0.04em;vertical-align:middle">blab bun</span>
              </a>
              <span style="font-size:0.72rem;color:#4a4038;margin-left:10px">new post</span>
            </td>
          </tr>
          ${imageRow}
          <tr>
            <td style="padding:32px 36px 28px">
              <div style="font-size:0.68rem;color:#7a6e60;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">${esc(post.date)}</div>
              <h1 style="font-size:1.5rem;font-family:'Fraunces',Georgia,serif;font-weight:400;color:#e6ddd1;margin:0 0 16px;line-height:1.2;letter-spacing:-0.02em">
                <a href="${url}" style="color:#e6ddd1;text-decoration:none">${esc(post.title)}</a>
              </h1>
              <p style="font-size:0.83rem;color:#7a6e60;line-height:1.75;margin:0 0 28px">${esc(post.description)}</p>
              <a href="${url}" style="display:inline-block;background:#d4a040;color:#16120e;font-size:0.78rem;font-family:'IBM Plex Mono',monospace;padding:10px 22px;border-radius:3px;text-decoration:none;letter-spacing:0.02em">read it →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 28px;border-top:1px solid #2c241c;padding-top:24px">
              <p style="font-size:0.7rem;color:#4a4038;margin:0;line-height:1.7">
                you're on the <a href="https://blabbun.com" style="color:#d4a040;text-decoration:none">blab bun</a> mailing list.
                done reading? <a href="${unsubUrl}" style="color:#d4a040;text-decoration:none">unsubscribe</a>.
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
