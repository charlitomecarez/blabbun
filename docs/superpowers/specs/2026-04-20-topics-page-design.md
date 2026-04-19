# Topics Page — Design Spec

**Date:** 2026-04-20
**Status:** Approved

## Overview

Two new routes for browsing posts by topic. The index lists all tags; each tag links to a filtered post list that reuses the existing archive layout.

## Routes

| Route           | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `/topics`       | Static index listing all tags with post counts             |
| `/topics/[tag]` | Filtered post list for a single tag, reusing `ArchiveList` |

## `/topics` — Index Page

### File

`apps/client/src/pages/topics/index.astro`

### Layout

- Page header: "Topics." title (matching archive/homepage heading style) + subtitle showing total topic count
- Below the header: a `border-b-2 border-[#c5f7d0]` section divider with "ALL TOPICS" label
- Vertical list, one row per tag. Each row:
  - Tag pill (`bg-[#ebf3ed] text-[#386547]`, uppercase)
  - Topic name (medium weight)
  - Post count (muted)
  - Entire row is a link to `/topics/[tag]`
- Rows separated by `border-b border-[rgba(197,247,208,0.4)]`

### Data

- Loads all non-draft posts via `getCollection`
- Derives tags: deduped, uppercased, sorted alphabetically
- For each tag: counts matching posts

---

## `/topics/[tag]` — Tag Detail Page

### File

`apps/client/src/pages/topics/[tag].astro`

### Layout

- Back link: `← Topics` linking to `/topics`
- Tag pill badge
- Page title: the tag name + `<span class="text-[#ccf05f]">.</span>`
- Post count subtitle
- `<ArchiveList>` with `lockedTag` set — filter pills hidden, sort dropdown visible, posts pre-filtered to this tag

### Data

- `getStaticPaths`: one path per unique tag found across all non-draft posts
- Each path loads only the posts matching that tag, serialized to the `PostItem` shape (same as `archive.astro`)
- `allTags` passed to `ArchiveList` is empty (`[]`) since pills are hidden when locked

---

## `ArchiveList.svelte` Change

Add optional `lockedTag?: string` prop.

**Behaviour when `lockedTag` is set:**

- `activeTag` is initialized to `lockedTag` instead of `"all"`
- The filter pill row (`div.flex.flex-wrap.gap-2`) is not rendered
- `activeTag` cannot be changed by the user (no pills to click)
- Sort dropdown remains visible and functional

**Behaviour when `lockedTag` is absent (default):**

- Existing behaviour unchanged — "All" pill + tag pills rendered, fully interactive

---

## Visual Style

Matches existing patterns throughout:

- Heading: `font-space-grotesk text-[38px] font-bold tracking-[-0.04em] text-[#2d5a3d]`
- Section label: `font-manrope text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase`
- Back link: `font-manrope text-[13px] font-semibold text-[rgba(41,48,45,0.5)] hover:text-[#386547]` (same as `[slug].astro` footer back-link)
- Tag pill on detail page: `bg-[#ccf05f] text-[#29302d]` (featured/active pill style)

---

## Constraints

- No pagination
- No search
- No tag descriptions (tags are derived purely from frontmatter — no separate tag metadata)
- Tag slug in the URL is the raw lowercase frontmatter value (e.g. `opinion`, `personal`, `meta`)
- `ArchiveList` tag comparison uses uppercase throughout (`p.tag === activeTag`) — `lockedTag` must be passed as uppercase to match
