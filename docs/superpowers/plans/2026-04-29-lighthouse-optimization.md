# Lighthouse Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Performance and Best Practices Lighthouse scores across all pages of the `apps/client` app (blabbun.com).

**Architecture:** Six independent, sequentially-committable changes: (1) replace the 357KB PNG logo/favicon with properly sized assets, (2) self-host IBM Plex Mono to eliminate Google Fonts cross-origin requests, (3) update `Layout.astro` to wire up the new assets and preloads, (4) update `Navbar.svelte` to use the new logo, (5) defer non-critical Svelte hydration from `client:load` to `client:idle`, (6) add Cloudflare static asset cache headers.

**Tech Stack:** Node.js scripts using `sharp` + `png-to-ico`, `@fontsource/ibm-plex-mono` (for WOFF2 source files), Astro 6, Svelte 5, Cloudflare Workers static assets.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `apps/client/public/blabbun-logo.webp` | Create | 56×56 WebP logo, <5KB |
| `apps/client/public/favicon.ico` | Replace | Proper multi-size ICO (currently a misnamed 357KB PNG) |
| `apps/client/public/fonts/ibm-plex-mono-400.woff2` | Create | Self-hosted font variant |
| `apps/client/public/fonts/ibm-plex-mono-500.woff2` | Create | Self-hosted font variant |
| `apps/client/public/fonts/ibm-plex-mono-600.woff2` | Create | Self-hosted font variant |
| `apps/client/public/fonts/ibm-plex-mono-400-italic.woff2` | Create | Self-hosted font variant |
| `apps/client/public/_headers` | Create | Cloudflare cache-control headers |
| `apps/client/src/layouts/Layout.astro` | Modify | Favicon, preloads, @font-face, remove Google Fonts links |
| `packages/ui/components/layouts/Navbar.svelte` | Modify | Logo src + fetchpriority |
| `apps/client/src/pages/index.astro` | Modify | `HomeFeed`: client:load → client:idle |
| `apps/client/src/pages/[slug].astro` | Modify | `ReadingProgress` + `FloatingNewsletter`: client:load → client:idle |

---

## Task 1: Generate WebP logo and proper favicon.ico

**Files:**
- Create: `apps/client/scripts/gen-assets.mjs` (temporary helper, deleted after use)
- Replace: `apps/client/public/favicon.ico`
- Create: `apps/client/public/blabbun-logo.webp`

### Context
`/public/blabbun.png` is 802×670px, 357KB. It is used as both the navbar logo (displayed at 28×28) and as the favicon. The existing `favicon.ico` in `/public` is actually the same PNG with a renamed extension — `file favicon.ico` reports "PNG image data, 802x670".

`sharp` and `png-to-ico` are available on npm. This task generates the two replacement assets via a throwaway script, then deletes the script.

- [ ] **Step 1: Install sharp and png-to-ico in the client app**

Run from the repo root:
```bash
pnpm --filter @blabbun/client add -D sharp png-to-ico
```

- [ ] **Step 2: Write the asset generation script**

Create `apps/client/scripts/gen-assets.mjs`:
```js
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const src = new URL("../public/blabbun.png", import.meta.url);

// WebP logo — 56×56 (2× of the 28px display size for HiDPI)
await sharp(src)
  .resize(56, 56, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 90 })
  .toFile(new URL("../public/blabbun-logo.webp", import.meta.url).pathname);

console.log("✓ blabbun-logo.webp");

// Proper favicon.ico — 16, 32, 48px inside a real ICO container
const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((s) =>
    sharp(src)
      .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  )
);
const icoBuffer = await pngToIco(pngBuffers);
writeFileSync(new URL("../public/favicon.ico", import.meta.url).pathname, icoBuffer);

console.log("✓ favicon.ico");
```

- [ ] **Step 3: Run the script**

```bash
cd apps/client && node scripts/gen-assets.mjs
```

Expected output:
```
✓ blabbun-logo.webp
✓ favicon.ico
```

