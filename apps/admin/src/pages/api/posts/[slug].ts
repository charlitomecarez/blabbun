import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { deletePostFile, getPostFile } from "../../../lib/github";

export const prerender = false;

function getToken() {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  return runtimeEnv.GITHUB_TOKEN ?? import.meta.env.GITHUB_TOKEN ?? "";
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;
  const file = await getPostFile(getToken(), slug);

  if (!file) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
    });
  }

  const raw = file.content;
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
      slug,
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

export const DELETE: APIRoute = async ({ params }) => {
  const slug = params.slug!;
  const token = getToken();
  const file = await getPostFile(token, slug);

  if (!file) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
    });
  }

  try {
    await deletePostFile(token, slug, file.sha);
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
