# Archive Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/archive` page that lists all published posts with client-side tag filtering and sort order control, posts grouped by month.

**Architecture:** Static Astro page loads all posts at build time and passes them to a Svelte 5 component (`ArchiveList.svelte`) that owns filter/sort state. No client fetching — all data is baked in at build time.

**Tech Stack:** Astro 6, Svelte 5 (`$state`/`$derived`), Tailwind CSS 4, Playwright (e2e tests), `@thelunan/ui` FeedItem component.

---

## File Map

| Action | Path                                                    | Responsibility                                                   |
| ------ | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Create | `apps/client/src/components/archive/ArchiveList.svelte` | Filter/sort state, month grouping, renders FeedItem rows         |
| Create | `apps/client/src/pages/archive.astro`                   | Loads posts at build time, passes serialized data to ArchiveList |
| Create | `apps/client/tests/e2e/archive.spec.ts`                 | Playwright e2e tests for the archive route                       |

---

## Task 1: E2E tests (failing)

**Files:**

- Create: `apps/client/tests/e2e/archive.spec.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/client/tests/e2e/archive.spec.ts
import { expect, test } from "@playwright/test";

test("archive page renders heading and post count", async ({ page }) => {
  await page.goto("/archive");
  await expect(page.getByRole("heading", { name: "Archive" })).toBeVisible();
  await expect(page.getByText(/\d+ posts/)).toBeVisible();
});

test("archive lists all posts by default", async ({ page }) => {
  await page.goto("/archive");
  await expect(
    page.getByText("The Tabs vs. Spaces Thing Is Not About Tabs or Spaces")
  ).toBeVisible();
  await expect(page.getByText("On Not Finishing Things")).toBeVisible();
  await expect(page.getByText("Why I Stopped Using Dark Mode")).toBeVisible();
  await expect(page.getByText("Hello World")).toBeVisible();
});

test("tag filter hides posts from other tags", async ({ page }) => {
  await page.goto("/archive");
  // Click the "personal" tag pill — only "On Not Finishing Things" has this tag
  await page.getByRole("button", { name: /personal/i }).click();
  await expect(page.getByText("On Not Finishing Things")).toBeVisible();
  await expect(page.getByText("Hello World")).not.toBeVisible();
});

test("all pill restores full list", async ({ page }) => {
  await page.goto("/archive");
  await page.getByRole("button", { name: /personal/i }).click();
  await expect(page.getByText("Hello World")).not.toBeVisible();
  await page.getByRole("button", { name: /all/i }).click();
  await expect(page.getByText("Hello World")).toBeVisible();
});

test("sort oldest-first reverses the list", async ({ page }) => {
  await page.goto("/archive");
  const titles = page.locator("h3");
  // Default: newest first — first title should be the most recent post
  await expect(titles.first()).toContainText("The Tabs vs. Spaces Thing");
  // Switch to oldest first
  await page.getByRole("combobox").selectOption("oldest");
  await expect(titles.first()).toContainText("Why I Stopped Using Dark Mode");
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd apps/client && pnpm test
```

Expected: all 5 tests fail with "page.goto: net::ERR_CONNECTION_REFUSED" or 404 — `/archive` doesn't exist yet.

- [ ] **Step 3: Commit the failing tests**

```bash
git add apps/client/tests/e2e/archive.spec.ts
git commit -m "test: add failing e2e tests for archive page"
```

---

## Task 2: ArchiveList Svelte component

**Files:**

- Create: `apps/client/src/components/archive/ArchiveList.svelte`

- [ ] **Step 1: Create the component**

```svelte
<!-- apps/client/src/components/archive/ArchiveList.svelte -->
<script lang="ts">
  import { FeedItem } from "@thelunan/ui/components/cards";

  interface PostItem {
    title: string;
    description: string;
    pubDate: string;
    pubDateRaw: string;
    monthGroup: string;
    tag: string;
    href: string;
  }

  interface Props {
    posts: PostItem[];
    tags: string[];
  }

  const { posts, tags }: Props = $props();

  let activeTag = $state("all");
  let sortOrder = $state<"newest" | "oldest">("newest");

  const filtered = $derived(
    posts
      .filter((p) =>
        activeTag === "all"
          ? true
          : p.tag.toLowerCase() === activeTag.toLowerCase()
      )
      .sort((a, b) => {
        const diff =
          new Date(a.pubDateRaw).valueOf() - new Date(b.pubDateRaw).valueOf();
        return sortOrder === "newest" ? -diff : diff;
      })
  );

  const groups = $derived.by(() => {
    const map = new Map<string, PostItem[]>();
    for (const post of filtered) {
      const existing = map.get(post.monthGroup) ?? [];
      map.set(post.monthGroup, [...existing, post]);
    }
    return [...map.entries()];
  });
</script>

<div>
  <!-- Filter bar -->
  <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <!-- Tag pills -->
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => (activeTag = "all")}
        class="font-manrope rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase transition-colors
               {activeTag === 'all'
          ? 'bg-[#386547] text-[#ccf05f]'
          : 'bg-[#ebf3ed] text-[#386547] hover:bg-[#d8ede0]'}"
      >
        All
      </button>
      {#each tags as tag}
        <button
          onclick={() => (activeTag = tag)}
          class="font-manrope rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase transition-colors
                 {activeTag === tag
            ? 'bg-[#386547] text-[#ccf05f]'
            : 'bg-[#ebf3ed] text-[#386547] hover:bg-[#d8ede0]'}"
        >
          {tag}
        </button>
      {/each}
    </div>

    <!-- Sort dropdown -->
    <select
      bind:value={sortOrder}
      class="font-manrope rounded-[8px] border border-[rgba(197,247,208,0.8)] bg-white px-3 py-1.5 text-[13px] text-[#29302d] focus:outline-none"
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </select>
  </div>

  <!-- Grouped post list -->
  {#each groups as [month, monthPosts]}
    <div class="mb-8">
      <div class="mb-2 border-b-2 border-[#c5f7d0] pb-3">
        <span
          class="font-manrope text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase"
        >
          {month}
        </span>
      </div>
      {#each monthPosts as post}
        <FeedItem
          title={post.title}
          excerpt={post.description}
          date={post.pubDate}
          tag={post.tag}
          href={post.href}
        />
      {/each}
    </div>
  {/each}

  {#if filtered.length === 0}
    <p
      class="font-manrope py-12 text-center text-[15px] text-[rgba(41,48,45,0.45)]"
    >
      No posts tagged "{activeTag}".
    </p>
  {/if}
</div>
```

