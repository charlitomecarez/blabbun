# Search Feature Design

**Date:** 2026-04-20
**Status:** Approved

## Overview

Client-side live search triggered from the navbar search button. Opens a dropdown panel below the navbar. Filters posts as you type against title, description, and tags. No external dependencies.

## Architecture

**Data layer:** Astro API endpoint (`search.json.ts`) generates a static JSON index at build time containing all published posts. Fetched once by the dropdown on first open, cached in memory for the session.

**UI layer:** A `SearchDropdown.svelte` component renders the panel. It is mounted in `Layout.astro` and controlled by a `searchOpen` boolean. The Navbar receives an `onSearchToggle` callback prop to open/close it.

## Files

| File                                                      | Purpose                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/client/src/pages/search.json.ts`                    | Astro endpoint — exports all non-draft posts as JSON                 |
| `apps/client/src/components/search/SearchDropdown.svelte` | Dropdown panel — input, live filter, results, manages own open state |
| `packages/ui/components/layouts/Navbar.svelte`            | Search button dispatches `search:toggle` custom DOM event            |
| `apps/client/src/layouts/Layout.astro`                    | Mount `SearchDropdown` with `client:load`                            |

## Search Index Shape

```ts
type SearchEntry = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  image?: string;
};
```

## SearchDropdown Behaviour

- **Position:** `fixed`, `top: 64px`, full-width, max-width `680px`, centered, `mx-4` horizontal margin on mobile so it never bleeds to the edge
- **On mobile (`< md`):** full-width minus `mx-4` margins, input font size `16px` minimum to prevent iOS auto-zoom
- **On mount:** fetch `/search.json`, cache result, auto-focus input
- **Filtering:** case-insensitive match on title + description + tags joined as a single string
- **Results:** show up to 5 matches as mini cards (tag pill + title + excerpt snippet); excerpt truncated to 1 line on mobile, 2 lines on desktop
- **Empty state:** "No results for '…'" when query has no matches
- **Default state:** show nothing (no query = no results shown, just the input)
- **Close triggers:** Escape key, click outside the dropdown, clicking a result

## Navbar Changes

The search button dispatches a `search:toggle` custom DOM event (`bubbles: true`) instead of doing nothing. No new props needed — keeps `packages/ui` decoupled from app-level state.

```svelte
<button
  onclick={() =>
    window.dispatchEvent(new CustomEvent("search:toggle", { bubbles: true }))}
>
  <!-- search icon -->
</button>
```

## SearchDropdown Changes

`SearchDropdown.svelte` manages its own `open` boolean state. On mount it listens for `search:toggle` on `window` and toggles `open`. When open it auto-focuses the input and fetches `/search.json` (cached after first fetch).

## Layout Changes

Simply mount the dropdown once — it self-manages visibility:

```astro
<Navbar client:load links={navLinks} />
<SearchDropdown client:load />
```

## Out of Scope

- Full-text body search
- Search results page (`/search?q=...`)
- Keyboard navigation within results (arrow keys)
- Search history / recent searches
