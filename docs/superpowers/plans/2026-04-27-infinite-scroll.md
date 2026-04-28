# Infinite Scroll for Post Lists — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scroll-sentinel infinite loading to all client post lists so only 10 items render initially, with more revealed automatically as the user scrolls.

**Architecture:** All post metadata continues to be fetched at SSR time (unchanged). A shared `InfiniteScroll.svelte` component watches a sentinel `div` at the bottom of each list using `svelte-intersection-observer`; when the sentinel enters the viewport it increments `visibleCount` state by 10. Filter/sort changes reset `visibleCount` to 10.

**Tech Stack:** Svelte 5 (runes), `svelte-intersection-observer`, Playwright e2e tests, Astro SSR

---

## File Map

| File | Action |
|---|---|
| `apps/client/package.json` | Add `svelte-intersection-observer` dependency |
| `apps/client/src/components/InfiniteScroll.svelte` | **Create** — shared sentinel + loading indicator component |
| `apps/client/src/components/home/HomeFeed.svelte` | **Create** — replaces home page's inline Astro post list + `<script>` tag filter |
| `apps/client/src/pages/index.astro` | **Modify** — remove post list HTML + inline `<script>`, render `<HomeFeed>` |
| `apps/client/src/components/archive/ArchiveList.svelte` | **Modify** — add `visibleCount` state, slice `filtered`, add `<InfiniteScroll>` |
| `apps/client/tests/e2e/index.spec.ts` | **Modify** — add infinite scroll behavior test |
| `apps/client/tests/e2e/archive.spec.ts` | **Modify** — add infinite scroll + end-marker test |

---

## Task 1: Install the package

**Files:**
- Modify: `apps/client/package.json`

- [ ] **Step 1: Install `svelte-intersection-observer`**

Run from the repo root:
```bash
pnpm add svelte-intersection-observer --filter @blabbun/client
```

- [ ] **Step 2: Verify it appears in `apps/client/package.json`**

```bash
grep "svelte-intersection-observer" apps/client/package.json
```

Expected output:
```
"svelte-intersection-observer": "^0.14.0"
```
(version may vary — any `^0.x.x` is fine)

- [ ] **Step 3: Commit**

```bash
git add apps/client/package.json pnpm-lock.yaml
git commit -m "chore: add svelte-intersection-observer"
```

---

## Task 2: Create `InfiniteScroll.svelte`

**Files:**
- Create: `apps/client/src/components/InfiniteScroll.svelte`

This component renders a sentinel `div` watched by `svelte-intersection-observer`. When the sentinel enters the viewport and `hasMore` is true, it calls `onLoadMore`. It shows animated dots while there are more items, and a "— end —" line when the list is exhausted.

- [ ] **Step 1: Create the file**

`apps/client/src/components/InfiniteScroll.svelte`:

```svelte
<script lang="ts">
  import IntersectionObserver from "svelte-intersection-observer";

  interface Props {
    hasMore: boolean;
    onLoadMore: () => void;
  }

  const { hasMore, onLoadMore }: Props = $props();

  let sentinel = $state<HTMLElement | null>(null);
</script>

{#if hasMore}
  <IntersectionObserver
    element={sentinel}
    onobserve={(e) => {
      if (e.detail.isIntersecting) onLoadMore();
    }}
  >
    <div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>
  </IntersectionObserver>
  <div class="loading" aria-label="Loading more posts">· · ·</div>
{:else}
  <div class="end" aria-label="End of list">— end —</div>
{/if}

<style>
  .sentinel {
    height: 1px;
  }
  .loading {
    text-align: center;
    font-size: 0.7rem;
    color: var(--muted);
    padding: 24px 0;
    animation: pulse 1.4s ease-in-out infinite;
    letter-spacing: 0.15em;
  }
  .end {
    text-align: center;
    font-size: 0.65rem;
    color: var(--muted2);
    padding: 24px 0;
    letter-spacing: 0.08em;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 1;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/components/InfiniteScroll.svelte
git commit -m "feat: add InfiniteScroll sentinel component"
```

---

## Task 3: Create `HomeFeed.svelte`

**Files:**
- Create: `apps/client/src/components/home/HomeFeed.svelte`

The home page currently renders posts as plain Astro HTML with an inline `<script>` for tag filtering via DOM manipulation. Since `$state` requires a Svelte component context, the tag filter + post list are extracted into `HomeFeed.svelte`.

