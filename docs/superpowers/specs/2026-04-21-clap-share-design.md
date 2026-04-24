# Clap + Share Bar — Design Spec

**Date:** 2026-04-21
**Status:** Approved

## Overview

Add a clap (like) button and share buttons to every blog post detail page. The bar appears below the article content and above the Related Posts section.

## Component

**File:** `apps/client/src/components/post/ClapShare.svelte`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `postSlug` | `string` | Used as the localStorage key; will become the DB key when backend is wired up |
| `postUrl` | `string` | Full URL of the post, used in share links |
| `postTitle` | `string` | Post title, used in the X/Twitter share text |

## Layout (Option B — Centered Stack)

```
─────────────────────────────────────
        [ 👏  Clap · 24 ]
     SHARE THIS POST
  [ f ]  [ 𝕏 ]  [ 🔗 ]
─────────────────────────────────────
```

- Centered, `max-w-[760px]` container matching the article body
- Top border: `2px solid #c5f7d0`
- Padding: `pt-10 pb-12`
- Clap pill: `bg-[#ebf3ed]`, rounded-full, green text `#386547`, bold
- "Share this post" label: `11px`, `tracking-[0.12em]`, uppercase, muted
- Share icons: `38px` circle buttons, `bg-[#ebf3ed]`, green icon color

## Clap Behavior

- **Storage (mock):** `localStorage` key `clap_${postSlug}` → `{ count: number, clapped: boolean }`
- **Seed value:** 12 (so the count doesn't start at zero on first load)
- **Toggle:** Click once → clapped = true, count +1, button fills green. Click again → clapped = false, count -1
- **Animation:** Brief scale pulse on click (`transform: scale(1.15)` then back)
- **Future:** Replace localStorage read/write with Supabase calls; props interface stays the same

## Share Buttons

| Button      | Action                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------ |
| Facebook    | Opens `https://www.facebook.com/sharer/sharer.php?u={postUrl}` in new tab                  |
| X / Twitter | Opens `https://twitter.com/intent/tweet?url={postUrl}&text={postTitle}` in new tab         |
| Copy Link   | `navigator.clipboard.writeText(postUrl)` → button label changes to "Copied!" for 2 seconds |

## Placement in `[slug].astro`

Insert between `</article>` and the Related Posts `<section>`:

```astro
<ClapShare
  client:load
  postSlug={post.id}
  postUrl={`https://blabbun.com/${post.id}`}
  postTitle={post.data.title}
/>
```

## Out of Scope

- Real database integration (future work)
- LinkedIn or other share targets
- Multiple claps per user (Medium-style) — simple toggle only for now
