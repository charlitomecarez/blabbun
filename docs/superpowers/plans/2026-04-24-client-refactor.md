# Client & Packages Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate duplicated helpers and logic, consolidate tag color CSS into one place, split `Comments.svelte` into focused components, and replace all inline style strings with scoped CSS blocks.

**Architecture:** Work bottom-up — shared API helpers first, then utils expansions, then component splits, then style migrations. Each task produces a working, lint-clean commit. No behavior changes — purely structural.

**Tech Stack:** Astro 6 (SSR), Svelte 5 (runes: `$props()`, `$state()`, `$derived()`, `$effect()`), TypeScript, pnpm workspaces (`@blabbun/utils`, `@blabbun/ui`, `@blabbun/db`), Playwright e2e tests.

---

## File Map

### New files
| File | Purpose |
|---|---|
| `apps/client/src/lib/api.ts` | Shared API helpers: `getSupabaseClient`, `jsonResponse`, `hashIp` |
| `packages/utils/src/readTime.ts` | `readTime(text)` — "N min read" at 200 wpm |
| `packages/utils/src/anonName.ts` | `anonName(seed)` + word-lists — extracted from Comments.svelte |
| `packages/utils/src/tags.ts` | `tagToLabel` + `tagClass` — replaces `apps/client/src/utils/tags.ts` |
| `apps/client/src/components/post/CommentList.svelte` | Paginated comment list with "load more" |
| `apps/client/src/components/post/CommentForm.svelte` | Anonymous comment submission form |

### Modified files
| File | Change |
|---|---|
| `packages/utils/src/index.ts` | Re-export all new modules |
| `packages/ui/package.json` | Add `@blabbun/utils` dependency so FeedItem can import tagClass |
| `packages/ui/styles/global.css` | Add tag badge color rules (single source of truth) |
| `packages/ui/components/cards/FeedItem.svelte` | Import tagClass from utils; remove local copy + tag CSS |
| `apps/client/src/lib/stats.ts` | Remove verbose type casts |
| `apps/client/src/pages/api/claps/[slug].ts` | Use shared api.ts helpers |
| `apps/client/src/pages/api/comments/[slug].ts` | Use shared api.ts helpers |
| `apps/client/src/pages/api/newsletter.ts` | Use shared api.ts helpers |
| `apps/client/src/pages/api/keep-alive.ts` | Use `getSupabaseClient` from api.ts |
| `apps/client/src/pages/index.astro` | Use `readTime` from utils |
| `apps/client/src/pages/[slug].astro` | Use `readTime` + `tagClass` from utils; remove local CSS block |
| `apps/client/src/pages/topics/[tag].astro` | Import `tagToLabel` from `@blabbun/utils` |
| `apps/client/src/pages/topics/index.astro` | Import `tagToLabel` from `@blabbun/utils` |
| `apps/client/src/components/archive/ArchiveList.svelte` | Import tagClass from utils; remove local copy + tag CSS; migrate selStyle |
| `apps/client/src/components/post/Comments.svelte` | Orchestrator only (~60 lines) |
| `apps/client/src/components/post/CommentItem.svelte` | Inline styles → scoped CSS |
| `apps/client/src/components/post/ClapShare.svelte` | Inline styles → scoped CSS |
| `packages/ui/components/post/ReactionBar.svelte` | Inline styles → scoped CSS |
| `packages/ui/components/post/BookmarkButton.svelte` | Inline styles → scoped CSS |
| `apps/client/src/components/home/NewsletterBar.svelte` | Inline styles → scoped CSS |

### Deleted files
| File | Reason |
|---|---|
| `apps/client/src/utils/tags.ts` | Replaced by `packages/utils/src/tags.ts` |

---

## Task 1: Create shared API helpers

**Files:**
- Create: `apps/client/src/lib/api.ts`

- [ ] **Step 1: Create `apps/client/src/lib/api.ts`**

```typescript
import { createHash } from "node:crypto";

import { createSupabaseClient } from "@blabbun/db";
import type { SupabaseClient } from "@blabbun/db";

/**
 * Returns a Supabase client authenticated with the service role key.
 * Use only in server-side API routes — never expose this key to the browser.
 */
export function getSupabaseClient(): SupabaseClient {
  return createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Serialises data to a JSON Response with the correct Content-Type header.
 * Default status is 200; pass a second argument to override (e.g. 201, 400, 500).
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Returns a SHA-256 hex digest of the client's IP address.
 * Reads the first entry in x-forwarded-for (set by Vercel's proxy).
 * Falls back to "unknown" when the header is absent — prevents server errors
 * while still allowing dedup logic to function (all unknown IPs share one hash).
 */
export function hashIp(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(ip).digest("hex");
}
```

- [ ] **Step 2: Verify lint passes**

Run from repo root:
```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/lib/api.ts
git commit -m "refactor: add shared API helpers (getSupabaseClient, jsonResponse, hashIp)"
```

---

## Task 2: Migrate API routes to shared helpers

**Files:**
- Modify: `apps/client/src/pages/api/claps/[slug].ts`
- Modify: `apps/client/src/pages/api/comments/[slug].ts`
- Modify: `apps/client/src/pages/api/newsletter.ts`
- Modify: `apps/client/src/pages/api/keep-alive.ts`

- [ ] **Step 1: Rewrite `apps/client/src/pages/api/claps/[slug].ts`**

