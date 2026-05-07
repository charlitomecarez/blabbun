# Smooth Scroll Animation Design

**Date:** 2026-05-08  
**Scope:** `apps/client` only (admin is internal tooling)  
**Approach:** Astro View Transitions + CSS IntersectionObserver reveals

---

## 1. Page Transitions

### What
Add Astro's built-in `<ViewTransitions />` component to the `<head>` of `apps/client/src/layouts/Layout.astro`. This enables a default `fade` animation on every client-side navigation — 0.15s fade out, 0.15s fade in.

### Implementation
- Import and render `<ViewTransitions />` inside `<head>` in `Layout.astro`
- Add `transition:name="navbar"` to the `<Navbar>` component so it persists visually across pages without re-animating
- Add `transition:name="main-content"` to the `<div style="flex:1">` wrapper around `<slot />`
- No new packages required — `astro:transitions` is built into Astro 6

### Accessibility
- Astro automatically scopes view transition animations to `::view-transition-*` pseudo-elements, which browsers skip when `prefers-reduced-motion: reduce` is set
- No additional CSS required for this

---

## 2. Scroll-triggered Element Reveals

### What
Elements animate from `opacity: 0, translateY: 16px` to their natural position when 15% of them enters the viewport. Fire-once — they do not re-animate on scroll up.

### CSS (`packages/ui/styles/global.css`)
Add to the `@layer base` block:

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

### Script (`apps/client/src/layouts/Layout.astro`)
Add an inline `<script>` at the bottom of `<body>`:

```js
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

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
```

Because Astro View Transitions does client-side navigation, the observer must also re-run after each navigation. This is handled by listening to the `astro:page-load` event:

```js
document.addEventListener("astro:page-load", () => {
  document.querySelectorAll(".reveal:not(.visible)").forEach((el) =>
    observer.observe(el)
  );
});
```

### Elements that receive `.reveal`

| Component | File | Notes |
|-----------|------|-------|
| `PostCard` | `apps/client/src/components/home/PostCard.svelte` | Root element |
| `ArticleCard` | `apps/client/src/components/home/ArticleCard.svelte` | Root element |
| `MascotHero` | `apps/client/src/components/home/MascotHero.svelte` | Root element |
| `NewsletterBar` | `apps/client/src/components/home/NewsletterBar.svelte` | Root element |
| Static page sections | `about.astro`, `now.astro`, `changelog.astro`, etc. | Wrapper `<section>` or `<div>` |

### Stagger
List parents (e.g. `HomeFeed`, archive list) set `--reveal-delay` on each child via an inline `style` prop, incrementing by `0.05s` per item (capped at 5 items to avoid long waits). Example: item 0 → `0s`, item 1 → `0.05s`, item 2 → `0.1s`.

This is done in the parent component's template, not in JS, so it works with SSR.

---

## Constraints

- No new npm packages
- Both features respect `prefers-reduced-motion`
- Admin app is untouched
- View Transitions only applies to the client Astro app; Svelte components inside it benefit automatically
