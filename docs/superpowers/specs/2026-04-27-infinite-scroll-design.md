# Infinite Scroll for Post Lists

**Date:** 2026-04-27
**Status:** Approved

## Overview

Add scroll-sentinel infinite loading to all post list pages in the client app. All post metadata is fetched at SSR time (unchanged); only the number of rendered items grows as the user scrolls. Uses `svelte-intersection-observer` to watch a sentinel element at the bottom of each list.

## Package

Install `svelte-intersection-observer` in `apps/client`:

```
pnpm add svelte-intersection-observer --filter @blabbun/client
```

## Architecture

### Shared component: `InfiniteScroll.svelte`

Location: `apps/client/src/components/InfiniteScroll.svelte`

Props:
- `hasMore: boolean` — whether more items exist beyond the current visible count
- `onLoadMore: () => void` — callback fired when sentinel enters the viewport

Behavior:
- Renders a sentinel `div` at the bottom of the list
- Uses `svelte-intersection-observer` to fire `onLoadMore` when sentinel is visible
- Shows a minimal loading indicator (3 animated dots, site style) when `hasMore` is true and sentinel is visible
- Renders a `— end —` line when `hasMore` is false

### Home feed: new `HomeFeed.svelte`

Location: `apps/client/src/components/home/HomeFeed.svelte`

The home page currently renders posts as plain Astro HTML with a `<script>` tag for tag filtering. Since `$state` requires a Svelte component, the post list and tag filter logic are extracted into `HomeFeed.svelte`.

Props: `feedItems: FeedItem[]`, `allTags: string[]`

State:
- `visibleCount = $state(10)`
- `activeTag = $state('all')`

Derived:
- `filtered` — items matching `activeTag`
- `visible` — `filtered.slice(0, visibleCount)`
- `hasMore` — `visibleCount < filtered.length`

`visibleCount` resets to `10` whenever `activeTag` changes.

The `index.astro` page passes all `feedItems` and `allTags` to `HomeFeed` and removes the inline `<script>` tag.

### Archive + Topics: update `ArchiveList.svelte`

Location: `apps/client/src/components/archive/ArchiveList.svelte`

Add to existing state:
- `visibleCount = $state(10)`

Derived:
- `visible` — `filtered.slice(0, visibleCount)` (replaces direct `filtered` in the `{#each}`)
- `hasMore` — `visibleCount < filtered.length`

`visibleCount` resets to `10` whenever `activeTag`, `sort`, or `month` changes.

Place `<InfiniteScroll {hasMore} onLoadMore={() => (visibleCount += 10)} />` after the `{#each}` block.

No changes needed to `archive.astro` or `topics/[tag].astro` — they already pass all posts to `ArchiveList`.

## Behavior

| Scenario | Behavior |
|---|---|
| Initial load | 10 items rendered |
| Scroll to bottom | +10 items revealed per trigger |
| Filter / sort change | `visibleCount` resets to 10 |
| All items visible | Sentinel hidden, "— end —" shown |

## Loading indicator

Three animated dots (`· · ·`) using a CSS `@keyframes` fade pulse, matching the site's minimal typographic style. No spinner icon. Shown only while `hasMore` is true.

## Files changed

| File | Action |
|---|---|
| `apps/client/package.json` | Add `svelte-intersection-observer` |
| `apps/client/src/components/InfiniteScroll.svelte` | New |
| `apps/client/src/components/home/HomeFeed.svelte` | New |
| `apps/client/src/pages/index.astro` | Replace post list + script with `<HomeFeed>` |
| `apps/client/src/components/archive/ArchiveList.svelte` | Add `visibleCount` state + `InfiniteScroll` |

## Out of scope

- Server-side / API pagination
- Virtualization
- "Load more" button fallback
- Any changes to admin app