```typescript
import type { APIRoute } from "astro";

import { getSupabaseClient, hashIp, jsonResponse } from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const supabase = getSupabaseClient();
  const hash = hashIp(request);

  const [clapsResult, voteResult] = await Promise.all([
    supabase
      .from("post_claps")
      .select("count")
      .eq("post_slug", slug!)
      .maybeSingle(),
    supabase
      .from("clap_votes")
      .select("ip_hash")
      .eq("post_slug", slug!)
      .eq("ip_hash", hash)
      .maybeSingle(),
  ]);

  if (clapsResult.error) return jsonResponse({ error: clapsResult.error.message }, 500);

  return jsonResponse({
    count: clapsResult.data?.count ?? 0,
    hasClapped: !!voteResult.data,
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const supabase = getSupabaseClient();
  const hash = hashIp(request);

  const [voteResult, clapResult] = await Promise.all([
    supabase
      .from("clap_votes")
      .select("ip_hash")
      .eq("post_slug", slug!)
      .eq("ip_hash", hash)
      .maybeSingle(),
    supabase
      .from("post_claps")
      .select("count")
      .eq("post_slug", slug!)
      .maybeSingle(),
  ]);

  const currentCount = clapResult.data?.count ?? 0;

  if (voteResult.data) {
    // Already clapped — remove vote and decrement.
    // Math.max(0, ...) guards against a count going negative if rows are inconsistent.
    const { error: deleteError } = await supabase
      .from("clap_votes")
      .delete()
      .eq("post_slug", slug!)
      .eq("ip_hash", hash);

    if (deleteError) return jsonResponse({ error: deleteError.message }, 500);

    const newCount = Math.max(0, currentCount - 1);
    const { error: upsertError } = await supabase
      .from("post_claps")
      .upsert({ post_slug: slug!, count: newCount });

    if (upsertError) return jsonResponse({ error: upsertError.message }, 500);

    return jsonResponse({ count: newCount, hasClapped: false });
  } else {
    // Not yet clapped — insert vote and increment.
    const { error: insertError } = await supabase
      .from("clap_votes")
      .insert({ post_slug: slug!, ip_hash: hash });

    if (insertError) return jsonResponse({ error: insertError.message }, 500);

    const newCount = currentCount + 1;
    const { error: upsertError } = await supabase
      .from("post_claps")
      .upsert({ post_slug: slug!, count: newCount });

    if (upsertError) return jsonResponse({ error: upsertError.message }, 500);

    return jsonResponse({ count: newCount, hasClapped: true });
  }
};
```

- [ ] **Step 2: Rewrite `apps/client/src/pages/api/comments/[slug].ts`**

```typescript
import type { CommentRow } from "@blabbun/db";
import type { APIRoute } from "astro";

import { getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_slug", slug!)
    .order("created_at", { ascending: true });

  if (error) return jsonResponse({ error: error.message }, 500);

  // Nest replies under their parent comments in a single pass.
  const rows = data ?? [];
  const topLevel = rows.filter((r) => r.parent_id === null);
  const nested = topLevel.map((comment) => ({
    ...comment,
    replies: rows.filter((r) => r.parent_id === comment.id),
  }));

  return jsonResponse(nested);
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const supabase = getSupabaseClient();

  let body: { body?: string; parent_id?: string; anon_name?: string };
  try {
    body = (await request.json()) as {
      body?: string;
      parent_id?: string;
      anon_name?: string;
    };
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (!body.body?.trim()) {
    return jsonResponse({ error: "Comment body is required" }, 400);
  }

  const insert: Partial<CommentRow> = {
    post_slug: slug!,
    body: body.body.trim(),
    parent_id: body.parent_id ?? null,
    anon_name: body.anon_name ?? null,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(insert)
    .select()
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse(data, 201);
};
```

- [ ] **Step 3: Rewrite `apps/client/src/pages/api/newsletter.ts`**

```typescript
import type { APIRoute } from "astro";

import { getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

/** Basic email format check — full validation happens at the DB constraint level. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { email?: string };

  if (!body.email?.trim() || !isValidEmail(body.email)) {
    return jsonResponse({ error: "Valid email is required" }, 400);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("subscribers")
    .insert({ email: body.email.trim() })
    .select()
    .single();

  if (error) {
    // Postgres unique-violation code — email already in the subscribers table.
    if (error.code === "23505") {
      return jsonResponse({ error: "Email already subscribed" }, 409);
    }
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse(data, 201);
};
```

- [ ] **Step 4: Rewrite `apps/client/src/pages/api/keep-alive.ts`**

```typescript
import type { APIRoute } from "astro";

import { getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

/** Pings Supabase with a lightweight query to prevent connection timeouts on the free tier. */
export const GET: APIRoute = async () => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("comments").select("id").limit(1);

  if (error) {
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  return jsonResponse({ ok: true });
};
```

- [ ] **Step 5: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/pages/api/
git commit -m "refactor: migrate API routes to shared helpers from lib/api.ts"
```

---

## Task 3: Add `readTime` and `anonName` to `@blabbun/utils`

**Files:**
- Create: `packages/utils/src/readTime.ts`
- Create: `packages/utils/src/anonName.ts`
- Modify: `packages/utils/src/index.ts`

- [ ] **Step 1: Create `packages/utils/src/readTime.ts`**

```typescript
/**
 * Estimates reading time for a piece of text at 200 words per minute.
 * Returns a formatted string like "3 min read" with a minimum of 1 minute.
 */
export function readTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
```

- [ ] **Step 2: Create `packages/utils/src/anonName.ts`**

```typescript
/** Adjectives pool for generating bun-themed anonymous commenter names. */
export const BUN_ADJS = [
  "sleepy",
  "cozy",
  "golden",
  "toasty",
  "fluffy",
  "crusty",
  "warm",
  "soft",
  "crispy",
  "doughy",
  "puffy",
  "sesame",
];

/** Nouns pool for generating bun-themed anonymous commenter names. */
export const BUN_NOUNS = [
  "loaf",
  "bun",
  "roll",
  "crumb",
  "muffin",
  "scone",
  "pretzel",
  "bagel",
  "biscuit",
  "brioche",
];

/**
 * Derives a deterministic bun-themed display name (e.g. "sleepy-loaf") from a numeric seed.
 * The same seed always produces the same name, making it stable across page reloads
 * when stored in localStorage.
 */
export function anonName(seed: number): string {
  const adj = BUN_ADJS[seed % BUN_ADJS.length];
  const noun = BUN_NOUNS[Math.floor(seed / BUN_ADJS.length) % BUN_NOUNS.length];
  return `${adj}-${noun}`;
}
```

- [ ] **Step 3: Update `packages/utils/src/index.ts`**

```typescript
export { relativeTime } from "./date";
export { anonName, BUN_ADJS, BUN_NOUNS } from "./anonName";
export { readTime } from "./readTime";
```

- [ ] **Step 4: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/utils/src/readTime.ts packages/utils/src/anonName.ts packages/utils/src/index.ts
git commit -m "feat(utils): add readTime and anonName utilities"
```

---

## Task 4: Consolidate tag utilities and CSS

This task creates one source of truth for both the `tagClass()` function and the tag badge color CSS.

**Files:**
- Create: `packages/utils/src/tags.ts`
- Modify: `packages/utils/src/index.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/styles/global.css`
- Modify: `packages/ui/components/cards/FeedItem.svelte`
- Modify: `apps/client/src/components/archive/ArchiveList.svelte`
- Modify: `apps/client/src/pages/[slug].astro`
- Modify: `apps/client/src/pages/topics/[tag].astro`
- Modify: `apps/client/src/pages/topics/index.astro`
- Delete: `apps/client/src/utils/tags.ts`

