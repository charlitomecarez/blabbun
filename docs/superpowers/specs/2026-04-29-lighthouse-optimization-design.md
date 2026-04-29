# Lighthouse Optimization — Design Spec

**Date:** 2026-04-29  
**Target:** Performance + Best Practices scores (all pages: home, post, archive, static)  
**Approach:** Option B — comprehensive, no service worker, no static homepage flip

---

## 1. Image optimization

### Problem
`/public/blabbun.png` is 357KB at 802×670px. It is served on every page as:
- The favicon (`<link rel="icon" type="image/png" href="/blabbun.png">`)
- The navbar logo (`<img src="/blabbun.png" width="28" height="28">` in `Navbar.svelte`)

Lighthouse flags both: "Properly size images" and "Serve images in next-gen formats."

### Fix
1. Generate `/public/blabbun-logo.webp` — 56×56px (2× for HiDPI), WebP, <5KB. Used only as the navbar logo.
2. Generate `/public/favicon.ico` — standard multi-size ICO (16, 32, 48px). Used as the page favicon.
3. Update `Layout.astro`:
   - Change `<link rel="icon">` to reference `favicon.ico`
   - Add `<link rel="preload" as="image" href="/blabbun-logo.webp">` (above-the-fold on every page)
4. Update `Navbar.svelte`:
   - Change `src="/blabbun.png"` → `src="/blabbun-logo.webp"`
   - Add `fetchpriority="high"` to the logo `<img>`

The original `blabbun.png` stays in `/public` (referenced by `blabbun-email.png` context and any existing email templates) but is no longer served in the critical path.

---

## 2. Hydration directive changes

### Problem
Several Svelte components use `client:load`, which hydrates immediately on parse and inflates Total Blocking Time (TBT). Most of this JS is not needed at paint time.

| Component | Current | Fix | Rationale |
|-----------|---------|-----|-----------|
| `<Navbar client:load>` | client:load | client:load → keep, but extract theme+bookmarks | Navbar needs to be interactive immediately for theme toggle; can't defer |
| `<HomeFeed client:load>` | client:load | client:idle | Tag filter and infinite scroll not needed until user interacts |
| `<ReadingProgress client:load>` | client:load | client:idle | Scroll listener doesn't need to run at paint |
| `<FloatingNewsletter client:load>` | client:load | client:idle | Newsletter prompt should appear after page is settled |
| `<SearchDropdown client:idle>` | client:idle | keep | Already correct |
| `<NewsletterBar client:visible>` | client:visible | keep | Already correct |

**Note on Navbar:** The Navbar cannot be deferred to `client:idle` because the theme toggle and bookmark count need to respond to `localStorage` on first paint to avoid a flash. It stays `client:load` but is already small enough that this is acceptable. No change here.

---

## 3. Self-hosted fonts

### Problem
`Layout.astro` loads IBM Plex Mono from Google Fonts via two cross-origin requests (`fonts.googleapis.com` + `fonts.gstatic.com`). Even with the print-media trick, Lighthouse flags the cross-origin connections and the render-blocking potential.

### Fix
1. Download the four IBM Plex Mono variants used (wght 400, 500, 600 — regular + italic 400) as WOFF2 files into `/public/fonts/`.
2. Add `@font-face` declarations to `packages/ui/styles/global.css` pointing to `/fonts/ibm-plex-mono-*.woff2` with `font-display: swap`.
3. Remove all Google Fonts `<link>` tags from `Layout.astro` (preconnect, preload, stylesheet, noscript fallback).
4. Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the 400-weight variant (most used) in `Layout.astro`.

Font files total ~150KB for all four variants; served from the same origin with long-term cache headers.

---

## 4. Cache headers for static assets

### Problem
No `Cache-Control` headers are set for static assets. Cloudflare Workers Asset Binding serves them without caching hints, so browsers re-validate on every visit.

### Fix
Add a `public/_headers` file (Cloudflare Pages/Workers static asset headers):

```
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable

/*.ico
  Cache-Control: public, max-age=86400

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

Astro hashes all JS/CSS filenames in `/_astro/`, so `immutable` is safe. Font files and images are versioned manually (filename includes purpose), so `immutable` is appropriate. The favicon uses a shorter TTL since it may be updated without a filename change.

---

## 5. External link security attributes

### Problem
In `[slug].astro`, the `imageSourceUrl` link uses `target="_blank"` without `rel="noreferrer"`. Lighthouse Best Practices flags links to cross-origin destinations that open in new tabs without `rel="noreferrer"`.

### Fix
Change the `imageSourceUrl` anchor:
```
rel="noopener noreferrer"
```
(It already has `rel="noopener noreferrer"` — verify and confirm. If any others are missing, add them.)

---

## Files changed

| File | Change |
|------|--------|
| `apps/client/public/blabbun-logo.webp` | New — 56×56 WebP logo |
| `apps/client/public/favicon.ico` | New — proper multi-size ICO |
| `apps/client/public/fonts/ibm-plex-mono-*.woff2` | New — 4 font variants |
| `apps/client/public/_headers` | New — cache headers |
| `apps/client/src/layouts/Layout.astro` | Update favicon link, add preloads, remove Google Fonts links |
| `packages/ui/styles/global.css` | Add @font-face declarations, remove Google Fonts dependency |
| `packages/ui/components/layouts/Navbar.svelte` | Use blabbun-logo.webp, add fetchpriority |
| `apps/client/src/pages/index.astro` | HomeFeed: client:load → client:idle |
| `apps/client/src/pages/[slug].astro` | ReadingProgress + FloatingNewsletter: client:load → client:idle |

---

## Out of scope

- Flipping homepage to `prerender = true` (Option C — follow-up)
- Color contrast improvements (Accessibility category, not requested)
- MDX image optimization via Astro Image component (separate initiative)
- Service worker / offline support