The `FeedItemData` interface matches the shape already computed in `index.astro` (date, title, excerpt, tag, readTime, imageUrl, href, claps, commentCount).

- [ ] **Step 1: Create the file**

`apps/client/src/components/home/HomeFeed.svelte`:

```svelte
<script lang="ts">
  import { FeedItem } from "@blabbun/ui/components/cards";

  import InfiniteScroll from "@/components/InfiniteScroll.svelte";

  interface FeedItemData {
    date: string;
    title: string;
    excerpt?: string;
    tag: string;
    readTime?: string;
    imageUrl?: string;
    href: string;
    claps?: number;
    commentCount?: number;
  }

  interface Props {
    feedItems: FeedItemData[];
    allTags: string[];
  }

  const { feedItems, allTags }: Props = $props();

  // svelte-ignore state_referenced_locally
  let activeTag = $state("all");
  let visibleCount = $state(10);

  const filtered = $derived(
    activeTag === "all"
      ? feedItems
      : feedItems.filter((item) => item.tag === activeTag)
  );

  const visible = $derived(filtered.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < filtered.length);

  $effect(() => {
    activeTag; // track — reset count when filter changes
    visibleCount = 10;
  });
</script>

<!-- Tag filter -->
<div
  id="tag-filters"
  style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"
>
  <button
    data-tag="all"
    onclick={() => (activeTag = "all")}
    style="background:none;border:none;padding:3px 0;font-size:0.7rem;font-family:inherit;cursor:pointer;letter-spacing:0.03em;font-weight:{activeTag === 'all' ? '500' : '400'};color:{activeTag === 'all' ? 'var(--accent)' : 'var(--muted)'}"
    >all</button
  >
  {#each allTags as t}
    <button
      data-tag={t}
      onclick={() => (activeTag = t)}
      style="background:none;border:none;padding:3px 0;font-size:0.7rem;font-family:inherit;cursor:pointer;letter-spacing:0.03em;font-weight:{activeTag === t ? '500' : '400'};color:{activeTag === t ? 'var(--accent)' : 'var(--muted)'}"
      >/ {t.toLowerCase()}</button
    >
  {/each}
</div>

<!-- Post list -->
<div
  id="post-list"
  style="padding-left:20px;padding-right:20px;animation:fadeIn 0.2s ease"
>
  {#each visible as item}
    <div data-tag={item.tag}>
      <FeedItem {...item} />
    </div>
  {/each}
  <InfiniteScroll {hasMore} onLoadMore={() => (visibleCount += 10)} />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/components/home/HomeFeed.svelte
git commit -m "feat: add HomeFeed component with infinite scroll"
```

---

## Task 4: Update `index.astro`

**Files:**
- Modify: `apps/client/src/pages/index.astro`

Replace the inline tag filter `<div id="tag-filters">`, post list `<div id="post-list">`, and the entire `<script>` block with a single `<HomeFeed>` component invocation.

- [ ] **Step 1: Replace the relevant section**

The full updated file:

```astro
---
import { readTime } from "@blabbun/utils";
import { getCollection } from "astro:content";

import HomeFeed from "@/components/home/HomeFeed.svelte";
import NewsletterBar from "@/components/home/NewsletterBar.svelte";
import Layout from "@/layouts/Layout.astro";
import { fetchPostStats } from "@/lib/stats";

const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const stats = await fetchPostStats(posts.slice(0, 10).map((p) => p.id));

const feedItems = posts.map((post) => ({
  date: post.data.pubDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  title: post.data.title,
  excerpt: post.data.description,
  tag: (post.data.tags?.[0] ?? "EDITORIAL").toUpperCase(),
  readTime: readTime(post.body ?? ""),
  imageUrl: post.data.image,
  href: `/${post.id}`,
  claps: stats[post.id]?.claps,
  commentCount: stats[post.id]?.commentCount,
}));

const allTags = [
  ...new Set(
    posts.flatMap((p) => p.data.tags ?? []).map((t) => t.toUpperCase())
  ),
];
---

<Layout>
  <main
    style="max-width:680px;margin:0 auto;padding:32px 32px;width:100%;flex:1;min-height:60vh"
  >
    <!-- Subtitle line -->
    <div
      style="
        margin-bottom:24px;padding-bottom:20px;
        border-bottom:1px solid var(--divider);
        animation:fadeIn 0.2s ease;
      "
    >
      <div style="font-size:0.72rem;color:var(--muted);line-height:1.7">
        unfiltered takes &amp; half-baked thoughts — probably should've kept to
        myself
      </div>
    </div>

    <HomeFeed {feedItems} {allTags} client:load />

    <!-- Newsletter (inline, matching design) -->
    <NewsletterBar client:visible />
  </main>
</Layout>
```