- [ ] **Step 1: Create `packages/utils/src/tags.ts`**

```typescript
/**
 * Converts an uppercased tag slug (e.g. "DEEP-WORK") to a human-readable label ("Deep-Work").
 * Each word and hyphen-separated part is title-cased independently.
 */
export function tagToLabel(tag: string): string {
  return tag
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join("-")
    )
    .join(" ");
}

/** Internal lookup table mapping tag keys to their CSS badge class names. */
const TAG_CLASS_MAP: Record<string, string> = {
  RANTS: "tag-rants",
  TAKES: "tag-takes",
  "HALF-BAKED IDEAS": "tag-halfbaked",
  "LIFE STUFF": "tag-lifestuff",
  CULTURE: "tag-culture",
  EDITORIAL: "tag-editorial",
  TECHNICAL: "tag-technical",
};

/**
 * Maps an uppercase tag key to its CSS badge class name.
 * The matching CSS rules live in `packages/ui/styles/global.css` — a single
 * source of truth shared across all components that render tag badges.
 * Falls back to "tag-default" for unrecognised tags.
 */
export function tagClass(tag: string): string {
  return TAG_CLASS_MAP[tag.toUpperCase()] ?? "tag-default";
}
```

- [ ] **Step 2: Update `packages/utils/src/index.ts`**

```typescript
export { relativeTime } from "./date";
export { anonName, BUN_ADJS, BUN_NOUNS } from "./anonName";
export { readTime } from "./readTime";
export { tagClass, tagToLabel } from "./tags";
```

- [ ] **Step 3: Add `@blabbun/utils` dependency to `packages/ui/package.json`**

Replace the `"scripts"` section (keep everything else identical, just add `dependencies`):

```json
{
  "name": "@blabbun/ui",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "exports": {
    "./components/buttons": {
      "svelte": "./components/buttons/index.ts",
      "types": "./components/buttons/index.ts",
      "default": "./components/buttons/index.ts"
    },
    "./components/inputs": {
      "svelte": "./components/inputs/index.ts",
      "types": "./components/inputs/index.ts",
      "default": "./components/inputs/index.ts"
    },
    "./components/layouts": {
      "svelte": "./components/layouts/index.ts",
      "types": "./components/layouts/index.ts",
      "default": "./components/layouts/index.ts"
    },
    "./components/cards": {
      "svelte": "./components/cards/index.ts",
      "types": "./components/cards/index.ts",
      "default": "./components/cards/index.ts"
    },
    "./components/post": {
      "svelte": "./components/post/index.ts",
      "types": "./components/post/index.ts",
      "default": "./components/post/index.ts"
    },
    "./styles/*": "./styles/*"
  },
  "dependencies": {
    "@blabbun/utils": "workspace:*"
  },
  "peerDependencies": {
    "@tailwindcss/typography": "^0.5.19",
    "svelte": "^5.0.0"
  },
  "scripts": {
    "cd:root": "cd ../.. && $SHELL",
    "cd:client": "cd ../../apps/client && $SHELL",
    "cd:admin": "cd ../../apps/admin && $SHELL",
    "cd:types": "cd ../types && $SHELL"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^7.0.0",
    "svelte-check": "^4.4.6",
    "tailwindcss": "^4.2.2"
  }
}
```

Then run:
```bash
pnpm install
```
Expected: pnpm resolves the workspace dependency without errors.

- [ ] **Step 4: Append tag badge CSS to `packages/ui/styles/global.css`**

Add this block at the very end of the file (after the last closing rule):

```css
/* ─── Tag badge colours — single source of truth for all components ──────── */
/* Light mode */
.tag-rants   { background: #fce8e8; color: #9b2121; }
.tag-takes   { background: #e8f0fc; color: #1a3a8c; }
.tag-halfbaked { background: #fef3e2; color: #8a5a00; }
.tag-lifestuff { background: #e8f8ee; color: #1a6b3a; }
.tag-culture { background: #f3e8fc; color: #6a1a8c; }
.tag-editorial { background: #faebd7; color: #8a5a00; }
.tag-technical { background: #e8f0fc; color: #1a3a8c; }
.tag-default { background: #f0ede8; color: #6b5e4e; }

/* Dark mode */
body.dark .tag-rants     { background: #2a1414; color: #d47070; }
body.dark .tag-takes     { background: #111a2a; color: #6a96d4; }
body.dark .tag-halfbaked { background: #241a08; color: #c49040; }
body.dark .tag-lifestuff { background: #0e2218; color: #5aab78; }
body.dark .tag-culture   { background: #1e1228; color: #a870d4; }
body.dark .tag-editorial { background: #241a08; color: #c49040; }
body.dark .tag-technical { background: #111a2a; color: #6a96d4; }
body.dark .tag-default   { background: #1e1a14; color: #a09080; }
```

- [ ] **Step 5: Update `packages/ui/components/cards/FeedItem.svelte`**

Replace the entire `<script>` block (remove the local `tagClass` function and import from utils):

```svelte
<script lang="ts">
  import { tagClass } from "@blabbun/utils";

  interface Props {
    author?: string;
    date?: string;
    title: string;
    excerpt?: string;
    tag?: string;
    readTime?: string;
    imageUrl?: string;
    href?: string;
    claps?: number;
    commentCount?: number;
  }

  const {
    date = "",
    title,
    excerpt = "",
    tag = "EDITORIAL",
    readTime = "5 min read",
    imageUrl = "",
    href = "#",
    claps,
    commentCount,
  }: Props = $props();
</script>
```

Then in the `<style>` block, remove all the tag color rules (`.tag-rants` through `:global(body.dark) .tag-default`) — they now come from global.css. Keep all `.feed-*` rules intact.

The style block should end after `.feed-stat { ... }` with no tag color rules following it.

- [ ] **Step 6: Update `apps/client/src/components/archive/ArchiveList.svelte`**

Replace the `<script>` block's `tagClass` function with an import, and replace the `selStyle` constant with a CSS class. The new `<script>` block:

