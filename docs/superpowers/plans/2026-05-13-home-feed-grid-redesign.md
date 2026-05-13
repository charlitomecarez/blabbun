# Home Feed Grid Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-column infinite-scroll home feed with a two-section layout — a featured hero card + 3 compact sidebar cards in a grid, followed by a paginated listing section with a "load more" button.

**Architecture:** `HomeFeed.svelte` drives everything via derived state (`isGridView`, `featuredPost`, `sidebarPosts`, `listingPosts`). A new `FeaturedCard.svelte` renders the dark hero card. `PostCard` gets a `compact` boolean prop for the sidebar cards. No new API endpoints or changes to `index.astro`.

**Tech Stack:** Svelte 5 (runes), Tailwind CSS 4, Astro 6 SSR

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `apps/client/src/components/home/PostCard.svelte` | Modify | Add `compact` prop + CSS |
| `apps/client/src/components/home/FeaturedCard.svelte` | Create | Dark hero card for the latest post |
| `apps/client/src/components/home/HomeFeed.svelte` | Modify | Grid layout, derived slices, load-more button |
| `apps/client/tests/e2e/index.spec.ts` | Modify | Update selectors for new layout |

---

## Task 1 — Add `compact` prop to `PostCard`

**Files:**
- Modify: `apps/client/src/components/home/PostCard.svelte`

- [ ] **Step 1.1 — Add `compact` to Props and article element**

In the `<script>` block, add `compact?: boolean = false` to the Props interface and destructuring:

```svelte
interface Props {
  // ... existing props
  compact?: boolean;
}

const {
  // ... existing destructuring
  compact = false,
}: Props = $props();
```

Add `class:compact` to the `<article>` element:

```svelte
<article
  style="transform: {articleTransform}; --reveal-delay: {Math.min(index, 4) * 0.05}s"
  class="post-card reveal"
  class:hov
  class:compact
  class:first-post={isFirstPost}
  class:latest-post={isLatest}
  onmouseenter={() => (hov = true)}
  onmouseleave={() => (hov = false)}
>
```

- [ ] **Step 1.2 — Add compact CSS at the bottom of the `<style>` block**

```css
/* ─── Compact mode (sidebar cards in grid) ──────────────────── */
.post-card.compact {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  border-bottom: none;
  margin-bottom: 0;
}

.post-card.compact .this-one {
  display: none;
}

.post-card.compact .post-num,
.post-card.compact .latest-stamp,
.post-card.compact .first-stamp {
  display: none;
}

/* disable the mobile negative-margin bleed in compact mode */
@media (max-width: 640px) {
  .post-card.compact {
    margin-left: 0;
    margin-right: 0;
    padding: 10px 12px;
  }
}
```

- [ ] **Step 1.3 — Verify lint passes**

