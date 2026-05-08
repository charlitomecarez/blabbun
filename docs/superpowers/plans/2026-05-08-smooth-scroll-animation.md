# Smooth Scroll Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Astro View Transitions (page-to-page fade) and CSS IntersectionObserver scroll reveals to the client app.

**Architecture:** `<ViewTransitions />` in the shared layout handles page transitions natively. A single `IntersectionObserver` script in `Layout.astro` watches all `.reveal` elements and adds `.visible` when they enter the viewport (15% threshold, fire-once). CSS `@keyframes fadeSlideUp` drives the animation; `--reveal-delay` custom property handles stagger without JS timing.

**Tech Stack:** Astro 6 View Transitions API, CSS custom properties, IntersectionObserver (native browser API), Tailwind CSS 4, Svelte 5.

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `packages/ui/styles/global.css` | Add `fadeSlideUp` keyframe + `.reveal` / `.reveal.visible` classes |
| Modify | `apps/client/src/layouts/Layout.astro` | Add `<ViewTransitions />` + IntersectionObserver inline script |
| Modify | `apps/client/src/components/home/PostCard.svelte` | Add `reveal` class + `--reveal-delay` to root `<article>` |
| Modify | `packages/ui/components/cards/ArticleCard.svelte` | Add `reveal` class to root `<a>` |
| Modify | `apps/client/src/components/home/MascotHero.svelte` | Add `reveal` class to root `<div>` |
| Modify | `apps/client/src/components/home/NewsletterBar.svelte` | Add `reveal` class to root `<aside>` |
| Modify | `apps/client/src/pages/about.astro` | Add `reveal` to main content wrapper (pattern applies to `now.astro`, `changelog.astro` etc.) |

---

## Task 1: Add CSS animation primitives to global.css

**Files:**
- Modify: `packages/ui/styles/global.css`

- [ ] **Step 1: Add the `fadeSlideUp` keyframe and reveal classes**

Open `packages/ui/styles/global.css`. The file already has `@keyframes fadeIn` and `@keyframes fadeSlideIn` starting around line 116. Add the following block immediately after the existing `@keyframes pop-in` block (after line ~169):

```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  opacity: 0;
}

.reveal.visible {
  animation: fadeSlideUp 0.5s ease-out both;
  animation-delay: var(--reveal-delay, 0s);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal.visible {
    opacity: 1;
    animation: none;
  }
}
```

- [ ] **Step 2: Verify the CSS parses cleanly**

```bash
cd apps/client && pnpm build 2>&1 | tail -20
```

Expected: build succeeds (exit 0), no CSS parse errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/styles/global.css
git commit -m "feat: add fadeSlideUp keyframe and .reveal/.visible classes to global CSS"
```

---

## Task 2: Add View Transitions + IntersectionObserver to Layout.astro

**Files:**
- Modify: `apps/client/src/layouts/Layout.astro`

- [ ] **Step 1: Import ViewTransitions**

At the top of the frontmatter in `apps/client/src/layouts/Layout.astro` (after the existing imports, around line 8), add:

```ts
import { ViewTransitions } from "astro:transitions";
```

- [ ] **Step 2: Render `<ViewTransitions />` in `<head>`**

Inside the `<head>` block, add `<ViewTransitions />` right before the closing `</head>` tag (currently around line 198):

```astro
    <ViewTransitions />
  </head>
```

- [ ] **Step 3: Add `transition:name` to the main content wrapper**

Find the line in `<body>` that reads:

```astro
    <div style="flex:1">
```

Change it to:

```astro
    <div style="flex:1" transition:name="main-content">
```

- [ ] **Step 4: Add the IntersectionObserver script**

Add the following inline `<script>` block at the very end of `<body>`, immediately before `</body>`:

```astro
    <script>
      function initReveal() {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );
        document.querySelectorAll(".reveal:not(.visible)").forEach((el) =>
          observer.observe(el)
        );
      }

      // Run on first load
      initReveal();

      // Re-run after each View Transitions navigation
      document.addEventListener("astro:page-load", initReveal);
    </script>
```

- [ ] **Step 5: Verify build and check for TS errors**

```bash
cd apps/client && pnpm build 2>&1 | tail -20
```

Expected: build succeeds, no TypeScript or Astro errors.

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/layouts/Layout.astro
git commit -m "feat: add Astro View Transitions and IntersectionObserver reveal script to Layout"
```

---

## Task 3: Add scroll reveal to PostCard

**Files:**
- Modify: `apps/client/src/components/home/PostCard.svelte`

- [ ] **Step 1: Add `reveal` class and stagger delay to the root `<article>`**

