# SEO, Performance & Accessibility Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the critical SEO gaps (per-page titles, Open Graph, JSON-LD, sitemap), improve hydration performance, optimize images, and fix accessibility contrast/focus issues found in the site audit.

**Architecture:** Layout.astro is upgraded to accept per-page SEO props (title, description, ogImage) so every route controls its own metadata. JSON-LD is added per page type. A manual sitemap endpoint and robots.txt are added. Below-fold Svelte components are switched from `client:load` to `client:idle` / `client:visible`. Image elements get lazy loading and dimensions. Low-contrast text values and missing focus rings are corrected.

**Tech Stack:** Astro, Svelte 5, Tailwind CSS v4, Playwright (e2e tests)

---

### Task 1: Add per-page SEO props to Layout.astro and update all pages

**Files:**

- Modify: `apps/client/src/layouts/Layout.astro`
- Modify: `apps/client/src/pages/index.astro`
- Modify: `apps/client/src/pages/[slug].astro`
- Modify: `apps/client/src/pages/archive.astro`
- Modify: `apps/client/src/pages/topics/index.astro`
- Modify: `apps/client/src/pages/topics/[tag].astro`
- Modify: `apps/client/src/pages/about.astro`
- Modify: `apps/client/src/pages/help.astro`
- Modify: `apps/client/src/pages/terms.astro`
- Modify: `apps/client/src/pages/privacy.astro`

- [ ] **Step 1: Update Layout.astro to accept SEO props and render full meta head**

Replace the entire `apps/client/src/layouts/Layout.astro` with:

```astro
---
import "@thelunan/ui/styles/global.css";

import { Footer, Navbar } from "@thelunan/ui/components/layouts";

import SearchDropdown from "@/components/search/SearchDropdown.svelte";
import ScrollToTop from "@/components/layouts/ScrollToTop.svelte";

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const {
  title: rawTitle,
  description = "A quiet corner of the internet where thoughts settle, drift, and take shape. Unfiltered reflections — no pressure to be complete.",
  ogImage,
} = Astro.props;

const siteTitle = "The Lunan";
const pageTitle = rawTitle ? `${rawTitle} · ${siteTitle}` : siteTitle;
const canonicalUrl = Astro.url.href;
const siteUrl =
  Astro.site?.toString().replace(/\/$/, "") ?? "https://thelunan.com";

const { pathname } = Astro.url;
const navLinks = [
  { label: "Archive", href: "/archive", active: pathname === "/archive" },
  { label: "Topics", href: "/topics", active: pathname.startsWith("/topics") },
  { label: "About", href: "/about", active: pathname === "/about" },
];
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="generator" content={Astro.generator} />

    <!-- Primary SEO -->
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={siteTitle} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalUrl} />
    {
      ogImage && (
        <meta
          property="og:image"
          content={
            ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`
          }
        />
      )
    }

    <!-- Twitter Card -->
    <meta
      name="twitter:card"
      content={ogImage ? "summary_large_image" : "summary"}
    />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={description} />
    {
      ogImage && (
        <meta
          name="twitter:image"
          content={
            ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`
          }
        />
      )
    }

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Space+Grotesk:wght@400;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    class="font-manrope flex min-h-screen flex-col bg-[#f1f8f3] text-[#29302d] antialiased"
  >
    <!-- Fixed navbar — pages use pt-[64px] to compensate -->
    <Navbar client:load links={navLinks} />
    <SearchDropdown client:load />
    <ScrollToTop client:idle />
    <div class="flex-1">
      <slot />
    </div>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Update `apps/client/src/pages/[slug].astro` — pass post title, description, and image to Layout**

Change line 46 from:

```astro
<Layout />
```

to:

```astro
<Layout
  title={post.data.title}
  description={post.data.description}
  ogImage={post.data.image}
/>
```

- [ ] **Step 3: Update `apps/client/src/pages/archive.astro` — pass archive title**

Change line 36 from:

```astro
<Layout />
```

to:

```astro
<Layout
  title="Archive"
  description={`All ${allPosts.length} posts from The Lunan, sorted by date.`}
/>
```

- [ ] **Step 4: Update `apps/client/src/pages/topics/index.astro` — pass topics title**

Change line 29 from:

```astro
<Layout />
```

to:

```astro
<Layout
  title="Topics"
  description="Browse all topics written about on The Lunan."
/>
```

- [ ] **Step 5: Update `apps/client/src/pages/topics/[tag].astro` — pass dynamic tag title**

Change line 60 from:

```astro
<Layout />
```

to:

```astro
<Layout title={label} description={`All posts about ${label} on The Lunan.`} />
```

- [ ] **Step 6: Update `apps/client/src/pages/about.astro` — pass about title**

Change line 4 from:

```astro
<Layout />
```

to:

```astro
<Layout
  title="About"
  description="Hola! I'm Charli — this is my little corner of the internet. No agenda, no niche, just whatever's on my mind."
/>
```

- [ ] **Step 7: Update `apps/client/src/pages/help.astro`, `terms.astro`, `privacy.astro`**

In `help.astro`, change `<Layout>` to:

```astro
<Layout
  title="Help"
  description="Answers to common questions about reading, navigating, and getting the most out of The Lunan."
/>
```

In `terms.astro`, change `<Layout>` to:

```astro
<Layout
  title="Terms of Service"
  description="Terms of service for The Lunan."
/>
```

In `privacy.astro`, change `<Layout>` to:

```astro
<Layout
  title="Privacy Policy"
  description="Privacy policy for The Lunan — how data is handled and what is collected."
/>
```

- [ ] **Step 8: Commit**

```bash
git add apps/client/src/layouts/Layout.astro \
        apps/client/src/pages/index.astro \
        apps/client/src/pages/\[slug\].astro \
        apps/client/src/pages/archive.astro \
        apps/client/src/pages/topics/index.astro \
        apps/client/src/pages/topics/\[tag\].astro \
        apps/client/src/pages/about.astro \
        apps/client/src/pages/help.astro \
        apps/client/src/pages/terms.astro \
        apps/client/src/pages/privacy.astro
git commit -m "feat: add per-page SEO meta, OG tags, Twitter Card, and canonical URLs"
```

---

### Task 2: Add JSON-LD structured data

**Files:**

- Modify: `apps/client/src/layouts/Layout.astro`
- Modify: `apps/client/src/pages/[slug].astro`

- [ ] **Step 1: Add WebSite schema to Layout.astro**

In `apps/client/src/layouts/Layout.astro`, add the following script tag inside `<head>`, directly after the Twitter Card meta block (before the Fonts section):

```astro
<!-- Structured data: WebSite (every page) -->
<script
  type="application/ld+json"
  set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    url: siteUrl,
    description: description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/archive?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  })}