```bash
cd apps/client && pnpm lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 1.4 — Commit**

```bash
git add apps/client/src/components/home/PostCard.svelte
git commit -m "feat(home): add compact prop to PostCard for grid sidebar"
```

---

## Task 2 — Create `FeaturedCard.svelte`

**Files:**
- Create: `apps/client/src/components/home/FeaturedCard.svelte`

- [ ] **Step 2.1 — Create the file with full implementation**

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  import { BookmarkButton } from "@blabbun/ui/components/post";
  import { tagClass } from "@blabbun/utils";

  interface Props {
    date: string;
    title: string;
    excerpt?: string;
    tags: string[];
    readTime?: string;
    href: string;
    claps?: number;
    commentCount?: number;
    views?: number;
    postNumber?: number;
  }

  const {
    date,
    title,
    excerpt = "",
    tags,
    readTime = "",
    href,
    claps = 0,
    commentCount = 0,
    views = 0,
    postNumber,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let clapCount = $state(claps);
  let hasClapped = $state(false);
  let clapLoading = $state(true);
  let burst = $state(false);
  let showPlus = $state(false);
  let burstTimer: ReturnType<typeof setTimeout> | undefined;
  let plusTimer: ReturnType<typeof setTimeout> | undefined;

  const slug = $derived(href.replace(/^\//, ""));

  onMount(() => {
    fetch(`/api/claps/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<{ count: number; hasClapped: boolean }>;
      })
      .then((data) => {
        clapCount = data.count ?? claps;
        hasClapped = data.hasClapped;
      })
      .catch(() => {})
      .finally(() => {
        clapLoading = false;
      });
    return () => {
      clearTimeout(burstTimer);
      clearTimeout(plusTimer);
    };
  });

  async function toggleClap(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (clapLoading) return;
    const optimisticHasClapped = !hasClapped;
    clapCount = hasClapped ? clapCount - 1 : clapCount + 1;
    hasClapped = optimisticHasClapped;
    burst = true;
    clearTimeout(burstTimer);
    burstTimer = setTimeout(() => (burst = false), 350);
    if (optimisticHasClapped) {
      showPlus = true;
      clearTimeout(plusTimer);
      plusTimer = setTimeout(() => (showPlus = false), 700);
    }
    try {
      const res = await fetch(`/api/claps/${slug}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { count: number; hasClapped: boolean };
      clapCount = data.count;
      hasClapped = data.hasClapped;
    } catch {
      clapCount = hasClapped ? clapCount - 1 : clapCount + 1;
      hasClapped = !hasClapped;
    }
  }
</script>

<article class="featured-card">
  <!-- Stretched link — z-index 0, covers entire card -->
  <a {href} class="featured-link" aria-label="Read: {title}"></a>

  <!-- LATEST badge -->
  <div class="featured-latest">🚀 LATEST</div>

  <!-- First tag pill (top-right) -->
  {#each tags.slice(0, 1) as t}
    <div class="featured-tag-badge {tagClass(t)}">{t.toLowerCase()}</div>
  {/each}

  <!-- Spacer pushes content to bottom -->
  <div class="featured-spacer"></div>

  <!-- Post number + date -->
  <div class="featured-meta">
    {#if postNumber}<span class="featured-num">#{postNumber}</span>{/if}
    <span class="featured-date">{date}</span>
  </div>

  <!-- Title -->
  <h2 class="featured-title">{title}</h2>

  <!-- Excerpt -->
  {#if excerpt}
    <p class="featured-excerpt">{excerpt}</p>
  {/if}

  <!-- Read time + views -->
  <div class="featured-stats">
    {#if readTime}<span>{readTime}</span>{/if}
    {#if views > 0}<span>{views.toLocaleString()} views</span>{/if}
  </div>

  <!-- Action row — z-index 10 to sit above stretched link -->
  <div class="featured-actions">
    <button
      type="button"
      class="featured-clap"
      class:clapped={hasClapped}
      class:burst
      onclick={toggleClap}
      disabled={clapLoading}
      title={hasClapped ? "remove clap" : "clap for this post"}
      aria-pressed={hasClapped}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 11.5V6a1.5 1.5 0 0 1 3 0v3m0-3a1.5 1.5 0 0 1 3 0v3m0-2a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-14 0v-4a1.5 1.5 0 0 1 3 0v2"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{clapCount}</span>
      {#if showPlus}<span class="clap-plus" aria-hidden="true">+1</span>{/if}
    </button>

    {#if commentCount > 0}
      <span class="featured-comments">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {commentCount}
      </span>
    {/if}

    <div class="featured-bookmark-wrap"><BookmarkButton {slug} /></div>

    <span class="featured-cta" aria-hidden="true">read →</span>
  </div>
</article>

<style>
  .featured-card {
    background: var(--featured-bg, #1a1008);
    border-radius: 8px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    min-height: 280px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle accent gradient overlay */
  .featured-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--accent) 12%, transparent) 0%,
      transparent 60%
    );
    pointer-events: none;
  }

  /* Stretched link */
  .featured-link {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: 8px;
  }

  .featured-latest {
    position: absolute;
    top: 14px;
    left: 14px;
    background: var(--accent);
    color: #fff;
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    z-index: 2;
  }

  .featured-tag-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    border-radius: 20px;
    padding: 2px 9px;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    z-index: 2;
  }

  .featured-spacer {
    flex: 1;
  }

  .featured-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 5px;
    position: relative;
    z-index: 1;
  }

  .featured-num {
    font-size: 0.6rem;
    color: color-mix(in srgb, var(--muted) 60%, transparent);
    font-style: italic;
  }

  .featured-date {
    font-size: 0.6rem;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .featured-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 8px;
    text-wrap: pretty;
    position: relative;
    z-index: 1;
  }

  .featured-excerpt {
    font-size: 0.72rem;
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .featured-stats {
    display: flex;
    gap: 10px;
    font-size: 0.6rem;
    color: color-mix(in srgb, var(--muted) 60%, transparent);
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
  }

  /* ─── Action row ──────────────────────────────────────────────── */
  .featured-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    position: relative;
    z-index: 10;
  }

  .featured-clap {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 0.6rem;
    color: var(--accent);
    cursor: pointer;
    font-family: inherit;
    position: relative;
    transition:
      background 0.15s,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .featured-clap.clapped {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .featured-clap.burst {
    transform: scale(1.2);
  }

  .featured-clap:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .clap-plus {
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.55rem;
    font-weight: 700;
    color: var(--accent);
    pointer-events: none;
    animation: float-up 0.7s ease forwards;
  }

  @keyframes float-up {
    0% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  }

  .featured-comments {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: color-mix(in srgb, var(--bg) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 0.6rem;
    color: var(--muted);
  }

  .featured-bookmark-wrap {
    /* BookmarkButton has its own pill style */
  }

  .featured-cta {
    margin-left: auto;
    background: var(--accent);
    color: #fff;
    border-radius: 4px;
    padding: 5px 14px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    pointer-events: none;
  }

  /* Dark mode override — featured-bg token */
  @media (prefers-color-scheme: dark) {
    .featured-card {
      --featured-bg: #16120e;
    }
  }
</style>
```

- [ ] **Step 2.2 — Verify lint passes**

```bash
cd apps/client && pnpm lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2.3 — Commit**

```bash
git add apps/client/src/components/home/FeaturedCard.svelte
git commit -m "feat(home): add FeaturedCard dark hero component"
```

---

## Task 3 — Rewrite `HomeFeed.svelte` layout

**Files:**
- Modify: `apps/client/src/components/home/HomeFeed.svelte`

- [ ] **Step 3.1 — Replace the full file content**

```svelte
<script lang="ts">
  import FeaturedCard from "@/components/home/FeaturedCard.svelte";
  import PostCard from "@/components/home/PostCard.svelte";

  interface FeedItemData {
    date: string;
    title: string;
    excerpt?: string;
    tags: string[];
    readTime?: string;
    imageUrl?: string;
    href: string;
    claps?: number;
    commentCount?: number;
    views?: number;
    postNumber?: number;
    isLatest?: boolean;
  }

  interface Props {
    feedItems: FeedItemData[];
    allTags: string[];
  }

  const { feedItems, allTags }: Props = $props();

  let activeTag = $state("all");
  let visibleCount = $state(10);
  let sort = $state<"newest" | "oldest">("newest");

  const filtered = $derived(
    (activeTag === "all"
      ? feedItems
      : feedItems.filter((item) => item.tags.includes(activeTag))
    )
      .slice()
      .sort((a, b) =>
        sort === "oldest"
          ? (a.postNumber ?? 0) - (b.postNumber ?? 0)
          : (b.postNumber ?? 0) - (a.postNumber ?? 0)
      )
  );

  // Grid view only when default sort+filter — featured layout makes sense newest-first only
  const isGridView = $derived(sort === "newest" && activeTag === "all");

  const featuredPost = $derived(filtered[0] ?? null);
  const sidebarPosts = $derived(filtered.slice(1, 4));
  // listing starts at post 5 in grid view, post 1 in flat view
  const listingPosts = $derived(isGridView ? filtered.slice(4) : filtered);
  const visibleListing = $derived(listingPosts.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < listingPosts.length);

  $effect(() => {
    activeTag;
    sort; // reset pagination when filter/sort changes
    visibleCount = 10;
  });
</script>

<!-- Sort toggle -->
<div style="position:relative; margin-bottom:8px; margin-top:8px;">
  <span
    class="handwritten"
    style="position:absolute; top:-14px; right:12px; background:var(--accent2); color:#fff; font-size:1.1rem; padding:4px 14px; border-radius:14px; transform:rotate(6deg); animation:wiggle 3s ease-in-out infinite; box-shadow:2px 2px 0 var(--text); z-index:5;"
    aria-hidden="true"
  >
    fresh out the oven!
  </span>
  <button
    class="handwritten sort-btn"
    onclick={() => (sort = sort === "newest" ? "oldest" : "newest")}
    aria-label="Toggle sort order"
  >
    {sort === "newest" ? "latest blab ↓" : "oldest blab ↑"}
  </button>
</div>

<!-- Tag filter -->
<nav
  id="tag-filters"
  aria-label="Filter posts by tag"
  class="tag-filter-wrap flex flex-wrap gap-x-4 gap-y-1"
>
  <span class="handwritten filter-label" aria-hidden="true">filter:</span>
  <button
    data-tag="all"
    onclick={() => (activeTag = "all")}
    aria-pressed={activeTag === "all"}
    class="tag-btn"
    class:tag-btn--active={activeTag === "all"}
  >
    all
  </button>
  {#each allTags as t}
    <button
      data-tag={t}
      onclick={() => (activeTag = t)}
      aria-pressed={activeTag === t}
      class="tag-btn"
      class:tag-btn--active={activeTag === t}
    >
      / {t.toLowerCase()}
    </button>
  {/each}
</nav>

{#if isGridView && featuredPost}
  <!-- ── Grid section ─────────────────────────────────────────── -->
  <section class="grid-section" aria-label="Featured posts">
    <div class="featured-grid">
      <FeaturedCard
        date={featuredPost.date}
        title={featuredPost.title}
        excerpt={featuredPost.excerpt}
        tags={featuredPost.tags}
        readTime={featuredPost.readTime}
        href={featuredPost.href}
        claps={featuredPost.claps}
        commentCount={featuredPost.commentCount}
        views={featuredPost.views}
        postNumber={featuredPost.postNumber}
      />
      <div class="sidebar-col">
        <div class="sidebar-label handwritten">also fresh</div>
        {#each sidebarPosts as item, i}
          <PostCard {...item} index={i} compact={true} />
        {/each}
      </div>
    </div>
  </section>

  {#if visibleListing.length > 0}
    <!-- ── Divider ──────────────────────────────────────────────── -->
    <div class="listing-divider" aria-hidden="true">
      <span class="divider-label">more posts</span>
    </div>

    <!-- ── Listing section ─────────────────────────────────────── -->
    <section class="listing-section" aria-label="More posts">
      {#each visibleListing as item, i}
        <PostCard {...item} index={i} />
      {/each}
    </section>
  {/if}

{:else}
  <!-- ── Flat list (oldest sort or tag filter active) ─────────── -->
  <div id="post-list" class="animate-[fadeIn_0.2s_ease] px-5">
    {#each visibleListing.map((item, i) => ({ ...item, isLatest: i === 0 })) as item, i}
      <PostCard {...item} index={i} />
    {/each}
  </div>
{/if}

<!-- ── Load more button ──────────────────────────────────────── -->
{#if hasMore}
  <div class="load-more-wrap">
    <button class="load-more-btn" onclick={() => (visibleCount += 10)}>
      ↓ load more posts
    </button>
  </div>
{/if}

<style>
  /* ─── Sort button ────────────────────────────────────────────── */
  .sort-btn {
    font-size: 1.4rem;
    color: var(--accent);
    margin-bottom: 4px;
    transform: rotate(-1deg);
    display: inline-block;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: "Caveat", cursive;
    text-decoration-line: underline;
    text-decoration-style: dashed;
    text-decoration-color: transparent;
    text-underline-offset: 3px;
    transition: text-decoration-color 0.15s;
  }

  .sort-btn:hover {
    text-decoration-color: var(--accent);
  }

  /* ─── Tag filter ─────────────────────────────────────────────── */
  .tag-filter-wrap {
    border-top: 1px solid var(--divider);
    padding-top: 18px;
    margin-top: 20px;
    margin-bottom: 4px;
    align-items: center;
  }

  .filter-label {
    font-size: 1rem;
    color: var(--muted);
    margin-right: 4px;
    line-height: 1;
    align-self: center;
  }

  .tag-btn {
    background: none;
    border: none;
    padding: 3px 0;
    font-size: 0.7rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    font-weight: 400;
    color: var(--muted);
    transition: color 0.12s;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  .tag-btn:hover {
    color: var(--accent);
  }

  .tag-btn--active {
    color: var(--accent);
    font-weight: 500;
  }

  /* ─── Featured grid ──────────────────────────────────────────── */
  .grid-section {
    margin-top: 20px;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 12px;
    align-items: start;
  }

  /* ─── Sidebar column ─────────────────────────────────────────── */
  .sidebar-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sidebar-label {
    font-size: 0.85rem;
    color: var(--muted2);
    margin-bottom: 2px;
    transform: rotate(-1deg);
    display: inline-block;
  }

  /* ─── Listing divider ────────────────────────────────────────── */
  .listing-divider {
    position: relative;
    border-top: 1px dashed var(--border);
    margin: 28px 0 0;
    text-align: center;
  }

  .divider-label {
    position: relative;
    top: -9px;
    display: inline-block;
    background: var(--bg);
    padding: 0 12px;
    font-size: 0.65rem;
    color: var(--muted2);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ─── Listing section ────────────────────────────────────────── */
  .listing-section {
    padding: 0 20px;
  }

  /* ─── Load more ──────────────────────────────────────────────── */
  .load-more-wrap {
    display: flex;
    justify-content: center;
    margin: 24px 0 8px;
  }

  .load-more-btn {
    background: none;
    border: 1.5px dashed var(--border);
    border-radius: 6px;
    padding: 10px 32px;
    font-size: 0.72rem;
    font-family: inherit;
    color: var(--muted);
    cursor: pointer;
    letter-spacing: 0.04em;
    transition:
      color 0.15s,
      border-color 0.15s;
  }

  .load-more-btn:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  /* ─── Mobile: stack grid vertically ─────────────────────────── */
  @media (max-width: 640px) {
    .featured-grid {
      grid-template-columns: 1fr;
    }

    .listing-section {
      padding: 0;
    }
  }
</style>
```

- [ ] **Step 3.2 — Verify lint passes**

```bash
cd apps/client && pnpm lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3.3 — Start dev server and verify visually**

```bash
pnpm dev:client
```

Open `http://localhost:4321` and check:
- Grid renders: dark featured card left, 3 compact cards right
- "also fresh" label appears above sidebar
- Listing section appears below the dashed divider when there are posts 5+
- "↓ load more posts" button appears when there are more posts
- Clicking load more appends 10 more rows
- Switching sort to "oldest" collapses to flat list
- Filtering by a tag collapses to flat list
- Switching back to "all" + "newest" restores grid view
- Mobile (< 640px): grid stacks vertically

- [ ] **Step 3.4 — Commit**

```bash
git add apps/client/src/components/home/HomeFeed.svelte
git commit -m "feat(home): two-section grid layout with featured card and load more"
```

---

## Task 4 — Update e2e tests

**Files:**
- Modify: `apps/client/tests/e2e/index.spec.ts`

- [ ] **Step 4.1 — Replace test file content**

The existing tests reference `.feed-title` (stale) and `[aria-label="End of list"]` (InfiniteScroll removed). Replace with tests that match the new layout:

```typescript
import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Blab Bun/);
});

test("homepage renders featured card", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".featured-card")).toBeVisible();
});

test("homepage renders post titles in listing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".post-title").first()).toBeVisible();
});

test("homepage tag filter collapses to flat list", async ({ page }) => {
  await page.goto("/");
  // Wait for grid to be present in default state
  await expect(page.locator(".featured-card")).toBeVisible();
  // Click a tag filter — grid should collapse
  const tagBtn = page.locator(".tag-btn").filter({ hasText: /\// }).first();
  await tagBtn.click();
  await expect(page.locator(".featured-card")).not.toBeVisible();
});

test("homepage tag filter all button restores grid", async ({ page }) => {
  await page.goto("/");
  const tagBtn = page.locator(".tag-btn").filter({ hasText: /\// }).first();
  await tagBtn.click();
  await page.getByRole("button", { name: /^all$/i }).click();
  await expect(page.locator(".featured-card")).toBeVisible();
});

test("homepage sort toggle collapses grid to flat list", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".featured-card")).toBeVisible();
  await page.getByRole("button", { name: /oldest blab|latest blab/i }).click();
  await expect(page.locator(".featured-card")).not.toBeVisible();
});
```

- [ ] **Step 4.2 — Run e2e tests**

```bash
cd apps/client && pnpm test
```

Expected: all tests pass. If a test fails because there aren't enough posts in the test fixture to fill the grid + listing, check `src/content/posts/` — you may need to relax a test assertion (e.g. featured card only shows when `filtered.length >= 1`, which should always be true in tests).

- [ ] **Step 4.3 — Commit**

```bash
git add apps/client/tests/e2e/index.spec.ts
git commit -m "test(e2e): update homepage tests for grid layout"
```
