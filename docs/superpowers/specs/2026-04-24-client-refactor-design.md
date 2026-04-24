# Design: Client & Packages Refactor

**Date:** 2026-04-24  
**Branch:** develop  
**Scope:** `apps/client/src` + `packages/utils`  
**Goal:** Eliminate duplication, give each file a single clear purpose, and replace inline style strings with scoped CSS — making the codebase easier to read and maintain.

---

## Section 1: Shared API Helpers

### Problem
`getClient()` and `json()` are copy-pasted into every API route file. `ipHash()` sits inside `claps/[slug].ts` with no clear home.

### Solution
Create `apps/client/src/lib/api.ts` with three named exports:

```ts
/** Returns a Supabase client using the server-side service role key. */
export function getSupabaseClient(): SupabaseClient

/** Serialises data to a JSON Response with correct Content-Type header. */
export function jsonResponse(data: unknown, status?: number): Response

/** Returns a SHA-256 hex digest of the first IP in x-forwarded-for. */
export function hashIp(request: Request): string
```

All three API routes (`claps/[slug].ts`, `comments/[slug].ts`, `newsletter.ts`) drop their local copies and import from this shared module. The `keep-alive.ts` route benefits from `getSupabaseClient()` too.

### Comments policy
JSDoc on every export. Inline comments where the "why" is non-obvious (e.g. why `Math.max(0, count - 1)` guards against negative clap counts).

---

## Section 2: `@blabbun/utils` Expansions

### Problem
- `readTime` calculation is duplicated in `index.astro` and `[slug].astro`
- `anonName()` + word-lists are business logic living inside a UI component
- `tagClass()` is duplicated in `FeedItem.svelte` and `[slug].astro`
- Tag color CSS (light + dark) is copy-pasted in both those files

### New exports added to `packages/utils/src/`

**`readTime.ts`**
```ts
/**
 * Estimates reading time at 200 wpm.
 * Returns "N min read" with a minimum of 1 minute.
 */
export function readTime(text: string): string
```

**`anonName.ts`**
```ts
/** Bun-themed adjectives used for anonymous commenter names. */
export const BUN_ADJS: string[]

/** Bun-themed nouns used for anonymous commenter names. */
export const BUN_NOUNS: string[]

/**
 * Derives a deterministic bun-themed display name from a numeric seed.
 * Used to generate stable anonymous names stored in localStorage.
 */
export function anonName(seed: number): string
```

**`tags.ts`** (extends existing `tagToLabel`)
```ts
/**
 * Maps an uppercase tag key to its scoped CSS class name.
 * Falls back to "tag-default" for unknown tags.
 */
export function tagClass(tag: string): string

/**
 * Complete CSS rule-set for all tag badge colours (light + dark mode).
 * Inject once into a global stylesheet — do not duplicate per component.
 */
export const TAG_COLOR_CSS: string
```

All exports re-exported from `packages/utils/src/index.ts`.

`tagClass()` removed from `FeedItem.svelte` and `[slug].astro`. `TAG_COLOR_CSS` injected once in `apps/client/src/layouts/Layout.astro` via a `<style is:global>` block, replacing the duplicated `<style>` blocks in both files.

---

## Section 3: Splitting `Comments.svelte`

### Problem
`Comments.svelte` is ~233 lines handling fetching, pagination, anon name generation, form submission, and reply dispatch simultaneously. Hard to navigate and test.

### Solution
Split into three focused files under `apps/client/src/components/post/`:

**`CommentForm.svelte`** (~60 lines)
- Props: `postSlug: string`, `yourName: string`, `onSubmit: (body: string) => Promise<void>`
- Owns: `text`, `err`, `posted`, `submitting` state
- Responsible only for the "leave a comment" form UI and calling `onSubmit`
- Does **not** call the API directly — parent provides the handler

**`CommentList.svelte`** (~50 lines)
- Props: `comments: Comment[]`, `activeReplyId: string | null`, `onReplyToggle`, `onReplySubmit`
- Owns: `visibleCount` pagination state and "load more" button
- Renders `CommentItem` per entry

**`Comments.svelte`** (becomes the orchestrator, ~60 lines)
- Owns: API fetching, `comments` array state, `yourName` (read from localStorage + `anonName()`), `activeReplyId`
- Provides `submitComment` and `addReply` handlers to children
- Composes `CommentList` + `CommentForm`
- Only file that touches `/api/comments/`