/>
```

- [ ] **Step 2: Add BlogPosting schema to `apps/client/src/pages/[slug].astro`**

After the existing frontmatter variables (after line 43, before the closing `---`), add:

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.data.title,
  description: post.data.description,
  url: postUrl,
  datePublished: post.data.pubDate.toISOString(),
  author: {
    "@type": "Person",
    name: "The Lunan",
    url: `${Astro.site ?? "https://thelunan.com"}/about`,
  },
  publisher: {
    "@type": "Organization",
    name: "The Lunan",
    url: Astro.site ?? "https://thelunan.com",
  },
  ...(post.data.image ? { image: post.data.image } : {}),
};
```

Then in the `<Layout>` block, add a script tag inside the component slot (add it right before the closing `</div>` that wraps everything, i.e. before line 170 `</div>`):

```astro
<!-- BlogPosting structured data -->
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/layouts/Layout.astro apps/client/src/pages/\[slug\].astro
git commit -m "feat: add JSON-LD structured data (WebSite + BlogPosting schemas)"
```

---

### Task 3: Add site URL to Astro config, sitemap.xml, and robots.txt

**Files:**

- Modify: `apps/client/astro.config.mjs`
- Create: `apps/client/src/pages/sitemap.xml.ts`
- Create: `apps/client/public/robots.txt`

- [ ] **Step 1: Add `site` to Astro config**

Replace `apps/client/astro.config.mjs` with:

```js
// @ts-check
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://thelunan.com",
  integrations: [svelte(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: Create `apps/client/src/pages/sitemap.xml.ts`**

```typescript
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, "") ?? "https://thelunan.com";

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
```

- [ ] **Step 3: Create `apps/client/public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://thelunan.com/sitemap.xml
```

- [ ] **Step 4: Verify sitemap works**

Start the dev server and confirm the sitemap renders:

```bash
cd apps/client && pnpm dev
```

Open `http://localhost:4321/sitemap.xml` — should return valid XML with `<urlset>` and a `<url>` entry for each page and post.

Open `http://localhost:4321/robots.txt` — should show the User-agent and Sitemap lines.

- [ ] **Step 5: Commit**

```bash
git add apps/client/astro.config.mjs \
        apps/client/src/pages/sitemap.xml.ts \
        apps/client/public/robots.txt
git commit -m "feat: add sitemap.xml endpoint, robots.txt, and site URL to Astro config"
```

---

### Task 4: Optimize hydration directives