- [ ] **Step 4: Verify output sizes**

```bash
wc -c apps/client/public/blabbun-logo.webp apps/client/public/favicon.ico
file apps/client/public/favicon.ico
```

Expected: `blabbun-logo.webp` < 10KB, `favicon.ico` < 15KB, `file` reports "MS Windows icon resource".

- [ ] **Step 5: Remove the script and dev dependencies**

```bash
rm apps/client/scripts/gen-assets.mjs
rmdir apps/client/scripts 2>/dev/null || true
pnpm --filter @blabbun/client remove sharp png-to-ico
```

- [ ] **Step 6: Commit**

```bash
git add apps/client/public/blabbun-logo.webp apps/client/public/favicon.ico
git commit -m "perf: replace 357KB PNG favicon/logo with optimised WebP and ICO"
```

---

## Task 2: Self-host IBM Plex Mono fonts

**Files:**
- Create: `apps/client/public/fonts/ibm-plex-mono-400.woff2`
- Create: `apps/client/public/fonts/ibm-plex-mono-500.woff2`
- Create: `apps/client/public/fonts/ibm-plex-mono-600.woff2`
- Create: `apps/client/public/fonts/ibm-plex-mono-400-italic.woff2`

### Context
`Layout.astro` currently loads IBM Plex Mono from Google Fonts using a `preconnect` + print-media swap trick. Lighthouse flags cross-origin connections (`fonts.googleapis.com`, `fonts.gstatic.com`) under Best Practices and the render-blocking potential under Performance. Self-hosting eliminates both by serving fonts from the same origin. We use `@fontsource/ibm-plex-mono` only as a source for the WOFF2 files — the package is never imported at runtime.

The four variants used (per the Google Fonts URL in Layout.astro):
- weight 400, style normal
- weight 500, style normal
- weight 600, style normal
- weight 400, style italic

- [ ] **Step 1: Install @fontsource/ibm-plex-mono temporarily**

```bash
pnpm --filter @blabbun/client add -D @fontsource/ibm-plex-mono
```

