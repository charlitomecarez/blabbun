import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { APIRoute } from "astro";

export const prerender = false;

// [slug].ts is at apps/admin/src/pages/api/posts/ — 5 levels up reaches apps/
const POSTS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../client/src/content/posts"
);

function filePath(slug: string) {
  return join(POSTS_DIR, `${slug}.mdx`);
}

export const GET: APIRoute = ({ params }) => {
  const path = filePath(params.slug!);
  if (!existsSync(path)) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
    });
  }
  const raw = readFileSync(path, "utf-8");

  // Parse frontmatter
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  const body = fm ? raw.slice(fm[0].length).trim() : raw;
  const meta: Record<string, string> = {};
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      meta[key] = val;
    }
  }

  const tagsMatch = fm?.[1].match(/^tags:\s*\[([^\]]*)\]/m);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean)
    : [];

  return new Response(
    JSON.stringify({
      slug: params.slug,
      title: meta.title ?? "",
      description: meta.description ?? "",
      pubDate: meta.pubDate ?? "",
      tags,
      draft: meta.draft === "true",
      image: meta.image ?? "",
      imageSource: meta.imageSource ?? "",
      imageSourceUrl: meta.imageSourceUrl ?? "",
      body,
    }),
    { status: 200 }
  );
};

export const DELETE: APIRoute = ({ params }) => {
  const path = filePath(params.slug!);
  if (!existsSync(path)) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
    });
  }
  unlinkSync(path);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
