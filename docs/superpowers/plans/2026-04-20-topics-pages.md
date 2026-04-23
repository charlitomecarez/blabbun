# Topics Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/topics` index and `/topics/[tag]` detail pages that let readers browse posts by tag, reusing the existing `ArchiveList` component.

**Architecture:** `ArchiveList.svelte` gains an optional `lockedTag` prop that hides filter pills and pre-filters to one tag. Two static Astro pages consume it: `topics/index.astro` lists all tags, `topics/[tag].astro` renders a locked filtered list. All data loaded at build time.

**Tech Stack:** Astro 6, Svelte 5 (`$props`, `$state`), Tailwind CSS 4, Playwright (e2e tests), `@blabbun/ui` FeedItem.

---

## File Map

| Action | Path                                                    | Responsibility                                     |
| ------ | ------------------------------------------------------- | -------------------------------------------------- |
| Modify | `apps/client/src/components/archive/ArchiveList.svelte` | Add `lockedTag?: string` prop; hide pills when set |
| Create | `apps/client/src/pages/topics/index.astro`              | List all tags with post counts                     |
| Create | `apps/client/src/pages/topics/[tag].astro`              | Filtered post list for one tag                     |
| Create | `apps/client/tests/e2e/topics.spec.ts`                  | Playwright e2e tests                               |

---

## Task 1: E2E tests (failing)

**Files:**

- Create: `apps/client/tests/e2e/topics.spec.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/client/tests/e2e/topics.spec.ts
import { expect, test } from "@playwright/test";

test("topics index renders heading", async ({ page }) => {
  await page.goto("/topics");
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
});

test("topics index lists all tags", async ({ page }) => {
  await page.goto("/topics");
  // All 3 tags from the demo posts must appear
  await expect(page.getByText(/opinion/i).first()).toBeVisible();
  await expect(page.getByText(/personal/i).first()).toBeVisible();
  await expect(page.getByText(/meta/i).first()).toBeVisible();
});

test("topics index links to topic detail page", async ({ page }) => {
  await page.goto("/topics");
  await page
    .getByRole("link", { name: /opinion/i })
    .first()
    .click();
  await expect(page).toHaveURL("/topics/opinion");
});

test("topic detail renders heading and filtered posts", async ({ page }) => {
  await page.goto("/topics/opinion");
  await expect(page.getByRole("heading", { name: /opinion/i })).toBeVisible();
  const titles = page.locator("article h3");
  // Both opinion posts must be visible
  await expect(
    titles.filter({ hasText: "The Tabs vs. Spaces Thing" })
  ).toBeVisible();
  await expect(
    titles.filter({ hasText: "Why I Stopped Using Dark Mode" })
  ).toBeVisible();
  // Personal post must NOT appear
  await expect(
    titles.filter({ hasText: "On Not Finishing Things" })
  ).not.toBeVisible();
});

test("topic detail has no filter pills", async ({ page }) => {
  await page.goto("/topics/opinion");
  // The "All" pill only exists on the archive page, not on locked topic pages
  await expect(page.getByRole("button", { name: /^all$/i })).not.toBeVisible();
});

test("topic detail back link goes to /topics", async ({ page }) => {
  await page.goto("/topics/opinion");
  await page.getByRole("link", { name: /← topics/i }).click();
  await expect(page).toHaveURL("/topics");
});

test("topic detail sort oldest-first works", async ({ page }) => {
  await page.goto("/topics/opinion");
  const titles = page.locator("article h3");
  // Default newest first: tabs post is Apr 19
  await expect(titles.first()).toContainText("The Tabs vs. Spaces Thing");
  await page.getByRole("combobox", { name: /sort/i }).selectOption("oldest");
  // Oldest: dark mode post is Apr 8
  await expect(titles.first()).toContainText("Why I Stopped Using Dark Mode");
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /path/to/apps/client && pnpm test --project=chromium 2>&1 | tail -20
```

