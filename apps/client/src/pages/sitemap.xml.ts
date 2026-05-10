import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, "") ?? "https://blabbun.com";

  const posts = await getCollection("posts", ({ data }) => !data.draft);

  const staticPaths = [
    "/",
    "/archive",
    "/topics",
    "/about",
    "/now",
    "/changelog",
    "/saved",
    "/help",
    "/terms",
    "/privacy",
  ];

  const today = new Date().toISOString().split("T")[0];

  const entries = [
    ...staticPaths.map(
      (path) =>
        `  <url><loc>${siteUrl}${path}</loc><lastmod>${today}</lastmod></url>`
    ),
    ...posts.map((post) => {
      const lastmod = (post.data.updatedDate ?? post.data.pubDate)
        .toISOString()
        .split("T")[0];
      return `  <url><loc>${siteUrl}/${post.id}</loc><lastmod>${lastmod}</lastmod></url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