In `apps/client/src/components/home/PostCard.svelte`, find the root element (line 60):

```svelte
<article
  style="transform: {articleTransform};"
  class="post-card"
```

Change it to:

```svelte
<article
  style="transform: {articleTransform}; --reveal-delay: {Math.min(index, 4) * 0.05}s"
  class="post-card reveal"
```

This sets `--reveal-delay` to 0s for index 0, 0.05s for index 1, up to 0.2s for index 4+, creating a staggered cascade for the first 5 cards. Cards beyond index 4 all share the same 0.2s max delay.

- [ ] **Step 2: Verify build**

```bash
cd apps/client && pnpm build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/home/PostCard.svelte
git commit -m "feat: add scroll reveal with stagger delay to PostCard"
```

---

## Task 4: Add scroll reveal to ArticleCard

**Files:**
- Modify: `packages/ui/components/cards/ArticleCard.svelte`

- [ ] **Step 1: Add `reveal` class to the root `<a>` element**

In `packages/ui/components/cards/ArticleCard.svelte`, find the root element (line 24):

```svelte
<a {href} class="group flex flex-col items-start">
```

Change it to:

```svelte
<a {href} class="group flex flex-col items-start reveal">
```

- [ ] **Step 2: Verify build**

```bash
cd apps/client && pnpm build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/components/cards/ArticleCard.svelte
git commit -m "feat: add scroll reveal class to ArticleCard"
```

---

## Task 5: Add scroll reveal to MascotHero and NewsletterBar

**Files:**
- Modify: `apps/client/src/components/home/MascotHero.svelte`
- Modify: `apps/client/src/components/home/NewsletterBar.svelte`

- [ ] **Step 1: Add `reveal` to MascotHero root element**

In `apps/client/src/components/home/MascotHero.svelte`, find the root element (line 41):

```svelte
<div class="mascot-wrap" aria-hidden="true">
```

Change it to:

```svelte
<div class="mascot-wrap reveal" aria-hidden="true">
```

- [ ] **Step 2: Add `reveal` to NewsletterBar root element**

In `apps/client/src/components/home/NewsletterBar.svelte`, find the root element (line 100):

```svelte
<aside aria-label="Newsletter signup" class="newsletter-wrap">
```

Change it to:

```svelte
<aside aria-label="Newsletter signup" class="newsletter-wrap reveal">
```

- [ ] **Step 3: Verify build**

```bash
cd apps/client && pnpm build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/components/home/MascotHero.svelte apps/client/src/components/home/NewsletterBar.svelte
git commit -m "feat: add scroll reveal to MascotHero and NewsletterBar"
```

---

## Task 6: Add scroll reveal to static pages

**Files:**
- Modify: `apps/client/src/pages/about.astro`

- [ ] **Step 1: Add `reveal` to the about page main content div**

In `apps/client/src/pages/about.astro`, find the inner wrapper (line 20):

```astro
      <div style="animation:fadeIn 0.2s ease">
```

Change it to:

```astro
      <div class="reveal" style="animation:none">
```

The `animation:none` inline style removes the old `fadeIn` that was hardcoded; the `.reveal.visible` animation replaces it.

- [ ] **Step 2: Verify the about page builds and displays correctly**

```bash
cd apps/client && pnpm build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/about.astro
git commit -m "feat: replace hardcoded fadeIn with reveal class on about page"
```

---

## Task 7: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
cd /path/to/blabbun && pnpm dev:client
```

Open `http://localhost:4321` in a browser.

- [ ] **Step 2: Verify page transitions**

Navigate from home → a post → archive → about. Each navigation should fade out/in smoothly (~0.15s). The navbar should remain stable (no flash or re-animation).

- [ ] **Step 3: Verify scroll reveals on home page**

Reload the home page. Post cards below the fold should be invisible initially (opacity 0). Scroll down — each card should fade up into place, with the first 5 staggering by 0.05s each.

The `MascotHero` (visible above the fold on load) will appear immediately once the observer fires — if it's already 15% in the viewport on load, it triggers instantly.

The `NewsletterBar` should fade in as you scroll past the post list.

- [ ] **Step 4: Verify reduced motion**

In your OS or browser, enable "Reduce motion". Reload. All elements should appear immediately with no animation.

Mac: System Settings → Accessibility → Display → Reduce Motion ON.

- [ ] **Step 5: Verify no flash on navigation back/forward**

Use the browser's Back button after visiting a post. The main content should fade in — `.reveal` elements that were already `.visible` (due to the `:not(.visible)` selector on re-init) won't re-animate.
