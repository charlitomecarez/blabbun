import type { APIRoute } from "astro";

import { getRuntimeEnv, jsonResponse } from "@/lib/api";
import { getResendClient, issueReportEmailHtml } from "@/lib/emails";

export const prerender = false;

const RECIPIENT = "carenzdelarosa@gmail.com";
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB each

export const POST: APIRoute = async ({ request, locals }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: "invalid form data" }, 400);
  }

  const title = formData.get("title")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const url = formData.get("url")?.toString().trim() || null;
  const reporterEmail =
    formData.get("reporter_email")?.toString().trim() || null;
  const imageFiles = (formData.getAll("images") as File[]).filter(
    (f) => f instanceof File && f.size > 0
  );

  if (!title) return jsonResponse({ error: "title is required" }, 400);
  if (!description)
    return jsonResponse({ error: "description is required" }, 400);
  if (title.length > 150) return jsonResponse({ error: "title too long" }, 400);
  if (description.length > 5000)
    return jsonResponse({ error: "description too long" }, 400);
  if (imageFiles.length > MAX_IMAGES)
    return jsonResponse({ error: `max ${MAX_IMAGES} images` }, 400);

  // Convert images to base64 attachments (safe for Cloudflare Workers)
  const attachments: { filename: string; content: string }[] = [];
  for (const file of imageFiles) {
    if (file.size > MAX_IMAGE_BYTES) {
      return jsonResponse(
        { error: `image "${file.name}" exceeds 5 MB limit` },
        400
      );
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    attachments.push({
      filename: file.name || "attachment",
      content: btoa(binary),
    });
  }

  const env = getRuntimeEnv(locals);
  const resend = getResendClient(
    env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY
  );

  try {
    await resend.emails.send({
      from: "Blab Bun <hello@email.blabbun.com>",
      replyTo: reporterEmail ?? "hello@blabbun.com",
      to: RECIPIENT,
      subject: `[issue] ${title}`,
      html: issueReportEmailHtml({
        title,
        description,
        url,
        reporterEmail,
        imageCount: attachments.length,
      }),
      attachments,
    });
  } catch (err) {
    console.error("report email failed:", err);
    return jsonResponse(
      { error: "failed to send report, try again later" },
      500
    );
  }

  return jsonResponse({ ok: true });
};