```svelte
<script lang="ts">
  import { tagClass } from "@blabbun/utils";

  interface PostItem {
    title: string;
    description: string;
    pubDate: string;
    pubDateRaw: string;
    monthGroup: string;
    tag: string;
    href: string;
    imageUrl?: string;
    claps?: number;
    commentCount?: number;
  }

  interface Props {
    posts: PostItem[];
    tags: string[];
    lockedTag?: string;
  }

  const { posts, tags, lockedTag }: Props = $props();

  // svelte-ignore state_referenced_locally
  let activeTag = $state(lockedTag ?? null);
  let sort = $state<"newest" | "oldest">("newest");
  let month = $state("all");

  const months = $derived(
    [...new Set(posts.map((p) => p.pubDateRaw.slice(0, 7)))].sort().reverse()
  );

  const filtered = $derived(
    posts
      .filter((p) => !activeTag || p.tag === activeTag)
      .filter((p) => month === "all" || p.pubDateRaw.startsWith(month))
      .sort((a, b) =>
        sort === "newest"
          ? Date.parse(b.pubDateRaw) - Date.parse(a.pubDateRaw)
          : Date.parse(a.pubDateRaw) - Date.parse(b.pubDateRaw)
      )
  );
</script>
```

In the template, replace `style={selStyle}` on both `<select>` elements with `class="sel"`:

```svelte
<select bind:value={month} class="sel" aria-label="Filter by month">
```
```svelte
<select bind:value={sort} class="sel" aria-label="Sort">
```

Also change the wrapper div's inline style to a class:
```svelte
<div class="controls-right">
```

In the `<style>` block:
1. Remove all `.tag-rants` through `:global(body.dark) .tag-default` rules — they come from global.css now.
2. Add these two new rules after `.controls-label`:

```css
.controls-right {
  margin-left: auto;
  display: flex;
  gap: 10px;
}
.sel {
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 5px 10px;
  font-size: 0.7rem;
  color: var(--text);
  font-family: inherit;
  outline: none;
  cursor: pointer;
}
```

Also remove the inline `style="animation:fadeIn 0.2s ease"` on the root `<div>` and add `class="archive-root"` with:
```css
.archive-root {
  animation: fadeIn 0.2s ease;
}
```

- [ ] **Step 7: Update `apps/client/src/pages/[slug].astro`**

At the top of the frontmatter, replace the local `tagClass` function with an import:

```astro
---
import { tagClass } from "@blabbun/utils";
// ... rest of existing imports
---
```

Remove the `tagClass` function definition that was in the frontmatter (lines 16-27 of the original file).

In the `<style>` block, remove all the tag color rules — the `.rel-badge` base styles and `.rel-row`/`.rel-title` styles stay, only the `.tag-rants` through `:global(body.dark) .tag-default` color rules are removed.

- [ ] **Step 8: Update `apps/client/src/pages/topics/[tag].astro` and `topics/index.astro`**

In `topics/[tag].astro`, change the import from:
```typescript
import { tagToLabel } from "@/utils/tags";
```
to:
```typescript
import { tagToLabel } from "@blabbun/utils";
```

In `topics/index.astro`, change the import from:
```typescript
import { tagToLabel } from "@/utils/tags";
```
to:
```typescript
import { tagToLabel } from "@blabbun/utils";
```

- [ ] **Step 9: Delete `apps/client/src/utils/tags.ts`**

```bash
rm apps/client/src/utils/tags.ts
```

- [ ] **Step 10: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors. If there are any remaining imports of `@/utils/tags`, fix them now.

- [ ] **Step 11: Commit**

```bash
git add packages/utils/src/tags.ts packages/utils/src/index.ts \
  packages/ui/package.json packages/ui/styles/global.css \
  packages/ui/components/cards/FeedItem.svelte \
  apps/client/src/components/archive/ArchiveList.svelte \
  apps/client/src/pages/\[slug\].astro \
  apps/client/src/pages/topics/ \
  apps/client/src/utils/
git commit -m "refactor: consolidate tagClass and tag CSS into @blabbun/utils and global.css"
```

---

## Task 5: Clean up `stats.ts` and update pages to use `readTime`

**Files:**
- Modify: `apps/client/src/lib/stats.ts`
- Modify: `apps/client/src/pages/index.astro`
- Modify: `apps/client/src/pages/[slug].astro`

- [ ] **Step 1: Rewrite `apps/client/src/lib/stats.ts`**

```typescript
import { createSupabaseClient } from "@blabbun/db";

export interface PostStats {
  claps: number;
  commentCount: number;
}

/**
 * Fetches clap counts and top-level comment counts for a list of post slugs.
 * Runs both queries in parallel. Returns a map keyed by slug — unknown slugs
 * get zeroed stats so callers never need to null-check individual entries.
 */
export async function fetchPostStats(
  slugs: string[]
): Promise<Record<string, PostStats>> {
  if (slugs.length === 0) return {};

  const supabase = createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [clapsResult, commentsResult] = await Promise.all([
    supabase.from("post_claps").select("post_slug, count").in("post_slug", slugs),
    // Only count top-level comments (parent_id IS NULL) — replies are nested under parents.
    supabase
      .from("comments")
      .select("post_slug")
      .in("post_slug", slugs)
      .is("parent_id", null),
  ]);

  const stats: Record<string, PostStats> = Object.fromEntries(
    slugs.map((slug) => [slug, { claps: 0, commentCount: 0 }])
  );

  for (const row of clapsResult.data ?? []) {
    if (stats[row.post_slug]) stats[row.post_slug].claps = row.count;
  }

  for (const row of commentsResult.data ?? []) {
    if (stats[row.post_slug]) stats[row.post_slug].commentCount++;
  }

  return stats;
}
```

- [ ] **Step 2: Update `apps/client/src/pages/index.astro`**

Add `readTime` to the imports at the top of the frontmatter:
```astro
import { readTime } from "@blabbun/utils";
```

Replace the inline `readTime` calculation in the `feedItems` mapping:
```typescript
// Before:
readTime: `${Math.max(1, Math.round((post.body?.trim().split(/\s+/).length ?? 0) / 200))} min read`,

// After:
readTime: readTime(post.body ?? ""),
```

- [ ] **Step 3: Update `apps/client/src/pages/[slug].astro`**

Add `readTime` to the `@blabbun/utils` import (which now also has `tagClass`):
```astro
import { readTime, tagClass } from "@blabbun/utils";
```

Replace the inline calculation:
```typescript
// Before:
const wordCount = post.body?.trim().split(/\s+/).length ?? 0;
const readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;

// After:
const postReadTime = readTime(post.body ?? "");
```

Update the usage in the template from `{readTime}` to `{postReadTime}` (one occurrence in the `PostHero` component call).

