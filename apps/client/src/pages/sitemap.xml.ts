import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, "") ?? "https://blabbun.com";

  const posts = await getCollection("posts", ({ data }) => !data.draft);

  const staticPages: Array<{
    path: string;
    priority: string;
    changefreq: string;
  }> = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/archive", priority: "0.9", changefreq: "daily" },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/now", priority: "0.7", changefreq: "weekly" },
    { path: "/changelog", priority: "0.7", changefreq: "weekly" },
    { path: "/topics", priority: "0.6", changefreq: "weekly" },
    { path: "/saved", priority: "0.5", changefreq: "monthly" },
    { path: "/help", priority: "0.4", changefreq: "monthly" },
    { path: "/terms", priority: "0.3", changefreq: "yearly" },
    { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  ];

  const today = new Date().toISOString().split("T")[0];

  const entries = [
    ...staticPages.map(
      ({ path, priority, changefreq }) =>
        `  <url><loc>${siteUrl}${path}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
    ),
    ...posts.map((post) => {
      const lastmod = (post.data.updatedDate ?? post.data.pubDate)
        .toISOString()
        .split("T")[0];
      return `  <url><loc>${siteUrl}/${post.id}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
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
