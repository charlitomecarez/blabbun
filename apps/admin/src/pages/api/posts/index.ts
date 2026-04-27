import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { APIRoute } from "astro";

// index.ts is at apps/admin/src/pages/api/posts/ — 5 levels up reaches apps/
const POSTS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../client/src/content/posts"
);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildMdx(data: {
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  draft: boolean;
  image?: string;
  imageSource?: string;
  imageSourceUrl?: string;
  body: string;
}): string {
  const q = (s: string) => `"${s.replace(/"/g, '\\"')}"`;
  const lines = ["---"];
  lines.push(`title: ${q(data.title)}`);
  lines.push(`description: ${q(data.description)}`);
  lines.push(`pubDate: ${data.pubDate}`);
  lines.push(`tags: [${data.tags.map((t) => q(t.trim())).join(", ")}]`);
  if (data.draft) lines.push(`draft: true`);
  if (data.image) lines.push(`image: ${q(data.image)}`);
  if (data.imageSource) lines.push(`imageSource: ${q(data.imageSource)}`);
  if (data.imageSourceUrl)
    lines.push(`imageSourceUrl: ${q(data.imageSourceUrl)}`);
  lines.push("---", "", data.body.trim(), "");
  return lines.join("\n");
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON" }), {
      status: 400,
    });
  }

  const {
    title,
    description,
    pubDate,
    image,
    imageSource,
    imageSourceUrl,
    content,
  } = body;
  const tags = body.tags
    ? body.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const draft = body.draft === "true";
  const slug = body.slug?.trim() || slugify(title ?? "");

  if (!title || !description || !pubDate || !slug) {
    return new Response(
      JSON.stringify({ error: "title, description, pubDate are required" }),
      { status: 400 }
    );
  }

  const filePath = join(POSTS_DIR, `${slug}.mdx`);

  if (!body.overwrite && existsSync(filePath)) {
    return new Response(
      JSON.stringify({ error: `slug "${slug}" already exists` }),
      { status: 409 }
    );
  }

  const mdx = buildMdx({
    title,
    description,
    pubDate,
    tags,
    draft,
    image,
    imageSource,
    imageSourceUrl,
    body: content ?? "",
  });

  writeFileSync(filePath, mdx, "utf-8");
  return new Response(JSON.stringify({ ok: true, slug }), { status: 200 });
};