- [ ] **Step 4: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/lib/stats.ts apps/client/src/pages/index.astro apps/client/src/pages/\[slug\].astro
git commit -m "refactor: use readTime() from utils, clean up stats.ts type casts"
```

---

## Task 6: Split `Comments.svelte` into three focused components

**Files:**
- Create: `apps/client/src/components/post/CommentList.svelte`
- Create: `apps/client/src/components/post/CommentForm.svelte`
- Modify: `apps/client/src/components/post/Comments.svelte`

- [ ] **Step 1: Create `apps/client/src/components/post/CommentList.svelte`**

```svelte
<script lang="ts">
  import type { Comment } from "./types";

  import CommentItem from "./CommentItem.svelte";

  interface Props {
    comments: Comment[];
    activeReplyId: string | null;
    onReplyToggle: (id: string | null) => void;
    onReplySubmit: (commentId: string, body: string) => Promise<void>;
  }

  const { comments, activeReplyId, onReplyToggle, onReplySubmit }: Props =
    $props();

  const COMMENTS_PER_PAGE = 10;
  let visibleCount = $state(COMMENTS_PER_PAGE);

  const visibleComments = $derived(comments.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < comments.length);

  /** Total count including nested replies — shown in the section header. */
  const total = $derived(
    comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0)
  );
</script>

<div class="list-header">
  {total} comment{total !== 1 ? "s" : ""}
</div>