- [ ] **Step 2: Verify the dev server compiles without errors**

```bash
cd apps/client && pnpm dev
```

Open `http://localhost:4321` in a browser. Confirm:
- Posts render
- Tag filter buttons work (clicking a tag hides other posts)
- "— end —" appears at the bottom (since there are only 5 posts, all are visible in the first 10)

Stop the server (`Ctrl+C`) when confirmed.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/index.astro
git commit -m "feat: replace home post list with HomeFeed infinite scroll"
```

---

## Task 5: Update `ArchiveList.svelte`

**Files:**
- Modify: `apps/client/src/components/archive/ArchiveList.svelte`

Add `visibleCount` state, slice `filtered` into `visible`, add `hasMore`, reset `visibleCount` when any filter changes, and render `<InfiniteScroll>` after the `{#each}` block.

- [ ] **Step 1: Replace the file**

`apps/client/src/components/archive/ArchiveList.svelte`:

```svelte
<script lang="ts">
  import { tagClass } from "@blabbun/utils";

  import InfiniteScroll from "@/components/InfiniteScroll.svelte";

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
  let visibleCount = $state(10);

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

  const visible = $derived(filtered.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < filtered.length);

  $effect(() => {
    activeTag; sort; month; // track — reset count when any filter changes
    visibleCount = 10;
  });
</script>

<div class="archive-root">
  <!-- Controls row -->
  <div class="controls-row">
    {#if !lockedTag}
      <div>
        <div class="controls-label">tag</div>
        <div class="tag-filter-row">
          <button
            class="tag-btn"
            class:active={!activeTag}
            onclick={() => (activeTag = null)}>all</button
          >
          {#each tags as t}
            <button
              class="tag-btn"
              class:active={activeTag === t}
              onclick={() => (activeTag = activeTag === t ? null : t)}
              >/ {t.toLowerCase()}</button
            >
          {/each}
        </div>
      </div>
    {/if}

    <div class="controls-right">
      <select bind:value={month} class="sel" aria-label="Filter by month">
        <option value="all">all time</option>
        {#each months as m}
          <option value={m}>
            {new Date(m + "-01").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </option>
        {/each}
      </select>
      <select bind:value={sort} class="sel" aria-label="Sort">
        <option value="newest">newest</option>
        <option value="oldest">oldest</option>
      </select>
    </div>
  </div>

  {#if filtered.length === 0}
    <p style="color:var(--muted);font-size:0.8rem">nothing matches.</p>
  {:else}
    <!-- Archive list -->
    <div class="archive-list">
      {#each visible as p}
        <div class="archive-row">
          <!-- Stretched link -->
          <a href={p.href} class="archive-link" aria-label={p.title}></a>

          <!-- Date + badge + stats -->
          <div class="archive-meta">
            <span class="archive-date">{p.pubDate}</span>
            <span class="archive-badge {tagClass(p.tag)}">{p.tag}</span>
            <span class="archive-stats"
              >👏 {p.claps ?? 0} · 💬 {p.commentCount ?? 0}</span
            >
          </div>

          <!-- Title -->
          <div class="archive-title">{p.title}</div>
        </div>
      {/each}
    </div>
    <InfiniteScroll {hasMore} onLoadMore={() => (visibleCount += 10)} />
  {/if}
</div>

<style>
  /* ─── Controls ────────────────────────────────────────────── */
  .controls-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--divider);
    align-items: flex-end;
  }
  .controls-label {
    font-size: 0.62rem;
    color: var(--muted);
    margin-bottom: 5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .archive-root {
    animation: fadeIn 0.2s ease;
  }
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
  .tag-filter-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .tag-btn {
    background: none;
    border: none;
    padding: 3px 0;
    font-size: 0.7rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    color: var(--muted);
    font-weight: 400;
    transition: color 0.12s;
  }
  .tag-btn.active,
  .tag-btn:hover {
    color: var(--accent);
    font-weight: 500;
  }

  /* ─── Archive row ─────────────────────────────────────────── */
  .archive-list {
    padding-left: 20px;
  }
  .archive-row {
    padding: 13px 0;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    position: relative;
  }
  .archive-link {
    position: absolute;
    inset: 0;
    z-index: 2;
  }
  .archive-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 5px;
    flex-wrap: wrap;
  }
  .archive-date {
    font-size: 0.67rem;
    color: var(--muted);
  }
  .archive-stats {
    font-size: 0.62rem;
    color: var(--muted2);
  }
  .archive-title {
    font-size: 0.86rem;
    font-weight: 500;
    line-height: 1.45;
    color: var(--text);
    transition: color 0.15s;
    text-wrap: pretty;
    position: relative;
    z-index: 1;
  }
  .archive-row:hover .archive-title {
    color: var(--accent);
  }

  /* ─── Badge base ──────────────────────────────────────────── */
  .archive-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 2px;
    letter-spacing: 0.04em;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 2: Verify archive and topics pages in the browser**

```bash
cd apps/client && pnpm dev
```

Open `http://localhost:4321/archive` — confirm posts render and "— end —" appears.
Open `http://localhost:4321/topics/rants` — confirm same.
Stop the server.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/archive/ArchiveList.svelte
git commit -m "feat: add infinite scroll to ArchiveList"
```

---

## Task 6: Update e2e tests

**Files:**
- Modify: `apps/client/tests/e2e/index.spec.ts`
- Modify: `apps/client/tests/e2e/archive.spec.ts`

The existing tests check for specific post titles. Since there are only 5 posts (< 10 initial items), all posts are always visible — existing assertions remain valid without change. The new tests verify that the end marker is present and that the infinite scroll component rendered.

- [ ] **Step 1: Update `index.spec.ts`**

Replace the full file:

```typescript
import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Blab Bun/);
});

