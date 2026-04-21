# Scroll-to-Top Button Design

**Date:** 2026-04-21  
**Status:** Approved

## Overview

Add a fixed scroll-to-top button to the global layout so users can return to the top of any page with a single click.

## Component

**File:** `apps/client/src/components/layouts/ScrollToTop.svelte`

- Svelte component, consistent with how `SearchDropdown` is placed in `Layout.astro`
- Imported in `Layout.astro` with `client:load`

## Behavior

- Hidden on initial load
- Appears after the user scrolls down **300px**
- Smooth CSS fade transition on show/hide (`opacity` + `pointer-events`)
- On click: `window.scrollTo({ top: 0, behavior: 'smooth' })`
- Uses `window` scroll event listener; cleaned up on component destroy

## Appearance

- **Position:** Fixed, bottom-right corner — `bottom-6 right-6`
- **Shape:** Round button (`rounded-full`), ~44px
- **Colors:** Site palette — background `#ebf3ed`, border `rgba(197,247,208,0.5)`, icon `#386547`
- **Icon:** Upward chevron/arrow SVG (inline, no dependency)
- **Hover:** Slight background darkening, consistent with other interactive elements

## Integration

No changes to the `packages/ui` package — this lives in `apps/client` only.  
`Layout.astro` adds one import and one tag alongside `<SearchDropdown client:load />`.
