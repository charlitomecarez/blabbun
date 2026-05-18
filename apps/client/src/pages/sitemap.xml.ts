import type { APIRoute } from "astro";
import { tagSlug } from "@blabbun/utils";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, "") ?? "https://blabbun.com";

  const posts = await getCollection("posts", ({ data }) => !data.draft);

  // Latest post date drives the "freshness" of feed-like static pages.
  const latestPostDate = posts.reduce<Date | null>((acc, p) => {
    const d = p.data.updatedDate ?? p.data.pubDate;
    return !acc || d > acc ? d : acc;
  }, null);
  const latestIso = latestPostDate?.toISOString().split("T")[0];

  const staticPages: Array<{
    path: string;
    priority: string;
    changefreq: string;
    lastmod?: string;
  }> = [
    { path: "/", priority: "1.0", changefreq: "daily", lastmod: latestIso },
    {
      path: "/archive",
      priority: "0.9",
      changefreq: "daily",
      lastmod: latestIso,
    },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/now", priority: "0.7", changefreq: "weekly" },
    { path: "/changelog", priority: "0.7", changefreq: "weekly" },
    {
      path: "/topics",
      priority: "0.6",
      changefreq: "weekly",
      lastmod: latestIso,
    },
    { path: "/terms", priority: "0.3", changefreq: "yearly" },
    { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  ];

  // Per-tag topic pages — each is its own indexable hub.
  const tagLatest = new Map<string, Date>();
  for (const p of posts) {
    const d = p.data.updatedDate ?? p.data.pubDate;
    for (const t of p.data.tags ?? []) {
      const key = t.toUpperCase();
      const cur = tagLatest.get(key);
      if (!cur || d > cur) tagLatest.set(key, d);
    }
  }

  const tagEntries = [...tagLatest.entries()].map(([tag, date]) => {
    const lastmod = date.toISOString().split("T")[0];
    return `  <url><loc>${siteUrl}/topics/${tagSlug(tag)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
  });

  const entries = [
    ...staticPages.map(({ path, priority, changefreq, lastmod }) => {
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
      return `  <url><loc>${siteUrl}${path}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    }),
    ...tagEntries,
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