{#if comments.length > 0}
  <div class="list">
    {#each visibleComments as comment (comment.id)}
      <CommentItem
        {comment}
        {activeReplyId}
        {onReplyToggle}
        {onReplySubmit}
      />
    {/each}
  </div>
{/if}

{#if hasMore}
  <button
    type="button"
    class="load-more"
    onclick={() => (visibleCount += COMMENTS_PER_PAGE)}
  >
    load more ({comments.length - visibleCount} remaining)
  </button>
{/if}

<style>
  .list-header {
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.06em;
    margin-bottom: 24px;
    text-transform: uppercase;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .load-more {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.74rem;
    color: var(--accent);
    cursor: pointer;
    margin-top: 12px;
    padding: 0;
  }
  .load-more:hover {
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 2: Create `apps/client/src/components/post/CommentForm.svelte`**

```svelte
<script lang="ts">
  interface Props {
    /** The commenter's generated anonymous display name (shown as a hint). */
    yourName: string;
    /** Called by the parent orchestrator with the trimmed comment body. Throws on failure. */
    onSubmit: (body: string) => Promise<void>;
  }

  const { yourName, onSubmit }: Props = $props();

  let text = $state("");
  let err = $state("");
  let posted = $state(false);
  let submitting = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!text.trim()) {
      err = "say something first";
      return;
    }
    submitting = true;
    err = "";
    try {
      await onSubmit(text.trim());
      text = "";
      posted = true;
      setTimeout(() => (posted = false), 2000);
    } catch {
      err = "couldn't post, try again";
    } finally {
      submitting = false;
    }
  }
</script>

<form class="form-wrap" onsubmit={handleSubmit}>
  <div class="form-label">
    leave a comment — you'll be anonymous
    <span class="form-name">({yourName})</span>
  </div>

  {#if err}
    <div class="form-error">! {err}</div>
  {/if}
  {#if posted}
    <div class="form-success">posted!</div>
  {/if}

  <textarea
    bind:value={text}
    class="form-textarea"
    placeholder="what do you think..."
    rows={3}
    aria-label="Comment text"
  ></textarea>

  <button
    type="submit"
    class="submit-btn"
    disabled={submitting}
    style="opacity: {submitting ? '0.6' : '1'}"
  >
    {submitting ? "posting…" : "post anonymously"}
  </button>
</form>

<style>
  .form-wrap {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--divider);
  }

  .form-label {
    font-size: 0.7rem;
    color: var(--muted);
    margin-bottom: 12px;
    letter-spacing: 0.04em;
  }

  .form-name {
    color: var(--accent);
  }

  .form-error {
    font-size: 0.7rem;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .form-success {
    font-size: 0.7rem;
    color: #3a8c5a;
    margin-bottom: 8px;
  }

  .form-textarea {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 10px 12px;
    font-size: 0.8rem;
    color: var(--text);
    width: 100%;
    outline: none;
    resize: vertical;
    font-family: inherit;
    line-height: 1.6;
    margin-bottom: 10px;
    display: block;
  }

  .submit-btn {
    background: var(--accent);
    border: none;
    border-radius: 3px;
    padding: 9px 20px;
    font-size: 0.74rem;
    font-family: inherit;
    color: #fff;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: opacity 0.15s;
  }
</style>
```

- [ ] **Step 3: Rewrite `apps/client/src/components/post/Comments.svelte` as the orchestrator**

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  import { anonName } from "@blabbun/utils";

  import type { Comment } from "./types";
  import CommentForm from "./CommentForm.svelte";
  import CommentList from "./CommentList.svelte";

  interface Props {
    postSlug: string;
  }

  const { postSlug }: Props = $props();

  const STORAGE_KEY = "blabbun-anon-name";

  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let yourName = $state("");
  let activeReplyId = $state<string | null>(null);

  onMount(async () => {
    // Restore or generate an anonymous name that persists across sessions.
    const saved = localStorage.getItem(STORAGE_KEY);
    yourName = saved ?? anonName(((Date.now() / 10000) | 0) % 120);
    if (!saved) localStorage.setItem(STORAGE_KEY, yourName);

    try {
      const res = await fetch(`/api/comments/${postSlug}`);
      if (!res.ok) throw new Error();
      comments = await res.json();
    } catch {
      /* silent — a failed fetch shouldn't break the page */
    } finally {
      loading = false;
    }
  });

  /** Submits a new top-level comment and prepends it to the list optimistically. */
  async function submitComment(body: string): Promise<void> {
    const res = await fetch(`/api/comments/${postSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, anon_name: yourName }),
    });
    if (!res.ok) throw new Error();
    const created = await res.json();
    comments = [{ ...created, replies: [] }, ...comments];
  }

  /** Submits a reply to an existing comment and appends it to that comment's reply list. */
  async function addReply(commentId: string, body: string): Promise<void> {
    const res = await fetch(`/api/comments/${postSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, parent_id: commentId, anon_name: yourName }),
    });
    if (!res.ok) throw new Error();
    const created = await res.json();
    comments = comments.map((c) =>
      c.id === commentId ? { ...c, replies: [...c.replies, created] } : c
    );
    activeReplyId = null;
  }
</script>

<section class="comments-section">
  {#if loading}
    <div class="skeleton">
      {#each [1, 2] as n (n)}
        <div class="skeleton-item">
          <div class="skeleton-name"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      {/each}
    </div>
  {:else}
    <CommentList
      {comments}
      {activeReplyId}
      onReplyToggle={(id) => (activeReplyId = id)}
      onReplySubmit={addReply}
    />
  {/if}

  <CommentForm {yourName} onSubmit={submitComment} />
</section>

<style>
  .comments-section {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--divider);
  }

  .skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeIn 0.5s ease;
  }

  .skeleton-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .skeleton-name {
    height: 9px;
    width: 60px;
    border-radius: 2px;
    background: var(--bg3);
    margin-bottom: 2px;
  }

  .skeleton-line {
    height: 11px;
    width: 90%;
    border-radius: 2px;
    background: var(--bg3);
  }

  .skeleton-line.short {
    width: 70%;
  }
</style>
```

- [ ] **Step 4: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/components/post/
git commit -m "refactor: split Comments.svelte into orchestrator + CommentList + CommentForm"
```

---

## Task 7: Migrate `CommentItem.svelte` inline styles → CSS

**Files:**
- Modify: `apps/client/src/components/post/CommentItem.svelte`

- [ ] **Step 1: Rewrite `apps/client/src/components/post/CommentItem.svelte`**

```svelte
<script lang="ts">
  import { relativeTime } from "@blabbun/utils";

  import type { Comment } from "./types";

  interface Props {
    comment: Comment;
    activeReplyId: string | null;
    onReplyToggle: (id: string | null) => void;
    onReplySubmit: (commentId: string, body: string) => Promise<void>;
  }

  const { comment, activeReplyId, onReplyToggle, onReplySubmit }: Props =
    $props();

  let replyBody = $state("");
  const isReplying = $derived(activeReplyId === comment.id);

  function handleReplySubmit() {
    if (!replyBody.trim()) return;
    onReplySubmit(comment.id, replyBody.trim());
    replyBody = "";
  }
</script>

<div class="comment-item">
  <!-- Author + timestamp -->
  <div class="comment-header">
    <span class="comment-author">{comment.anon_name ?? "anonymous"}</span>
    <span class="comment-time">{relativeTime(comment.created_at)}</span>
  </div>

  <!-- Body -->
  <p class="comment-body">{comment.body}</p>

  <!-- Reply toggle -->
  <button
    type="button"
    class="reply-toggle"
    onclick={() => onReplyToggle(isReplying ? null : comment.id)}
  >
    {isReplying ? "↩ cancel" : "↩ reply"}
  </button>

  <!-- Nested replies + inline reply form -->
  {#if comment.replies.length > 0 || isReplying}
    <div class="replies-thread">
      {#each comment.replies as reply (reply.id)}
        <div class="reply-item">
          <div class="comment-header">
            <span class="comment-author">{reply.anon_name ?? "anonymous"}</span>
            <span class="comment-time">{relativeTime(reply.created_at)}</span>
          </div>
          <p class="comment-body reply-body">{reply.body}</p>
        </div>
      {/each}

      {#if isReplying}
        <div class="reply-form">
          <textarea
            bind:value={replyBody}
            class="reply-textarea"
            placeholder="write a reply…"
            rows={2}
            aria-label="Reply text"
          ></textarea>
          <div class="reply-actions">
            <button
              type="button"
              class="reply-submit"
              onclick={handleReplySubmit}
              disabled={!replyBody.trim()}
              style="opacity: {replyBody.trim() ? '1' : '0.4'}"
            >
              post
            </button>
            <button
              type="button"
              class="reply-cancel"
              onclick={() => {
                replyBody = "";
                onReplyToggle(null);
              }}
            >
              cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .comment-item {
    padding: 14px 0;
    border-bottom: 1px solid var(--divider);
  }

  /* ─── Header ──────────────────────────────────────────────── */
  .comment-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
  }

  .comment-author {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--accent);
  }

  .comment-time {
    font-size: 0.65rem;
    color: var(--muted2);
    font-weight: 400;
  }

  /* ─── Body ────────────────────────────────────────────────── */
  .comment-body {
    font-size: 0.84rem;
    line-height: 1.65;
    color: var(--text);
    margin-bottom: 8px;
  }

  .reply-body {
    font-size: 0.8rem;
  }

  /* ─── Reply toggle ────────────────────────────────────────── */
  .reply-toggle {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.7rem;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    letter-spacing: 0.02em;
    transition: color 0.12s;
  }
  .reply-toggle:hover {
    color: var(--accent);
  }

  /* ─── Nested thread ───────────────────────────────────────── */
  .replies-thread {
    margin-top: 10px;
    margin-left: 14px;
    padding-left: 12px;
    border-left: 2px solid var(--accent-soft);
  }

  .reply-item {
    padding: 8px 0;
    border-bottom: 1px solid var(--divider);
  }

  /* ─── Inline reply form ───────────────────────────────────── */
  .reply-form {
    padding-top: 10px;
  }

  .reply-textarea {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 8px 10px;
    font-size: 0.78rem;
    color: var(--text);
    width: 100%;
    outline: none;
    resize: none;
    font-family: inherit;
    line-height: 1.6;
    display: block;
  }

  .reply-actions {
    margin-top: 6px;
    display: flex;
    gap: 8px;
  }

  .reply-submit {
    background: var(--accent);
    border: none;
    border-radius: 3px;
    padding: 7px 16px;
    font-size: 0.72rem;
    font-family: inherit;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .reply-cancel {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.72rem;
    color: var(--muted);
    cursor: pointer;
  }
  .reply-cancel:hover {
    color: var(--accent);
  }
</style>
```

- [ ] **Step 2: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/post/CommentItem.svelte
git commit -m "refactor: migrate CommentItem.svelte inline styles to scoped CSS"
```

---

## Task 8: Migrate `ClapShare.svelte` inline styles → CSS

**Files:**
- Modify: `apps/client/src/components/post/ClapShare.svelte`

- [ ] **Step 1: Rewrite `apps/client/src/components/post/ClapShare.svelte`**

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    postSlug: string;
    postUrl: string;
    postTitle: string;
    inline?: boolean;
  }

  const { postSlug, postUrl, postTitle, inline = false }: Props = $props();

  let count = $state(0);
  let mine = $state(0);
  let loading = $state(true);
  let burst = $state(false);
  let shareOpen = $state(false);
  let copied = $state(false);
  let clapTimer: ReturnType<typeof setTimeout> | undefined;
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  /** Maximum claps a single visitor can give per post. */
  const MAX_CLAPS = 50;

  onMount(async () => {
    try {
      const res = await fetch(`/api/claps/${postSlug}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { count: number; hasClapped: boolean };
      count = data.count ?? 0;
      mine = data.hasClapped ? 1 : 0;
    } catch {
      /* silent — clap count failing shouldn't block page render */
    } finally {
      loading = false;
    }

    return () => {
      clearTimeout(clapTimer);
      clearTimeout(copyTimer);
    };
  });

  async function clap() {
    if (mine >= MAX_CLAPS || loading) return;
    // Optimistic update — revert on error.
    count += 1;
    mine += 1;
    burst = true;
    clearTimeout(clapTimer);
    clapTimer = setTimeout(() => (burst = false), 350);
    try {
      const res = await fetch(`/api/claps/${postSlug}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { count: number; hasClapped: boolean };
      count = data.count;
    } catch {
      count -= 1;
      mine -= 1;
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = false), 2000);
    } catch {
      /* clipboard API not available in all contexts */
    }
  }

  const encodedUrl = $derived(encodeURIComponent(postUrl));
  const encodedTitle = $derived(encodeURIComponent(postTitle));
</script>

<div class="clap-wrap">
  <!-- Clap button + count -->
  <div class="clap-group">
    <button
      type="button"
      class="clap-btn"
      onclick={clap}
      disabled={loading}
      title={mine >= MAX_CLAPS ? "max claps reached" : "clap for this post"}
      style="
        border-color: {mine > 0 ? 'var(--accent)' : 'var(--border)'};
        color: {mine > 0 ? 'var(--accent)' : 'var(--muted)'};
        transform: {burst ? 'scale(1.35)' : 'scale(1)'};
        cursor: {mine >= MAX_CLAPS ? 'not-allowed' : 'pointer'};
      "
    >
      👏
    </button>
    <div>
      <div class="clap-count-num">{count}</div>
      <div class="clap-count-label">
        {mine > 0 ? `you clapped ${mine}x` : "clap if you liked it"}
      </div>
    </div>
  </div>

  <!-- Share panel -->
  <div class="share-wrapper">
    <button
      type="button"
      class="share-btn"
      onclick={() => (shareOpen = !shareOpen)}
      style="
        border-color: {shareOpen ? 'var(--accent)' : 'var(--border)'};
        color: {shareOpen ? 'var(--accent)' : 'var(--muted)'};
      "
    >
      ↗ share
    </button>

    {#if shareOpen}
      <div class="share-panel">
        <button
          type="button"
          class="share-link"
          onclick={copyLink}
          style="
            color: {copied ? 'var(--accent)' : 'var(--muted)'};
            border-color: {copied ? 'var(--accent)' : 'var(--border)'};
          "
        >
          {copied ? "✓ copied!" : "🔗 copy link"}
        </button>
        <a
          class="share-link"
          href="https://twitter.com/intent/tweet?text={encodedTitle}&url={encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          𝕏 share on X
        </a>
        <a
          class="share-link"
          href="https://www.facebook.com/sharer/sharer.php?u={encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          f share on Facebook
        </a>
        <a
          class="share-link"
          href="https://reddit.com/submit?url={encodedUrl}&title={encodedTitle}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ↑ share on Reddit
        </a>
      </div>
    {/if}
  </div>

  <!-- Bookmark slot — pushed right by the parent's flex layout -->
  <slot />
</div>

<style>
  .clap-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  /* ─── Clap button ─────────────────────────────────────────── */
  .clap-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .clap-btn {
    background: none;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .clap-count-num {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text);
  }

  .clap-count-label {
    font-size: 0.62rem;
    color: var(--muted);
  }

  /* ─── Share button ────────────────────────────────────────── */
  .share-wrapper {
    position: relative;
  }

  .share-btn {
    background: var(--bg2);
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    padding: 7px 13px;
    font-size: 0.72rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition:
      color 0.15s,
      border-color 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ─── Share panel popup ───────────────────────────────────── */
  .share-panel {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 180px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    z-index: 50;
  }

  .share-link {
    background: var(--bg2);
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    padding: 7px 13px;
    font-size: 0.72rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition:
      color 0.15s,
      border-color 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    width: 100%;
    text-align: left;
    color: var(--muted);
    border-color: var(--border);
  }
  .share-link:hover {
    color: var(--accent);
    border-color: var(--accent);
  }
</style>
```

- [ ] **Step 2: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/post/ClapShare.svelte
git commit -m "refactor: migrate ClapShare.svelte inline styles to scoped CSS"
```

---

## Task 9: Migrate `ReactionBar.svelte` and `BookmarkButton.svelte` inline styles → CSS

**Files:**
- Modify: `packages/ui/components/post/ReactionBar.svelte`
- Modify: `packages/ui/components/post/BookmarkButton.svelte`

- [ ] **Step 1: Rewrite `packages/ui/components/post/ReactionBar.svelte`**

```svelte
<script lang="ts">
  interface Props {
    /** The post slug — used as a localStorage namespace to prevent cross-post bleed. */
    slug: string;
  }

  const { slug }: Props = $props();

  const REACTIONS = [
    { emoji: "🔥", label: "fire" },
    { emoji: "💭", label: "thinking" },
    { emoji: "👀", label: "eyes" },
    { emoji: "💯", label: "100" },
    { emoji: "😭", label: "crying" },
  ];

  function storageKey(label: string) {
    return `bb-reaction-${slug}-${label}`;
  }

  let counts = $state<Record<string, number>>({});
  let mine = $state<string | null>(null);
  let mounted = $state(false);

  $effect(() => {
    const c: Record<string, number> = {};
    for (const r of REACTIONS) {
      const raw = localStorage.getItem(storageKey(r.label));
      c[r.label] = raw ? parseInt(raw, 10) : 0;
    }
    counts = c;
    mine = localStorage.getItem(`bb-reaction-mine-${slug}`);
    mounted = true;
  });

  function react(label: string) {
    if (!mounted) return;
    const prev = mine;

    if (prev === label) {
      // Toggle off — undo the reaction.
      const n = Math.max(0, (counts[label] ?? 1) - 1);
      localStorage.setItem(storageKey(label), String(n));
      localStorage.removeItem(`bb-reaction-mine-${slug}`);
      counts = { ...counts, [label]: n };
      mine = null;
    } else {
      // Switch reactions — decrement old, increment new.
      if (prev) {
        const n = Math.max(0, (counts[prev] ?? 1) - 1);
        localStorage.setItem(storageKey(prev), String(n));
        counts = { ...counts, [prev]: n };
      }
      const n = (counts[label] ?? 0) + 1;
      localStorage.setItem(storageKey(label), String(n));
      localStorage.setItem(`bb-reaction-mine-${slug}`, label);
      counts = { ...counts, [label]: n };
      mine = label;
    }
  }
</script>

{#if mounted}
  <div class="reaction-bar">
    {#each REACTIONS as r}
      {@const active = mine === r.label}
      <button
        type="button"
        class="reaction-pill"
        onclick={() => react(r.label)}
        aria-label={`React with ${r.label}`}
        style="
          background: {active ? 'var(--accent-soft)' : 'var(--bg2)'};
          border-color: {active ? 'var(--accent)' : 'var(--border)'};
          color: {active ? 'var(--accent)' : 'var(--muted)'};
        "
      >
        <span>{r.emoji}</span>
        {#if counts[r.label] > 0}
          <span class="reaction-count">{counts[r.label]}</span>
        {/if}
      </button>
    {/each}
  </div>
{/if}

<style>
  .reaction-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 16px 0;
    border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider);
    margin: 28px 0;
  }

  .reaction-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 20px;
    border-width: 1px;
    border-style: solid;
    font-family: inherit;
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .reaction-count {
    font-size: 0.7rem;
  }
</style>
```

- [ ] **Step 2: Rewrite `packages/ui/components/post/BookmarkButton.svelte`**

```svelte
<script lang="ts">
  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let saved = $state(false);
  let mounted = $state(false);

  $effect(() => {
    saved = localStorage.getItem(`bb-bookmark-${slug}`) === "1";
    mounted = true;
  });

  function toggle() {
    if (!mounted) return;
    saved = !saved;
    if (saved) {
      localStorage.setItem(`bb-bookmark-${slug}`, "1");
    } else {
      localStorage.removeItem(`bb-bookmark-${slug}`);
    }
    // Notify the Navbar bookmark badge to update its count.
    window.dispatchEvent(new Event("storage"));
  }
</script>

{#if mounted}
  <button
    type="button"
    class="bookmark-btn"
    onclick={toggle}
    aria-label={saved ? "Remove bookmark" : "Bookmark this post"}
    title={saved ? "Bookmarked" : "Bookmark"}
    style="color: {saved ? 'var(--accent)' : 'var(--muted)'}"
  >
    🔖
  </button>
{/if}

<style>
  .bookmark-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    font-size: 1.1rem;
    transition: color 0.15s;
  }
</style>
```

- [ ] **Step 3: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/components/post/ReactionBar.svelte packages/ui/components/post/BookmarkButton.svelte
git commit -m "refactor: migrate ReactionBar and BookmarkButton inline styles to scoped CSS"
```

---

## Task 10: Migrate `NewsletterBar.svelte` inline styles → CSS

**Files:**
- Modify: `apps/client/src/components/home/NewsletterBar.svelte`

- [ ] **Step 1: Rewrite `apps/client/src/components/home/NewsletterBar.svelte`**

```svelte
<script lang="ts">
  let email = $state("");
  let done = $state(
    // Guard for SSR — localStorage is unavailable on the server.
    typeof localStorage !== "undefined"
      ? localStorage.getItem("bb-subscribed") === "1"
      : false
  );
  let err = $state("");
  let submitting = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    if (!email.includes("@")) {
      err = "that doesn't look like an email";
      return;
    }
    err = "";
    submitting = true;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to subscribe");
      }
      done = true;
      localStorage.setItem("bb-subscribed", "1");
    } catch (ex) {
      err = ex instanceof Error ? ex.message : "something went wrong";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="newsletter-card">
  {#if done}
    <div class="newsletter-title">you're in.</div>
    <div class="newsletter-sub">
      i'll send the next one when i have something worth saying. could be
      tomorrow. could be never.
    </div>
  {:else}
    <div class="newsletter-title">get new posts in your inbox</div>
    <div class="newsletter-sub">
      no schedule. no issues. just an email when something new drops.
    </div>
    {#if err}
      <div class="form-error">! {err}</div>
    {/if}
    <form class="newsletter-form" onsubmit={submit}>
      <input
        bind:value={email}
        class="email-input"
        placeholder="your@email.com"
        type="email"
      />
      <button
        type="submit"
        class="subscribe-btn"
        disabled={submitting}
        style="opacity: {submitting ? '0.6' : '1'}"
      >
        {submitting ? "…" : "subscribe"}
      </button>
    </form>
  {/if}
</div>

<style>
  .newsletter-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 26px 28px;
    margin: 40px 0;
  }

  .newsletter-title {
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--text);
  }

  .newsletter-sub {
    font-size: 0.74rem;
    color: var(--muted);
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .form-error {
    font-size: 0.7rem;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .newsletter-form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .email-input {
    flex: 1;
    min-width: 200px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 9px 14px;
    font-size: 0.78rem;
    font-family: inherit;
    color: var(--text);
    outline: none;
  }

  .subscribe-btn {
    background: var(--accent);
    border: none;
    border-radius: 3px;
    padding: 9px 20px;
    font-size: 0.74rem;
    font-family: inherit;
    color: #fff;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s;
  }
</style>
```

- [ ] **Step 2: Verify lint passes**

```bash
pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/home/NewsletterBar.svelte
git commit -m "refactor: migrate NewsletterBar.svelte inline styles to scoped CSS"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run the full e2e test suite**

Run from `apps/client`:
```bash
cd apps/client && pnpm test
```
Expected: all tests pass. Key tests to watch:
- `api-claps.spec.ts` — verifies clap toggle and count
- `api-comments.spec.ts` — verifies comment POST/GET
- `api-newsletter.spec.ts` — verifies email subscription
- `index.spec.ts` — homepage loads
- `404.spec.ts` — 404 page renders

If any test fails, check the error output — it will point to the specific API route or component that regressed.

- [ ] **Step 2: Smoke test in the browser**

Start the dev server:
```bash
pnpm dev:client
```

Visit:
- `http://localhost:4321/` — tag filters should work, readTime shows correctly
- `http://localhost:4321/<any-post-slug>` — clap button, share panel, reaction bar, bookmark, comments form, and related posts all render and function
- `http://localhost:4321/archive` — tag badges colored correctly, sort + filter dropdowns work
- `http://localhost:4321/topics` — tag labels display correctly

- [ ] **Step 3: Final commit if all clear**

```bash
git add -A
git commit -m "refactor: final cleanup — verify all tasks complete"
```