- [ ] **Step 2: Copy the WOFF2 files to public/fonts/**

```bash
mkdir -p apps/client/public/fonts

cp node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2 \
   apps/client/public/fonts/ibm-plex-mono-400.woff2

cp node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2 \
   apps/client/public/fonts/ibm-plex-mono-500.woff2

cp node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2 \
   apps/client/public/fonts/ibm-plex-mono-600.woff2

cp node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-italic.woff2 \
   apps/client/public/fonts/ibm-plex-mono-400-italic.woff2
```

If any file is not found, run `ls node_modules/@fontsource/ibm-plex-mono/files/` to confirm exact filenames and adjust accordingly.

- [ ] **Step 3: Verify files copied correctly**

```bash
wc -c apps/client/public/fonts/*.woff2
```

Expected: each file between 20KB–60KB, total ~150KB.

- [ ] **Step 4: Remove the fontsource dev dependency**

```bash
pnpm --filter @blabbun/client remove @fontsource/ibm-plex-mono
```

- [ ] **Step 5: Commit the font files**

```bash
git add apps/client/public/fonts/
git commit -m "perf: add self-hosted IBM Plex Mono WOFF2 font files"
```

---

## Task 3: Update Layout.astro — favicon, preloads, self-hosted fonts, remove Google Fonts

**Files:**
- Modify: `apps/client/src/layouts/Layout.astro`

### Context
Three things change in `<head>`:
1. Favicon link changes from `blabbun.png` to `favicon.ico`; apple-touch-icon changes to `blabbun-logo.webp`
2. A `<link rel="preload">` is added for `blabbun-logo.webp` (above-the-fold on every page) and for the 400-weight WOFF2 (primary font)
3. All Google Fonts `<link>` tags (preconnect ×2, preload, stylesheet with media trick, noscript fallback) are removed and replaced with a `<style>` block containing four `@font-face` declarations pointing to `/fonts/*.woff2`

Current Google Fonts block in Layout.astro (lines 140–159):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap"
/>
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap"
  rel="stylesheet"
  media="print"
  onload="this.media='all'"
/>
<noscript>
  <link
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap"
    rel="stylesheet"
  />
</noscript>
```

- [ ] **Step 1: Replace the favicon link and add apple-touch-icon**

In `apps/client/src/layouts/Layout.astro`, find:
```html
    <link rel="icon" type="image/png" href="/blabbun.png" />
    <link rel="apple-touch-icon" href="/blabbun.png" />
```

Replace with:
```html
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/webp" href="/blabbun-logo.webp" />
    <link rel="apple-touch-icon" href="/blabbun-logo.webp" />
```

- [ ] **Step 2: Add preload hints for logo and primary font**

After the `<link rel="alternate" ...>` tag (currently line 58), add:
```html
    <link rel="preload" as="image" href="/blabbun-logo.webp" type="image/webp" />
    <link rel="preload" as="font" type="font/woff2" href="/fonts/ibm-plex-mono-400.woff2" crossorigin />
```

- [ ] **Step 3: Replace Google Fonts links with self-hosted @font-face**

Find and remove the entire Google Fonts block (the preconnect ×2, preload, stylesheet with media trick, and noscript fallback — approximately lines 140–159 in the current file).

In the same location, add:
```html
    <style>
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: url('/fonts/ibm-plex-mono-400.woff2') format('woff2');
      }
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-display: swap;
        font-weight: 500;
        src: url('/fonts/ibm-plex-mono-500.woff2') format('woff2');
      }
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-display: swap;
        font-weight: 600;
        src: url('/fonts/ibm-plex-mono-600.woff2') format('woff2');
      }
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: italic;
        font-display: swap;
        font-weight: 400;
        src: url('/fonts/ibm-plex-mono-400-italic.woff2') format('woff2');
      }
    </style>
```

- [ ] **Step 4: Verify the dev server renders correctly**

```bash
pnpm dev:client
```

Open `http://localhost:4321` and confirm:
- The IBM Plex Mono font loads (text is monospaced, not system font)
- The favicon shows correctly in the browser tab
- Browser DevTools → Network tab shows no requests to `fonts.googleapis.com` or `fonts.gstatic.com`

- [ ] **Step 5: Run type check**

```bash
pnpm --filter @blabbun/client lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/layouts/Layout.astro
git commit -m "perf: self-host IBM Plex Mono, fix favicon, add asset preloads"
```

---

## Task 4: Update Navbar.svelte — use WebP logo with fetchpriority

**Files:**
- Modify: `packages/ui/components/layouts/Navbar.svelte`

### Context
The Navbar logo `<img>` currently references `/blabbun.png` (357KB, 802×670). It needs to reference the new `/blabbun-logo.webp` (56×56, <10KB) and include `fetchpriority="high"` since it is the first visible image on every page (LCP candidate).

Current img tag in Navbar.svelte (around line 141):
```html
      <img
        src="/blabbun.png"
        alt="blab bun"
        width="28"
        height="28"
        style="width:28px;height:28px;object-fit:contain;flex-shrink:0"
      />
```

- [ ] **Step 1: Update the logo img element**

Find the img element above and replace with:
```html
      <img
        src="/blabbun-logo.webp"
        alt="blab bun"
        width="28"
        height="28"
        fetchpriority="high"
        style="width:28px;height:28px;object-fit:contain;flex-shrink:0"
      />
```

- [ ] **Step 2: Verify in the browser**

With `pnpm dev:client` running, confirm the navbar logo renders at the correct size and the image loads quickly in the Network tab (~56×56 WebP, not 802×670 PNG).

- [ ] **Step 3: Commit**

```bash
git add packages/ui/components/layouts/Navbar.svelte
git commit -m "perf: use optimised WebP logo with fetchpriority in Navbar"
```

---

## Task 5: Defer non-critical Svelte hydration

**Files:**
- Modify: `apps/client/src/pages/index.astro`
- Modify: `apps/client/src/pages/[slug].astro`

### Context
Three components use `client:load` unnecessarily, which means the Svelte runtime hydrates them during the critical path, inflating Total Blocking Time (TBT):

- `<HomeFeed client:load>` in `index.astro` — tag filter and infinite scroll; users won't interact within the first few hundred ms
- `<ReadingProgress client:load>` in `[slug].astro` — scroll listener; doesn't affect paint
- `<FloatingNewsletter client:load>` in `[slug].astro` — newsletter prompt; should appear after the page is settled

Changing to `client:idle` tells Astro to hydrate during browser idle time (via `requestIdleCallback`), after the main thread is free. This does not change the server-rendered HTML — all three components will still appear in the initial HTML; only their interactivity is deferred.

**Important:** `<Navbar client:load>` is intentionally left as-is. The Navbar reads `localStorage` for the theme and bookmark count on first paint; deferring it would cause a visible flash.

- [ ] **Step 1: Change HomeFeed in index.astro**

In `apps/client/src/pages/index.astro`, find:
```html
    <HomeFeed feedItems={feedItems} allTags={allTags} client:load />
```

Replace with:
```html
    <HomeFeed feedItems={feedItems} allTags={allTags} client:idle />
```

- [ ] **Step 2: Change ReadingProgress in [slug].astro**

In `apps/client/src/pages/[slug].astro`, find:
```html
  <ReadingProgress client:load />
```

Replace with:
```html
  <ReadingProgress client:idle />
```

- [ ] **Step 3: Change FloatingNewsletter in [slug].astro**

In `apps/client/src/pages/[slug].astro`, find:
```html
  <FloatingNewsletter client:load postSlug={post.id} />
```

Replace with:
```html
  <FloatingNewsletter client:idle postSlug={post.id} />
```

- [ ] **Step 4: Verify in the browser**

With `pnpm dev:client` running:
- On `http://localhost:4321`: tag filter buttons should still work (just hydrate slightly later)
- On any post page: the reading progress bar and floating newsletter should still appear correctly

- [ ] **Step 5: Run type check**

```bash
pnpm --filter @blabbun/client lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/pages/index.astro apps/client/src/pages/[slug].astro
git commit -m "perf: defer non-critical Svelte hydration from client:load to client:idle"
```

---

## Task 6: Add Cloudflare cache headers for static assets

**Files:**
- Create: `apps/client/public/_headers`

### Context
Cloudflare Workers with static assets respects a `_headers` file placed in the assets directory (Astro copies `public/` contents to `dist/` verbatim). Without cache headers, browsers re-validate static assets on every visit. Astro hashes all JS/CSS filenames under `/_astro/` (e.g. `/_astro/index.Bx3kA1p2.js`), so `immutable` is safe for those. Font files and the WebP logo have stable, manually-versioned paths; `immutable` is safe. The favicon has a 24h TTL since its path doesn't change with content.

The `_headers` syntax is one header per line, indented under the path pattern.

- [ ] **Step 1: Create the _headers file**

Create `apps/client/public/_headers`:
```
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/blabbun-logo.webp
  Cache-Control: public, max-age=31536000, immutable

/favicon.ico
  Cache-Control: public, max-age=86400

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

- [ ] **Step 2: Verify the file is included in the build output**

```bash
pnpm --filter @blabbun/client build
ls apps/client/dist/_headers
```

Expected: file exists in `dist/`.

- [ ] **Step 3: Commit**

```bash
git add apps/client/public/_headers
git commit -m "perf: add Cloudflare cache-control headers for static assets"
```

---

## Verification

After all six tasks are complete, run a full build and check for issues:

```bash
pnpm build
```

Expected: no build errors. Then deploy to Cloudflare and run a Lighthouse audit (Chrome DevTools → Lighthouse → Mobile) on the homepage and a post page. Target: Performance ≥ 85, Best Practices ≥ 95.
