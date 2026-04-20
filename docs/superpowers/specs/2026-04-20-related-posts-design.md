# Related Posts Section Design

**Date:** 2026-04-20
**Status:** Approved

## Overview

A "More from The Lunan" section rendered below the article footer on every blog post page. Shows 3 randomly selected posts (excluding the current one), each as a card with image, tag, title, and excerpt. Randomized at build time — static, no client-side logic.

## Placement

In `apps/client/src/pages/[slug].astro`, immediately after the closing `</article>` tag and before the closing `</div>` of the page wrapper.

## Selection Logic

At build time in the Astro frontmatter:

1. Fetch all non-draft posts
2. Filter out the current post by `post.id`
3. Shuffle the remaining posts using a Fisher-Yates shuffle
4. Take the first 3

## Card Layout

- **Grid:** `grid grid-cols-1 md:grid-cols-3 gap-6`
- **Each card:** white background, `rounded-[12px]`, `border border-[rgba(197,247,208,0.4)]`, hover lift (`hover:shadow-md transition-shadow`)
- **Image area:** fixed height `h-[140px]`, `object-cover`, `rounded-t-[12px]`. If post has no image, show a green gradient placeholder (`bg-gradient-to-br from-[#c5f7d0] to-[#e1eae5]`)
- **Card body:** `p-4`, tag pill + title + excerpt
  - Tag pill: same style as post page footer tag (`bg-[#ebf3ed] text-[#386547]`)
  - Title: Space Grotesk, `font-bold`, `text-[16px]`, 2-line clamp, links to post
  - Excerpt: Manrope, `text-[13px]`, muted, 2-line clamp

## Section Header

```html
<div class="mb-6 border-t-2 border-[#c5f7d0] pt-8">
  <span
    class="font-manrope text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase"
  >
    More from The Lunan
  </span>
</div>
```

Same style as the "LATEST ENTRIES" header on the homepage.

## Architecture

- No new component — inline markup in `[slug].astro`
- No new files
- Shuffle utility: inline arrow function in the frontmatter (no import needed)
- Color palette: existing tokens only

## Out of Scope

- Tag-based relevance matching
- Client-side re-randomization on refresh
- "Read more" button / pagination
