# Archive Page — Design Spec

**Date:** 2026-04-20
**Status:** Approved

## Overview

A `/archive` page for Blab Bun blog that displays all published posts with client-side tag filtering and sort order control. Posts are grouped by month.

## Route

`/archive` — static Astro page, all data loaded at build time.

## Layout

Page header with "Archive" title and total post count. Below that:

- **Tag filter pills** — "All" pill (active by default) plus one pill per unique tag collected from all posts, sorted alphabetically. Clicking a pill filters the list to posts with that tag.
- **Sort dropdown** — "Newest first" (default) / "Oldest first". Controls the order within and across month groups.
- **Post list** — posts grouped by month+year (e.g. "April 2026"). Each group shows a small uppercase month label (matching the homepage "LATEST ENTRIES" style) followed by post rows.
- Each post row uses the existing `FeedItem` component from `@blabbun/ui`.

## Components

### `src/pages/archive.astro`

Static Astro page. Responsibilities:

- Loads all non-draft posts via `getCollection("posts")` at build time
- Collects unique tags from all posts, deduped and alphabetically sorted
- Serializes posts to a plain array prop and passes it to `ArchiveList`
- Renders page shell using the existing `Layout` component

### `src/components/archive/ArchiveList.svelte`

Interactive Svelte component (`client:load`). Responsibilities:

- Accepts `posts` and `tags` as props
- Owns `activeTag` (string, default `"all"`) and `sortOrder` (`"newest"` | `"oldest"`) state
- Derives `filteredPosts` by applying tag filter then sort
- Groups `filteredPosts` by `month YYYY` label
- Renders tag pills, sort dropdown, and grouped post list using `FeedItem`

## Data Shape

Each post passed to `ArchiveList`:

```ts
{
  title: string;
  description: string;
  pubDate: string; // toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
  pubDateRaw: string; // ISO string for sort comparisons
  monthGroup: string; // e.g. "April 2026" — for grouping
  tag: string; // first tag uppercased, or "EDITORIAL"
  href: string; // /<post.id>
}
```

## Visual Style

Matches existing homepage patterns:

- Month group header: `font-manrope text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase` with a `border-b-2 border-[#c5f7d0]`
- Tag pills: `bg-[#ebf3ed] text-[#386547]` inactive, `bg-[#386547] text-[#ccf05f]` active
- Sort dropdown: matches existing border/font style used in the site
- Post count: small muted subtitle beneath the page title

## Constraints

- No pagination — all posts shown (appropriate for a personal blog with modest post count)
- No URL state for filters — filter state is ephemeral, resets on navigation
- No search — out of scope