test("homepage renders post list", async ({ page }) => {
  await page.goto("/");
  // FeedItem renders h3.feed-title
  await expect(page.locator(".feed-title").first()).toBeVisible();
});

test("homepage shows end marker when all posts are visible", async ({
  page,
}) => {
  await page.goto("/");
  // With 5 posts < 10 initial items, all are rendered and end marker shows
  await expect(page.getByLabel("End of list")).toBeVisible();
});

test("homepage tag filter hides non-matching posts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /\/\s*technical/i }).click();
  // "Hello World" is RANTS tag — should be hidden
  await expect(
    page.locator(".feed-title").filter({ hasText: "Hello World" })
  ).not.toBeVisible();
});

test("homepage tag filter all button restores posts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /\/\s*technical/i }).click();
  await page.getByRole("button", { name: /^all$/i }).click();
  await expect(
    page.locator(".feed-title").filter({ hasText: "Hello World" })
  ).toBeVisible();
});
```

- [ ] **Step 2: Update `archive.spec.ts`**

Add the end-marker test at the bottom of the existing file. The existing `import` line is already there — just append the new test:

```typescript
test("archive shows end marker when all posts fit in initial view", async ({
  page,
}) => {
  await page.goto("/archive");
  // With 5 posts < 10 initial items, end marker is immediately visible
  await expect(page.getByLabel("End of list")).toBeVisible();
});
```

- [ ] **Step 3: Run the full test suite and confirm all pass**

```bash
cd apps/client && pnpm test
```

Expected: all tests pass across Chromium, Firefox, and WebKit. Fix any failures before proceeding.

- [ ] **Step 4: Commit**

```bash
git add apps/client/tests/e2e/index.spec.ts apps/client/tests/e2e/archive.spec.ts
git commit -m "test: update e2e tests for infinite scroll"
```

---

## Task 7: Final smoke check

- [ ] **Step 1: Start the dev server and manually verify all three list pages**

```bash
cd apps/client && pnpm dev
```

Check each page:

| URL | What to verify |
|---|---|
| `http://localhost:4321/` | Posts render, tag filter works, "— end —" shown |
| `http://localhost:4321/archive` | Posts render, tag/sort/month filters work, "— end —" shown |
| `http://localhost:4321/topics/rants` | Tag-filtered posts render, "— end —" shown |

- [ ] **Step 2: Run full test suite one more time**

```bash
cd apps/client && pnpm test
```

All tests green.

- [ ] **Step 3: Stop the server and you're done**