Expected: all 7 new tests fail (404 or navigation error — `/topics` doesn't exist yet). Existing 6 tests should still pass.

- [ ] **Step 3: Commit the failing tests**

```bash
git add apps/client/tests/e2e/topics.spec.ts
git commit -m "test: add failing e2e tests for topics pages"
```

---

## Task 2: Add `lockedTag` prop to ArchiveList

**Files:**

- Modify: `apps/client/src/components/archive/ArchiveList.svelte`

- [ ] **Step 1: Read the current file**

Read `apps/client/src/components/archive/ArchiveList.svelte` in full before editing.

- [ ] **Step 2: Update the Props interface and script**

Replace the `interface Props` block and the two state/derived lines:

**Before:**

```svelte
  interface Props {
    posts: PostItem[];
    tags: string[];
  }

  const { posts, tags }: Props = $props();

  let activeTag = $state("all");
  let sortOrder = $state<"newest" | "oldest">("newest");
```

**After:**

```svelte
  interface Props {
    posts: PostItem[];
    tags: string[];
    lockedTag?: string; // uppercase tag — hides filter pills and pre-filters list
  }

  const { posts, tags, lockedTag }: Props = $props();

  let activeTag = $state(lockedTag ?? "all");
  let sortOrder = $state<"newest" | "oldest">("newest");
```

- [ ] **Step 3: Update the filter bar in the template**

Replace the entire `<!-- Filter bar -->` div:

**Before:**

```svelte
<!-- Filter bar -->
<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
  <!-- Tag pills -->
  <div class="flex flex-wrap gap-2">
    <button
      onclick={() => (activeTag = "all")}
      aria-pressed={activeTag === "all"}
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
        aria-pressed={activeTag === tag}
        class="font-manrope rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase transition-colors
                 {activeTag === tag
          ? 'bg-[#386547] text-[#ccf05f]'
          : 'bg-[#ebf3ed] text-[#386547] hover:bg-[#d8ede0]'}"
      >
        {tag}
      </button>
    {/each}
  </div>

  <!-- Sort dropdown — aria-label required by e2e test contract -->
  <select
    aria-label="Sort"
    bind:value={sortOrder}
    class="font-manrope rounded-[8px] border border-[rgba(197,247,208,0.8)] bg-white px-3 py-1.5 text-[13px] text-[#29302d] focus:outline-none"
  >
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
  </select>
</div>
```

**After:**

```svelte
<!-- Filter bar -->
<div
  class="mb-6 flex flex-wrap items-center gap-4
           {lockedTag ? 'justify-end' : 'justify-between'}"
>
  {#if !lockedTag}
    <!-- Tag pills -->
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => (activeTag = "all")}
        aria-pressed={activeTag === "all"}
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
          aria-pressed={activeTag === tag}
          class="font-manrope rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase transition-colors
                   {activeTag === tag
            ? 'bg-[#386547] text-[#ccf05f]'
            : 'bg-[#ebf3ed] text-[#386547] hover:bg-[#d8ede0]'}"
        >
          {tag}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Sort dropdown — aria-label required by e2e test contract -->
  <select
    aria-label="Sort"
    bind:value={sortOrder}
    class="font-manrope rounded-[8px] border border-[rgba(197,247,208,0.8)] bg-white px-3 py-1.5 text-[13px] text-[#29302d] focus:outline-none"
  >
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
  </select>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/components/archive/ArchiveList.svelte
git commit -m "feat: add lockedTag prop to ArchiveList for topic detail pages"
```

---

## Task 3: Topics index page

**Files:**

- Create: `apps/client/src/pages/topics/index.astro`

- [ ] **Step 1: Create the file**

```astro
---
// apps/client/src/pages/topics/index.astro
import { getCollection } from "astro:content";

import Layout from "@/layouts/Layout.astro";

const allPosts = await getCollection("posts", ({ data }) => !data.draft);

// Build tag → post count map, uppercase keys, sorted alphabetically
const tagMap = new Map<string, number>();
for (const post of allPosts) {
  for (const raw of post.data.tags ?? []) {
    const tag = raw.toUpperCase();
    tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
  }
}

const topics = [...tagMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([tag, count]) => ({
    tag,
    count,
    slug: tag.toLowerCase(),
    label: tag.charAt(0) + tag.slice(1).toLowerCase(),
  }));
---

<Layout>
  <main class="mx-auto max-w-[1200px] px-4 pt-[64px] pb-20 md:px-8">
    <div class="mb-10 pt-12 md:pt-16">
      <h1
        class="font-space-grotesk text-[38px] leading-[1.05] font-bold tracking-[-0.04em] text-[#2d5a3d] sm:text-[46px]"
      >
        Topics<span class="text-[#ccf05f]">.</span>
      </h1>
      <p class="font-manrope mt-2 text-[14px] text-[rgba(41,48,45,0.5)]">
        {topics.length}
        {topics.length === 1 ? "topic" : "topics"}
      </p>
    </div>

    <div class="mb-2 border-b-2 border-[#c5f7d0] pb-3">
      <span
        class="font-manrope text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase"
      >
        All Topics
      </span>
    </div>

    <div>
      {
        topics.map(({ tag, count, slug, label }) => (
          <a
            href={`/topics/${slug}`}
            class="group -mx-2 flex items-center gap-4 rounded-lg border-b border-[rgba(197,247,208,0.4)] px-2 py-4 transition-colors hover:bg-[rgba(197,247,208,0.06)]"
          >
            <span class="font-manrope rounded-full bg-[#ebf3ed] px-3 py-1 text-[11px] font-bold tracking-[0.06em] text-[#386547] uppercase transition-colors group-hover:bg-[#386547] group-hover:text-[#ccf05f]">
              {tag}
            </span>
            <span class="font-manrope flex-1 text-[15px] font-semibold text-[#29302d]">
              {label}
            </span>
            <span class="font-manrope text-[13px] text-[rgba(41,48,45,0.4)]">
              {count} {count === 1 ? "post" : "posts"}
            </span>
          </a>
        ))
      }
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/pages/topics/index.astro
git commit -m "feat: add /topics index page"
```

---

## Task 4: Topic detail page

**Files:**

- Create: `apps/client/src/pages/topics/[tag].astro`

- [ ] **Step 1: Create the file**

```astro
---
// apps/client/src/pages/topics/[tag].astro
import { getCollection } from "astro:content";

import ArchiveList from "@/components/archive/ArchiveList.svelte";
import Layout from "@/layouts/Layout.astro";

export async function getStaticPaths() {
  const allPosts = await getCollection("posts", ({ data }) => !data.draft);
  const tags = [...new Set(allPosts.flatMap((p) => p.data.tags ?? []))];
  return tags.map((tag) => ({
    params: { tag: tag.toLowerCase() },
    props: { tag: tag.toUpperCase() },
  }));
}

interface Props {
  tag: string;
}

const { tag } = Astro.props;

const allPosts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const tagPosts = allPosts.filter((p) =>
  p.data.tags?.map((t) => t.toUpperCase()).includes(tag)
);

const postItems = tagPosts.map((post) => ({
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

const label = tag.charAt(0) + tag.slice(1).toLowerCase();
---

<Layout>
  <main class="mx-auto max-w-[1200px] px-4 pt-[64px] pb-20 md:px-8">
    <div class="mb-10 pt-12 md:pt-16">
      <a
        href="/topics"
        class="font-manrope group mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[rgba(41,48,45,0.5)] transition-colors hover:text-[#386547]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          class="transition-transform group-hover:-translate-x-0.5"
        >
          <path
            d="M13 7H1M6 2L1 7l5 5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"></path>
        </svg>
        ← Topics
      </a>

      <div class="mt-4">
        <span
          class="font-manrope rounded-full bg-[#ccf05f] px-3 py-1 text-[11px] font-bold tracking-[0.06em] text-[#29302d] uppercase"
        >
          {tag}
        </span>
      </div>

      <h1
        class="font-space-grotesk mt-3 text-[38px] leading-[1.05] font-bold tracking-[-0.04em] text-[#2d5a3d] sm:text-[46px]"
      >
        {label}<span class="text-[#ccf05f]">.</span>
      </h1>
      <p class="font-manrope mt-2 text-[14px] text-[rgba(41,48,45,0.5)]">
        {postItems.length}
        {postItems.length === 1 ? "post" : "posts"}
      </p>
    </div>

    <ArchiveList posts={postItems} tags={[]} lockedTag={tag} client:load />
  </main>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/pages/topics/[tag].astro
git commit -m "feat: add /topics/[tag] detail page"
```

---

## Task 5: Run e2e tests and fix any failures

**Files:**

- Modify if needed: test or page files based on failures

- [ ] **Step 1: Run the full suite**

```bash
cd apps/client && pnpm test --project=chromium 2>&1
```

Expected: all 13 tests pass (6 existing + 7 new topics tests).

- [ ] **Step 2: Diagnose failures if any**

Common issues:

- **`getByRole("link", { name: /opinion/i })` is ambiguous** — the tag pill and the topic label both contain "Opinion". Scope it: `page.locator("a[href='/topics/opinion']")` or add `data-testid`.
- **`getByRole("link", { name: /← topics/i })` fails** — the back link text includes an SVG. The accessible name may be just "Topics" without the arrow. Try `page.getByRole("link", { name: /topics/i }).first()` and scope by page section if needed.
- **`/topics/opinion` returns 404** — check that `tag.toLowerCase()` in `getStaticPaths` matches the URL param. Verify with `pnpm build && pnpm preview` if the dev server doesn't catch it.

- [ ] **Step 3: Commit fixes**

```bash
git add apps/client/tests/e2e/topics.spec.ts
git commit -m "fix: adjust topics e2e selectors after implementation"
```