- [ ] **Step 2: Commit the component**

```bash
git add apps/client/src/components/archive/ArchiveList.svelte
git commit -m "feat: add ArchiveList svelte component with tag filter and sort"
```

---

## Task 3: Archive Astro page

**Files:**

- Create: `apps/client/src/pages/archive.astro`

- [ ] **Step 1: Create the page**

```astro
---
// apps/client/src/pages/archive.astro
import { getCollection } from "astro:content";

import ArchiveList from "@/components/archive/ArchiveList.svelte";
import Layout from "@/layouts/Layout.astro";

const allPosts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const postItems = allPosts.map((post) => ({
  title: post.data.title,
  description: post.data.description,
  pubDate: post.data.pubDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  pubDateRaw: post.data.pubDate.toISOString(),
  monthGroup: post.data.pubDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }),
  tag: (post.data.tags?.[0] ?? "EDITORIAL").toUpperCase(),
  href: `/${post.id}`,
}));

const allTags = [...new Set(allPosts.flatMap((p) => p.data.tags ?? []))].sort();
---

<Layout>
  <main class="mx-auto max-w-[1200px] px-4 pt-[88px] pb-20 md:px-8">
    <!-- Page header -->
    <div class="mb-10">
      <h1
        class="font-space-grotesk text-[38px] leading-[1.05] font-bold tracking-[-0.04em] text-[#2d5a3d] sm:text-[46px]"
      >
        Archive<span class="text-[#ccf05f]">.</span>
      </h1>
      <p class="font-manrope mt-2 text-[14px] text-[rgba(41,48,45,0.5)]">
        {allPosts.length} posts
      </p>
    </div>

    <ArchiveList posts={postItems} tags={allTags} client:load />
  </main>
</Layout>
```

- [ ] **Step 2: Start the dev server and manually verify the page looks right**

```bash
cd apps/client && pnpm dev
```

Open http://localhost:4321/archive. Confirm:

- Heading "Archive." renders
- Post count shows "4 posts"
- All 4 demo posts are listed
- Tag pills ("meta", "opinion", "personal") appear
- Clicking a tag pill filters the list
- Sort dropdown changes post order

- [ ] **Step 3: Commit the page**

```bash
git add apps/client/src/pages/archive.astro
git commit -m "feat: add /archive page with tag filtering and sort"
```

---

## Task 4: Run e2e tests and fix any failures

**Files:**

- Modify if needed: any of the above files based on test output

- [ ] **Step 1: Run the full e2e suite**

```bash
cd apps/client && pnpm test
```

Expected: all 5 archive tests pass. The existing "homepage loads" test should also still pass.

- [ ] **Step 2: If any test fails, read the error output carefully**

Common issues:

- `getByRole("button", { name: /all/i })` — if the button text is "All" but another element also matches, scope it: `page.locator(".archive-pills").getByRole("button", { name: /all/i })`
- `titles.first()` in the sort test — if FeedItem renders `<h3>`, the locator `page.locator("h3")` picks up nav elements too. Scope it: `page.locator("article h3").first()`
- Sort test post order — verify `why-i-stopped-using-dark-mode` (Apr 8) is truly the oldest post

If scoping is needed, update the test selectors. Re-run after each fix.

- [ ] **Step 3: Commit fixes if any were needed**

```bash
git add apps/client/tests/e2e/archive.spec.ts
git commit -m "fix: adjust archive e2e selectors after implementation"
```

---

## Task 5: Wire up "Load more entries" link on homepage

The homepage already has a "Load more entries" button pointing to `/archive`. Verify it works.

- [ ] **Step 1: Check the link**

Open http://localhost:4321 and click "Load more entries". Confirm it navigates to `/archive` correctly.

- [ ] **Step 2: If the link is broken, fix it in index.astro**

The href is already `href="/archive"` at line 284 of `apps/client/src/pages/index.astro` — no change needed unless the dev server shows a 404.

- [ ] **Step 3: Final commit**

```bash
git add -p  # stage only if any changes were made
git commit -m "chore: verify archive link from homepage"
```
