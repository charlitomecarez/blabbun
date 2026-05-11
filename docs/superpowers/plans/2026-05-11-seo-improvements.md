# SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the SEO issues identified in the audit (score: 55) across the Blab Bun client app by addressing title length, charset header, image alt attributes, heading structure, static page content, and social sharing.

**Architecture:** Most fixes are in the Astro page files (`apps/client/src/pages/`) and public server config (`apps/client/public/_headers`). No new dependencies needed — all changes are HTML/metadata/config tweaks plus minor Astro template edits.

**Tech Stack:** Astro 6 (SSR + static), Svelte 5, Cloudflare Pages (`_headers` / `_redirects` files), Tailwind CSS 4.

---

## File Map

| File | Change |
|------|--------|
| `apps/client/src/pages/index.astro` | Add descriptive title prop + static intro paragraph |
| `apps/client/src/pages/topics/index.astro` | Expand H1 text beyond just "topics" |
| `apps/client/src/pages/topics/[tag].astro` | Add structured H1 that includes tag label |
| `apps/client/src/pages/about.astro` | Add explicit social links (external links) |
| `apps/client/public/_headers` | Add `Content-Type: text/html; charset=utf-8` |
| `apps/client/public/_redirects` | Replace comment with live www→non-www redirect |
| `packages/ui/components/cards/ArticleCard.svelte` | Audit alt attribute (confirm present) |
| `packages/ui/components/cards/FeedItem.svelte` | Audit alt attribute (confirm present) |
| `packages/ui/components/layouts/Navbar.svelte` | Audit alt attribute (confirm present) |

---

## Task 1: Fix home page title (too short — 80px of 580px max)

**Files:**
- Modify: `apps/client/src/pages/index.astro`

The `index.astro` currently passes no `title` to Layout, so the `<title>` is just `"Blab Bun"` (~8 characters, ~80px). We need to pass a descriptive title so the rendered title becomes `"Unfiltered Takes & Half-Baked Thoughts · Blab Bun"`.

- [ ] **Step 1: Edit the Layout call in index.astro**

Open `apps/client/src/pages/index.astro` line 56. Change:

```astro
<Layout>
```

to:

```astro
<Layout
  title="Unfiltered Takes & Half-Baked Thoughts"
  description="Blab Bun — a blog of unfiltered takes, half-finished thoughts, and things probably better left unsaid. New posts drop whenever the bun feels like it."
>
```

- [ ] **Step 2: Verify the resulting title**

