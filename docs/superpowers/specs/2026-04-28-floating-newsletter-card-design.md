# Floating Newsletter Card — Design Spec

**Date:** 2026-04-28  
**Status:** Approved

## Overview

Add a floating newsletter signup card to the blog post reading page (`[slug].astro`). On desktop it sits fixed to the right edge of the viewport; on mobile it becomes a slim sticky bar at the bottom of the screen.

## Behavior

### Visibility trigger
- Hidden on initial load.
- Becomes visible after the user scrolls past ~30% of the article height.
- Dismissible via a `×` button. Dismissal is persisted in `localStorage` keyed by post slug so it doesn't reappear on the same post.

### States
1. **Hidden** — before scroll threshold or after dismiss
2. **Visible** — card/bar shown, form ready
3. **Submitting** — button shows `…`
4. **Success** — message "you're in. check your inbox." replaces the form; card auto-hides after 3s
5. **Error** — inline error message, form remains

## Layout

### Desktop (≥ 768px)
- `position: fixed`, right edge of viewport, vertically centered (`top: 50%; transform: translateY(-50%)`)
- Width: ~220px
- Contains: short headline, one-line description, email input, subscribe button, `×` dismiss
- Slides in from the right with a CSS transition

### Mobile (< 768px)
- `position: fixed`, bottom of viewport (`bottom: 0; left: 0; right: 0`)
- Single row: label + email input + subscribe button
- Slim height (~52px), no dismiss button (scrolls away naturally as user leaves the page)

## Component

**File:** `apps/client/src/components/post/FloatingNewsletter.svelte`

- Svelte 5 runes (`$state`, `$effect`, `$props`)
- Props: `postSlug: string` (used for per-post dismiss key)
- Reuses the same `/api/newsletter` POST endpoint and rate-limit logic already in `NewsletterBar.svelte` — copy the minimal submit function, do not import from NewsletterBar
- Added to `[slug].astro` with `client:load`

## Styling

Matches site design system:
- Background: `var(--bg2)`
- Border: `1px solid var(--border)`
- Button: `var(--accent)`
- Text: `var(--text)` / `var(--muted)`
- Font: `inherit` (monospace)
- Border-radius: `4px` (card), `3px` (inputs/button)
- Entry animation: slide in from right on desktop, slide up from bottom on mobile

## Integration

- Import and render `<FloatingNewsletter client:load postSlug={post.id} />` inside `[slug].astro`, outside the `<main>` element (so it overlays the full viewport correctly)
- No changes needed to any other page or component