Replace `client:load` with appropriate lazy directives for below-fold components.

**Files:**

- Modify: `apps/client/src/pages/index.astro`
- Modify: `apps/client/src/pages/[slug].astro`

**Directive guide:**

- `client:load` — hydrates immediately; use for above-fold interactive UI
- `client:idle` — hydrates when browser is idle; use for important but non-urgent UI
- `client:visible` — hydrates when component enters viewport; best for below-fold

- [ ] **Step 1: Update `apps/client/src/pages/index.astro`**

Change line 118:

```astro
<NewsletterBar client:load />
```

to:

```astro
<NewsletterBar client:visible />
```

- [ ] **Step 2: Update `apps/client/src/pages/[slug].astro`**

Change line 139:

```astro
<ClapShare
  client:load
  postSlug={post.id}
  postUrl={postUrl}
  postTitle={post.data.title}
/>
```

to:

```astro
<ClapShare
  client:visible
  postSlug={post.id}
  postUrl={postUrl}
  postTitle={post.data.title}
/>
```

Change line 147:

```astro
<Comments client:load postSlug={post.id} />
```

to:

```astro
<Comments client:visible postSlug={post.id} />
```

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/index.astro apps/client/src/pages/\[slug\].astro
git commit -m "perf: use client:visible for below-fold components to reduce initial JS"
```

---

### Task 5: Image lazy loading and dimensions

**Files:**

- Modify: `packages/ui/components/cards/FeedItem.svelte`
- Modify: `apps/client/src/pages/[slug].astro`

- [ ] **Step 1: Add lazy loading to FeedItem thumbnail**

In `packages/ui/components/cards/FeedItem.svelte`, find the `<img>` element (around line 173) and update it:

Current:

```svelte
<img
  src={imageUrl}
  alt=""
  class="h-[96px] w-[140px] rounded-[8px] object-cover
               transition-opacity group-hover:opacity-80 md:h-[128px] md:w-[192px]"
/>
```

Replace with:

```svelte
<img
  src={imageUrl}
  alt=""
  width="192"
  height="128"
  loading="lazy"
  decoding="async"
  class="h-[96px] w-[140px] rounded-[8px] object-cover
               transition-opacity group-hover:opacity-80 md:h-[128px] md:w-[192px]"
/>
```

- [ ] **Step 2: Add lazy loading to post hero image in `[slug].astro`**

In `apps/client/src/pages/[slug].astro`, find the hero `<img>` element (around line 63):

Current:

```astro
<img
  src={post.data.image}
  alt={post.data.title}
  class="w-full object-cover"
  style="max-height: 480px;"
/>
```

Replace with:

```astro
<img
  src={post.data.image}
  alt={post.data.title}
  width="1200"
  height="480"
  loading="lazy"
  decoding="async"
  class="w-full object-cover"
  style="max-height: 480px;"
/>
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/components/cards/FeedItem.svelte apps/client/src/pages/\[slug\].astro
git commit -m "perf: add lazy loading, decoding=async, and width/height to images"
```

---

### Task 6: Accessibility — color contrast and focus rings

**Files:**

- Modify: `apps/client/src/pages/index.astro`
- Modify: `packages/ui/components/cards/FeedItem.svelte`
- Modify: `apps/client/src/components/home/NewsletterBar.svelte`

**Context:** WCAG AA requires 4.5:1 contrast for normal text. `rgba(41,48,45,0.35)` on `#f1f8f3` is ~2.8:1 — too low. Bumping to `0.5` gives ~4.2:1, and `0.55` gives ~4.7:1.

- [ ] **Step 1: Fix low-contrast date text in `apps/client/src/pages/index.astro`**

There are two instances of `text-[rgba(41,48,45,0.35)]` used for date metadata in the featured card (lines ~155 and ~222). Change both from `0.35` to `0.55`:

```astro
<!-- Featured card with image — author row date (line ~155) -->
<span class="font-manrope text-[13px] text-[rgba(41,48,45,0.55)]">
  {featuredDate}
</span>

<!-- Featured card without image — author row date (line ~222) -->
<span class="font-manrope text-[13px] text-[rgba(41,48,45,0.55)]">
  {featuredDate}
</span>
```

Also add `focus-visible` ring to both "Read entry" `<a>` links (lines ~162 and ~229). Find:

```astro
class="font-manrope relative z-10 inline-flex w-fit items-center gap-2
rounded-full bg-[#386547] px-5 py-2.5 text-[13px] font-bold text-[#ccffd8]
transition-colors hover:bg-[#2d5a3d] md:px-6 md:py-3"
```

Replace with:

