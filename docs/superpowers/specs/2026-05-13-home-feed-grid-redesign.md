# Home Feed Grid Redesign

**Date:** 2026-05-13  
**Status:** Approved

## Overview

Replace the current single-column infinite-scroll feed with a two-section layout:

1. **Grid section** — featured latest post (left, dark hero card) + 3 compact cards (right)
2. **Listing section** — remaining posts as standard rows with a "load more" button

---

## Layout Structure

### Section 1 — Grid (always visible above fold)

Two-column CSS grid: `1.5fr 1fr`

**Left column — Featured hero card**
- Dark background (`#1a1008` / dark mode base)
- Accent gradient overlay (top-left, subtle)
- Absolute badges: `🚀 LATEST` pill (top-left, accent orange) + tag pill (top-right)
- Post number + date (muted, small)
- Large title (white, 16–18px)
- Excerpt (muted, 10–11px, 2 lines)
- Read time + view count row
- Action row: 👏 clap pill, 💬 comment count pill, 🔖 bookmark pill, `read →` CTA button

**Right column — "also fresh" compact cards (3 posts)**
- Section label: "also fresh" (uppercase, muted)
- Each card: white/light background, `1px solid var(--border)` border, `6px` border-radius
- Card contents: date + tag badge + post number, title (12px, semibold), 1-line excerpt, stat row (read time · claps · comments · bookmark)
- No "load more" inside this column

### Section 2 — Listing (below grid)

Separated by a dashed `<hr>`-style divider with centred "more posts" label.

- Standard `PostCard` rows (existing component, no change to its internals)
- Initially shows posts 5–14 (posts 2–4 are in the grid's right column, post 1 is the hero)
- "↓ load more posts" button at the bottom — clicking appends 10 more rows

---

## Component Changes

### `HomeFeed.svelte` — primary change

Current structure:
- Sort toggle → tag filter → infinite-scroll list

New structure:
- Sort toggle + tag filter remain
- When sort = `newest` and filter = `all`: render grid section + listing section
- When sort = `oldest` OR filter ≠ `all`: collapse to single-column listing only (grid is newest-first only)
- New derived: `featuredPost` = `filtered[0]`, `sidebarPosts` = `filtered[1..3]`, `listingPosts` = `filtered[4..]`
- `visibleCount` starts at 10 (controls listing section pagination)
- Replace `InfiniteScroll` with a manual "load more" button

### New component — `FeaturedCard.svelte` (in `apps/client/src/components/home/`)

Self-contained dark hero card. Props mirror `PostCard` props. Fetches its own clap/hasClapped state via `onMount` (same pattern as `PostCard`). Includes the `BookmarkButton`.

### `PostCard.svelte` — no structural changes

Used as-is for both the right-column compact cards and the listing rows. The right-column cards are slightly more compact via a `compact` boolean prop that reduces padding and font sizes via a CSS class.

---

## Data Flow

All data already flows through `feedItems` from `index.astro`. No new API endpoints needed. The `featuredPost` / `sidebarPosts` / `listingPosts` split is purely derived state in `HomeFeed`.

---

## Responsive behaviour

- **≥ 768px**: grid layout as described
- **< 768px**: stack vertically — featured hero full width, 3 sidebar cards stacked below it, then listing section

---

## What doesn't change

- Tag filter and sort toggle
- `PostCard` internals (clap toggle, bookmark, stats)
- `index.astro` data fetching
- All other pages
