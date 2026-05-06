# Interactive Reading Experience — Design Spec

**Date:** 2026-05-07  
**Status:** Approved  

## Problem

Post pages feel flat mid-scroll. Readers lose momentum and scroll away before finishing. Even readers who finish don't feel enough connection to the content to react or return.

## Goal

Add lightweight interactive moments throughout the reading experience — playful enough to break scroll monotony, useful enough to let engaged readers act on what resonates. No new API routes. All client-side.

---

## Architecture

Four new Svelte 5 components. All use `client:visible` or `client:idle` hydration. No MDX author changes required.

### Component placement

| Component | Package | Hydration |
|---|---|---|
| `ReadingDots` | `packages/ui/components/post/` | `client:idle` |
| `MidScrollReaction` | `packages/ui/components/post/` | `client:visible` |
| `CheckpointDividers` | `apps/client/src/components/post/` | `client:idle` |
| `QuotePopover` | `apps/client/src/components/post/` | `client:idle` |

All four are mounted in `apps/client/src/pages/[slug].astro`. Each receives `slug` (post id) as a prop where needed for localStorage namespacing.

---

## Components

### ① ReadingDots

**File:** `packages/ui/components/post/ReadingDots.svelte`  
**Props:** `slug: string`

A sticky column of dots on the left side of the content column (desktop only, hidden below 768px). Each dot represents one `h2` section in the article.

**Behavior:**
- On mount: query all `h2` elements inside `.post-content` and build a section list
- `IntersectionObserver` on each `h2` tracks which section is active
- Active dot = `var(--accent)`; past dots = faded accent (0.4 opacity); upcoming = `var(--muted)`
- Hover on a dot shows a tooltip with the section title
- Click a dot smooth-scrolls to that section
- Component renders nothing if the post has 0 or 1 `h2`
- Positioned fixed, left-aligned relative to the 680px content column; offset adjusts on scroll

---

### ② MidScrollReaction

**File:** `packages/ui/components/post/MidScrollReaction.svelte`  
**Props:** `slug: string`

An inline block (not floating) that fades in at ~50% scroll progress and presents the same 5 emoji reactions as the existing `ReactionBar`.

**Behavior:**
- Listens to `scroll` (passive) on `window`; triggers when `scrollPct >= 50`
- Fades in with a short opacity + translateY transition
- Displays: `"thoughts so far? →"` (Caveat font, `var(--accent)` color) + 5 emoji pills + `×` dismiss
- Reacting picks an emoji, updates the same localStorage keys used by `ReactionBar` (`bb-reaction-{slug}-{label}`, `bb-reaction-mine-{slug}`), so the bottom bar reflects the mid-article pick instantly
- After reacting or dismissing: fades out, sets `bb-midreact-done-{slug}` in localStorage — never re-shows for that post
- Minimum scroll depth before showing: 50%; will not show if reader has already reacted (checks `bb-reaction-mine-{slug}` on mount)

---

### ③ CheckpointDividers

**File:** `apps/client/src/components/post/CheckpointDividers.svelte`  
**Props:** none (reads DOM directly)

Injects animated accent dividers before each `h2` in `.post-content`. Each divider animates in on scroll. No MDX changes required.

**Behavior:**
- On mount: query all `h2` elements in `.post-content`
- For each `h2`, insert a checkpoint `<div>` immediately before it in the DOM
- Initial state: `opacity: 0; transform: translateY(8px)`
- `IntersectionObserver` (threshold 0.5) triggers the reveal: `opacity: 1; transform: translateY(0)` with a 0.4s ease transition
- Each divider is a horizontal accent gradient line with a centered Caveat-font message
- Messages rotate through a fixed pool (assigned by index, not random, so they're consistent on re-visit):
  1. `"✶ still here? respect. ✶"`
  2. `"✶ you're still going, love that. ✶"`
  3. `"✶ halfway through the blab. ✶"`
  4. `"✶ getting to the good part → ✶"`
  5. `"✶ almost there. keep going. ✶"` (loops if more h2s than messages)
- No-op if post has no `h2` elements
- `prefers-reduced-motion`: skips the transition, dividers appear immediately

---

### ④ QuotePopover

**File:** `apps/client/src/components/post/QuotePopover.svelte`  
**Props:** `slug: string`, `title: string`

A small dark popover that appears above selected text within the article body. Two actions: save quote to localStorage, or copy a shareable string to clipboard.

**Behavior:**
- Listens to `selectionchange` on `document`; checks that the selection is inside `.post-content`
- Minimum selection length: 10 characters; maximum: 280 characters
- Popover positions above the selection using `Range.getBoundingClientRect()` + `window.scrollY`
- **Save quote:** stores `{ text, slug, title, savedAt: ISO string }` to localStorage under key `bb-quotes` (JSON array, max 50 entries, oldest pruned on overflow)
- **Share:** copies `"[quote]"\n— blabbun.com/[slug]` to clipboard via `navigator.clipboard.writeText`; button label flashes to `"copied!"` for 1.5s then reverts
- Hides on: click outside the popover, `selectionchange` to empty, `Escape` key
- When visible and `Escape` is pressed: close the popover, call `e.stopPropagation()` to prevent the existing `history.back()` listener in `[slug].astro` from firing. When the popover is not visible, `Escape` passes through normally.

---

## [slug].astro — mount points

```astro
<!-- existing -->
<ReadingProgress client:idle />

<!-- new -->
<ReadingDots client:idle slug={post.id} />
<MidScrollReaction client:visible slug={post.id} />

<!-- inside the article div, after <Content /> -->
<CheckpointDividers client:idle />
<QuotePopover client:idle slug={post.id} title={post.data.title} />
```

---

## localStorage key summary

| Key | Component | Purpose |
|---|---|---|
| `bb-reaction-{slug}-{label}` | MidScrollReaction + ReactionBar | Reaction count (shared) |
| `bb-reaction-mine-{slug}` | MidScrollReaction + ReactionBar | Which emoji the user picked |
| `bb-midreact-done-{slug}` | MidScrollReaction | Prevent re-showing prompt |
| `bb-quotes` | QuotePopover | JSON array of saved quotes |

---

## Out of scope

- Saved quotes view/page (future)
- Server-side reaction persistence (existing ReactionBar is already local-only)
- Mobile version of ReadingDots (hidden below 768px)
- Analytics/tracking for mid-scroll reactions