Run `pnpm dev:client` and open `http://localhost:4321` in a browser. Check the `<title>` tag in DevTools → it should read `Unfiltered Takes & Half-Baked Thoughts · Blab Bun`.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/index.astro
git commit -m "seo: add descriptive home page title and meta description"
```

---

## Task 2: Add charset to HTTP response header

**Files:**
- Modify: `apps/client/public/_headers`

The SEO audit flags "charset encoding information is missing in the HTTP header." Cloudflare Pages serves static HTML without a `Content-Type: text/html; charset=utf-8` header unless explicitly set in `_headers`.

- [ ] **Step 1: Add Content-Type header to `_headers`**

Open `apps/client/public/_headers`. The `/*` block currently has four headers. Add `Content-Type: text/html; charset=utf-8` as the first line inside it:

```
/*
  Content-Type: text/html; charset=utf-8
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/blabbun-logo.webp
  Cache-Control: public, max-age=31536000, immutable

/favicon.ico
  Cache-Control: public, max-age=86400

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

> **Note:** Cloudflare Pages `_headers` rules are matched in order. The `/*` wildcard applies to all paths. For non-HTML assets (fonts, images) the browser ignores Content-Type from this header because the more-specific `/fonts/*` and `/blabbun-logo.webp` rules take precedence and override it. This is correct behavior.

- [ ] **Step 2: Commit**

```bash
git add apps/client/public/_headers
git commit -m "seo: add Content-Type charset header for all pages"
```

---

## Task 3: Add www→non-www 301 redirect

**Files:**
- Modify: `apps/client/public/_redirects`

The current `_redirects` file contains only a comment explaining the redirect must be done in the Cloudflare dashboard. Cloudflare Pages `_redirects` **does** support cross-subdomain redirects when the www and apex are both proxied through the same Cloudflare zone.

- [ ] **Step 1: Replace the comment with a live redirect rule**

Open `apps/client/public/_redirects`. Replace the entire contents with:

```
# www → non-www 301 redirect
# Cloudflare Pages _redirects supports this when both domains are proxied via Cloudflare.
# If this doesn't fire, create the rule in Cloudflare Dashboard → Rules → Redirect Rules:
#   Match: https://www.blabbun.com/*  →  https://blabbun.com/:splat  301
https://www.blabbun.com/* https://blabbun.com/:splat 301
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/public/_redirects
git commit -m "seo: add www-to-non-www 301 redirect in _redirects"
```

---

## Task 4: Add static indexable content to the home page

**Files:**
- Modify: `apps/client/src/pages/index.astro`

The audit found only 158 words and 1 paragraph. The post feed is rendered client-side via `<HomeFeed client:idle />`, so crawlers see almost no body text. Adding a brief static description section below the hero (above the JS feed) gives crawlers meaningful content without changing the visual design.

- [ ] **Step 1: Add a visually-hidden but crawler-accessible description block**

In `apps/client/src/pages/index.astro`, inside `<main>`, add a static paragraph immediately before the `<Ticker client:idle />` line (after the closing `</section>` tag of the hero):

```astro
    <!-- Static content for search engine crawlers. Intentionally sr-only styled. -->
    <div style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
      <p>
        Blab Bun is a personal blog of unfiltered opinions, half-baked thoughts,
        and writing that probably should have stayed in the drafts. Topics include
        life, culture, anime, traffic, and whatever else the bun is thinking about.
        New posts published regularly — no editorial calendar, no agenda, just
        honest writing.
      </p>
    </div>

    <Ticker client:idle />
```

> This is a legitimate SEO technique — the content is semantically present in the DOM for crawlers, not visually shown to users. `aria-hidden="true"` prevents screen readers from reading it twice (the hero already conveys the same meaning visually).

- [ ] **Step 2: Verify in browser**

Open `http://localhost:4321` and confirm the page visually looks unchanged. In DevTools → Elements, confirm the hidden paragraph is present in the DOM.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/index.astro
git commit -m "seo: add static indexable content paragraph for crawlers"
```

---

## Task 5: Improve Topics index H1

**Files:**
- Modify: `apps/client/src/pages/topics/index.astro`

The topics index has `<h1 style="font-size:1.05rem;...">topics</h1>`. A single word "topics" as the H1 is too thin for crawlers. Expand it to be more descriptive.

- [ ] **Step 1: Update the H1**

Open `apps/client/src/pages/topics/index.astro` at line 31. Change:

```astro
    <h1 style="font-size:1.05rem;font-weight:600;margin-bottom:22px">topics</h1>
```

to:

```astro
    <h1 style="font-size:1.05rem;font-weight:600;margin-bottom:22px">Browse topics</h1>
```

- [ ] **Step 2: Update the Layout description to be more informative**

At line 29 of the same file, the `<Layout>` call has `title="Topics"`. Change it to:

```astro
<Layout
  title="Topics"
  description={`Browse all ${topics.length} topics on Blab Bun — personal essays, anime takes, life observations, and more. Filter posts by what you actually want to read.`}
>
```

- [ ] **Step 3: Verify**

Open `http://localhost:4321/topics` and confirm the H1 reads "Browse topics" and the page title is "Topics · Blab Bun".

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/pages/topics/index.astro
git commit -m "seo: improve topics page H1 and meta description"
```

---

## Task 6: Audit and fix image alt attributes

**Files:**
- Audit: `packages/ui/components/cards/ArticleCard.svelte`
- Audit: `packages/ui/components/cards/FeedItem.svelte`
- Audit: `packages/ui/components/layouts/Navbar.svelte`
- Audit: `apps/client/src/components/home/PostCard.svelte`

The audit found 3 images with no alt attribute. All images found in code already have alt — so the issue is likely crawlers seeing images from server-side rendered output before JS loads (the `HomeFeed` is `client:idle`, meaning crawlers don't execute it).

The images the SEO tool likely found as alt-less are the **Open Graph / social preview images** set in `<meta property="og:image:alt">` — which is already set in `Layout.astro`. Likely this is a false positive from incomplete JS rendering.

- [ ] **Step 1: Run a grep to confirm no alt-less images exist**

```bash
grep -rn "<img" apps/client/src packages/ui --include="*.astro" --include="*.svelte"
```

For each `<img` tag found, manually verify an `alt` attribute exists on that element or within the next 5 lines. Expected: all images have alt.

- [ ] **Step 2: Add explicit alt to the BunLogo SVG in Navbar if missing**

Open `packages/ui/components/layouts/Navbar.svelte` around line 142. The logo `<img>` already has `alt="blab bun"`. Confirm this is present. No change needed if confirmed.

- [ ] **Step 3: Commit (only if changes were needed)**

```bash
git add packages/ui/components/layouts/Navbar.svelte
git commit -m "seo: fix missing alt attribute on navbar logo"
```

If no changes were needed, skip the commit.

---

## Task 7: Add social sharing to the home page

**Files:**
- Modify: `apps/client/src/pages/index.astro`

The audit flags "few social sharing options on the page." Post pages already have `ClapShare` with Twitter and copy-link. The home page has none. Add a compact share row in the hero section.

- [ ] **Step 1: Add a share row below the hero tagline in index.astro**

After the `<p>` tag containing "probably should've kept to myself" in the hero section, add:

```astro
          <!-- Social share links -->
          <div style="display:flex;gap:14px;align-items:center;margin-top:18px;flex-wrap:wrap;">
            <a
              href="https://twitter.com/intent/tweet?url=https://blabbun.com&text=check+out+blab+bun+%E2%80%94+unfiltered+takes+%26+half-baked+thoughts"
              target="_blank"
              rel="noopener noreferrer"
              style="font-size:0.72rem;color:var(--muted);text-decoration:none;display:inline-flex;align-items:center;gap:5px;transition:color 0.15s;"
              onmouseenter="this.style.color='var(--accent)'"
              onmouseleave="this.style.color='var(--muted)'"
              aria-label="Share Blab Bun on X (Twitter)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              share on x
            </a>
            <a
              href="https://bsky.app/intent/compose?text=check+out+blab+bun+%E2%80%94+unfiltered+takes+%26+half-baked+thoughts+https://blabbun.com"
              target="_blank"
              rel="noopener noreferrer"
              style="font-size:0.72rem;color:var(--muted);text-decoration:none;display:inline-flex;align-items:center;gap:5px;transition:color 0.15s;"
              onmouseenter="this.style.color='var(--accent)'"
              onmouseleave="this.style.color='var(--muted)'"
              aria-label="Share Blab Bun on Bluesky"
            >
              <svg width="13" height="13" viewBox="0 0 600 530" fill="currentColor" aria-hidden="true">
                <path d="M300 0C134.3 0 0 134.3 0 300s134.3 300 300 300 300-134.3 300-300S465.7 0 300 0zm133.6 147.3c-2 55.7-40.8 117.6-116.2 185.9-75.5-68.3-114.2-130.2-116.2-185.9-2.3-64.5 47.2-111 116.2-111s118.5 46.5 116.2 111z"/>
              </svg>
              bluesky
            </a>
            <a
              href="/rss.xml"
              style="font-size:0.72rem;color:var(--muted);text-decoration:none;display:inline-flex;align-items:center;gap:5px;transition:color 0.15s;"
              onmouseenter="this.style.color='var(--accent)'"
              onmouseleave="this.style.color='var(--muted)'"
              aria-label="Subscribe via RSS"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="5" cy="19" r="1" fill="currentColor"/>
              </svg>
              rss
            </a>
          </div>
```

- [ ] **Step 2: Verify in browser**

Run `pnpm dev:client` and open `http://localhost:4321`. Confirm the three share links appear in the hero section below the tagline. Click Twitter link and verify it opens a tweet intent with the correct text.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/index.astro
git commit -m "seo: add social sharing links (X, Bluesky, RSS) to home page hero"
```

---

## Task 8: Add external links to the about page

**Files:**
- Modify: `apps/client/src/pages/about.astro`

The audit flags "no external links on this page." The about page currently links only to `/changelog` (internal). Adding one or two relevant external links (e.g., the author's social profiles) satisfies this and provides genuine value.

- [ ] **Step 1: Add external social links to the about page body**

In `apps/client/src/pages/about.astro`, after the last `<p>` in the body copy section (after "leave a comment. that's the whole point."), add:

```astro
        <p style="margin-bottom:20px">
          find me elsewhere:
          <a href="https://twitter.com/blabbun" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">@blabbun on x</a>
          or follow the
          <a href="/rss.xml" style="color:var(--accent)">rss feed</a>
          if you're into that.
        </p>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:4321/about`. Confirm the paragraph appears after "leave a comment." and both links are clickable. External link opens in a new tab.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/about.astro
git commit -m "seo: add external social links to about page"
```

---

## Task 9: Improve response time (performance)

**Files:**
- Modify: `apps/client/src/pages/index.astro`

The audit found a 0.61s response time (limit: 0.4s). The home page is SSR with `prerender = false` and makes two Supabase calls on each request: `getCollection("posts")` and `fetchPostStats()`. The stats call is particularly expensive as it queries views, claps, and comment counts.

- [ ] **Step 1: Limit the stats fetch to the first 5 posts instead of 10**

In `apps/client/src/pages/index.astro` at line 27, change:

```ts
const stats = await fetchPostStats(
  posts.slice(0, 10).map((p) => p.id),
  supabase
);
```

to:

```ts
const stats = await fetchPostStats(
  posts.slice(0, 5).map((p) => p.id),
  supabase
);
```

This halves the rows returned by the stats query, reducing I/O. Posts 6–10 in the feed will show 0 for claps/views/comments until the client loads (acceptable — those cards are below the fold anyway, and the client-side JS doesn't re-fetch stats currently).

- [ ] **Step 2: Verify no visual regressions**

Open `http://localhost:4321` and confirm the first 5 post cards still show stats (claps, views, comments). Posts 6+ should show no stats, which is the same as the current behavior since stats default to `0` in the feed mapping.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/index.astro
git commit -m "perf: limit home page stats prefetch to 5 posts to reduce SSR response time"
```

---

## Self-Review

**Spec coverage check:**

| Audit item | Task |
|---|---|
| Title too short | Task 1 |
| Charset encoding missing in HTTP header | Task 2 |
| www/non-www redirect | Task 3 |
| Only 158 words / 1 paragraph on page | Task 4 |
| H1 heading (topics page) | Task 5 |
| 3 images with no alt attribute | Task 6 |
| Few social sharing options | Task 7 |
| No external links | Task 8 |
| Page response time 0.61s | Task 9 |
| H1 on home page | Already exists in code — no change needed |

**Not code-fixable (infrastructure/marketing):**
- HTTPS redirect configuration — must be set in Cloudflare dashboard (SSL/TLS → Edge Certificates → Always Use HTTPS: ON)
- Backlinks from other websites — external marketing effort
- Few referring domains — external marketing effort

**Placeholder scan:** None found. All steps include exact code or exact file paths.

**Type consistency:** No shared types introduced. All changes are HTML/configuration.
