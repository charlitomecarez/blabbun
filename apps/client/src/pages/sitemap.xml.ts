import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, "") ?? "https://blabbun.com";

  const posts = await getCollection("posts", ({ data }) => !data.draft);

  const staticPaths = [
    "/",
    "/archive",
    "/topics",
    "/about",
    "/help",
    "/terms",
    "/privacy",
  ];

  const allUrls = [
    ...staticPaths.map((path) => `${siteUrl}${path}`),
    ...posts.map((post) => `${siteUrl}/${post.id}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