```astro
class="font-manrope relative z-10 inline-flex w-fit items-center gap-2
rounded-full bg-[#386547] px-5 py-2.5 text-[13px] font-bold text-[#ccffd8]
transition-colors hover:bg-[#2d5a3d] focus-visible:outline-none
focus-visible:ring-2 focus-visible:ring-[#386547] focus-visible:ring-offset-2
md:px-6 md:py-3"
```

And the second "Read entry" link (no-image variant, line ~229):

```astro
class="font-manrope relative z-10 inline-flex items-center gap-2 rounded-full
bg-[#386547] px-5 py-2.5 text-[13px] font-bold text-[#ccffd8] transition-colors
hover:bg-[#2d5a3d]"
```

Replace with:

```astro
class="font-manrope relative z-10 inline-flex items-center gap-2 rounded-full
bg-[#386547] px-5 py-2.5 text-[13px] font-bold text-[#ccffd8] transition-colors
hover:bg-[#2d5a3d] focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-[#386547] focus-visible:ring-offset-2"
```

- [ ] **Step 2: Fix low-contrast date text in `packages/ui/components/cards/FeedItem.svelte`**

Find (around line 62–64):

```svelte
<span class="font-manrope text-[13px] text-[rgba(41,48,45,0.4)]">·</span>
<span class="font-manrope text-[13px] text-[rgba(41,48,45,0.4)]">{date}</span>
```

Change `0.4` to `0.55` on both spans:

```svelte
<span class="font-manrope text-[13px] text-[rgba(41,48,45,0.55)]">·</span>
<span class="font-manrope text-[13px] text-[rgba(41,48,45,0.55)]">{date}</span>
```

Also find the read-time span (around line 101):

```svelte
<span class="font-manrope text-[12px] text-[rgba(41,48,45,0.4)]"
  >{readTime}</span
>
```

Change to `0.55`:

```svelte
<span class="font-manrope text-[12px] text-[rgba(41,48,45,0.55)]"
  >{readTime}</span
>
```

- [ ] **Step 3: Fix low-contrast newsletter placeholder in `apps/client/src/components/home/NewsletterBar.svelte`**

Find (around line 98):

```svelte
placeholder:text-[rgba(41,48,45,0.35)] placeholder:normal-case"
```

Change `0.35` to `0.5`:

```svelte
placeholder:text-[rgba(41,48,45,0.5)] placeholder:normal-case"
```

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/pages/index.astro \
        packages/ui/components/cards/FeedItem.svelte \
        apps/client/src/components/home/NewsletterBar.svelte
git commit -m "fix: improve color contrast and add focus-visible rings for WCAG AA compliance"
```

---

### Task 7: Add Playwright e2e tests for SEO

**Files:**

- Create: `apps/client/tests/e2e/seo.spec.ts`

- [ ] **Step 1: Create the test file**

Create `apps/client/tests/e2e/seo.spec.ts`:

```typescript
import { expect, test } from "@playwright/test";

test.describe("SEO meta tags", () => {
  test("homepage has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("The Lunan");
  });

  test("archive page has correct title", async ({ page }) => {
    await page.goto("/archive");
    await expect(page).toHaveTitle(/Archive · The Lunan/);
  });

  test("topics page has correct title", async ({ page }) => {
    await page.goto("/topics");
    await expect(page).toHaveTitle(/Topics · The Lunan/);
  });

  test("about page has correct title", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/About · The Lunan/);
  });

  test("every page has a meta description", async ({ page }) => {
    for (const path of ["/", "/archive", "/topics", "/about"]) {
      await page.goto(path);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.+/);
    }
  });

  test("every page has Open Graph title and description", async ({ page }) => {
    for (const path of ["/", "/archive", "/about"]) {
      await page.goto(path);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        /.+/
      );
      await expect(
        page.locator('meta[property="og:description"]')
      ).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        /.+/
      );
    }
  });

  test("every page has Twitter Card meta", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      /summary/
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      /.+/
    );
  });

  test("every page has a canonical link", async ({ page }) => {
    for (const path of ["/", "/archive", "/about"]) {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", /.+/);
    }
  });

  test("sitemap.xml returns valid XML", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("<urlset");
    expect(content).toContain("<url><loc>");
  });

  test("robots.txt exists and references sitemap", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Sitemap:");
  });
});
```

- [ ] **Step 2: Run the tests (dev server must be running)**

```bash
cd apps/client && pnpm test --project=chromium tests/e2e/seo.spec.ts
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/client/tests/e2e/seo.spec.ts
git commit -m "test: add e2e SEO tests for titles, meta, OG, sitemap, and robots.txt"
```