**`CommentItem.svelte`** — structure unchanged, styles migrated (see Section 4).

---

## Section 4: Inline Styles → Scoped `<style>` Blocks

### Problem
Components use long concatenated inline style strings for structural and typographic rules. This makes components hard to scan and prevents reuse of style rules. `FeedItem.svelte` already uses the correct pattern.

### Solution
Migrate all structural/typographic/spacing rules to named CSS classes in `<style>` blocks. Only truly dynamic values (color based on reactive state, opacity based on `submitting`) stay as inline expressions, and only for those specific properties.

**Components migrated:**

| Component | Key classes added |
|---|---|
| `ClapShare.svelte` | `.clap-wrap`, `.clap-btn`, `.clap-count`, `.share-btn`, `.share-panel`, `.share-link` |
| `Comments.svelte` (orchestrator) | `.comments-section`, `.comment-count`, `.skeleton`, `.load-more` |
| `CommentForm.svelte` (new) | `.form-wrap`, `.form-label`, `.form-error`, `.form-success`, `.form-textarea`, `.submit-btn` |
| `CommentItem.svelte` | `.comment-item`, `.comment-header`, `.comment-body`, `.reply-toggle`, `.replies-thread`, `.reply-form` |
| `ReactionBar.svelte` | `.reaction-bar`, `.reaction-pill` |
| `BookmarkButton.svelte` | `.bookmark-btn` |
| `NewsletterBar.svelte` | `.newsletter-card`, `.newsletter-title`, `.newsletter-sub`, `.newsletter-form`, `.email-input`, `.subscribe-btn` |

### Inline expressions kept (dynamic only)
- `color: {active ? 'var(--accent)' : 'var(--muted)'}` — reaction pills, bookmark
- `opacity: {submitting ? '0.6' : '1'}` — submit buttons
- `border-color: {mine > 0 ? 'var(--accent)' : 'var(--border)'}` — clap button
- `transform: {burst ? 'scale(1.35)' : 'scale(1)'}` — clap burst animation

Everything else (padding, font-size, border-radius, layout, transitions) moves to CSS.

---

## Files Changed Summary

### New files
- `apps/client/src/lib/api.ts`
- `apps/client/src/components/post/CommentForm.svelte`
- `apps/client/src/components/post/CommentList.svelte`
- `packages/utils/src/readTime.ts`
- `packages/utils/src/anonName.ts`

### Modified files
- `packages/utils/src/tags.ts` — add `tagClass()`, `TAG_COLOR_CSS`
- `packages/utils/src/index.ts` — re-export new modules
- `apps/client/src/lib/stats.ts` — minor cleanup (remove verbose type casts)
- `apps/client/src/pages/api/claps/[slug].ts` — use shared helpers
- `apps/client/src/pages/api/comments/[slug].ts` — use shared helpers
- `apps/client/src/pages/api/newsletter.ts` — use shared helpers
- `apps/client/src/pages/api/keep-alive.ts` — use `getSupabaseClient()`
- `apps/client/src/pages/index.astro` — use `readTime()`, `tagClass()` from utils
- `apps/client/src/pages/[slug].astro` — use `readTime()`, `tagClass()`, `TAG_COLOR_CSS`
- `apps/client/src/layouts/Layout.astro` — inject `TAG_COLOR_CSS` globally
- `apps/client/src/components/post/Comments.svelte` — orchestrator only
- `apps/client/src/components/post/CommentItem.svelte` — styles → CSS
- `apps/client/src/components/post/ClapShare.svelte` — styles → CSS
- `packages/ui/components/post/ReactionBar.svelte` — styles → CSS
- `packages/ui/components/post/BookmarkButton.svelte` — styles → CSS
- `apps/client/src/components/home/NewsletterBar.svelte` — styles → CSS
- `packages/ui/components/cards/FeedItem.svelte` — remove local `tagClass()`

### No-change files
- `packages/db/*` — already clean
- `packages/types/*` — already clean
- `packages/ui/components/cards/ArticleCard.svelte` — uses Tailwind, already clean
- `packages/ui/components/layouts/*` — out of scope
