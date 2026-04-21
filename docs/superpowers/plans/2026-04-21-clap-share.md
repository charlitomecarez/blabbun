# Clap + Share Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a centered clap (toggle like) button and share buttons (Facebook, X/Twitter, Copy Link) to every blog post detail page, below the article content and above the Related Posts section.

**Architecture:** A single Svelte 5 component (`ClapShare.svelte`) placed in `apps/client/src/components/post/`. Clap state is persisted to `localStorage` as a mock for the eventual database integration. Share buttons open the appropriate URLs in a new tab or write to the clipboard.

**Tech Stack:** Svelte 5 (runes), Tailwind CSS, Astro `client:load` island, `localStorage`, `navigator.clipboard`

---

### Task 1: Create the `ClapShare.svelte` component

**Files:**

- Create: `apps/client/src/components/post/ClapShare.svelte`

- [ ] **Step 1: Create the file with props and reactive state**

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    postSlug: string;
    postUrl: string;
    postTitle: string;
  }

  const { postSlug, postUrl, postTitle }: Props = $props();

  const SEED = 12;
  const storageKey = `clap_${postSlug}`;

  let count = $state(SEED);
  let clapped = $state(false);
  let animating = $state(false);
  let copied = $state(false);

  onMount(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { count: number; clapped: boolean };
        count = parsed.count;
        clapped = parsed.clapped;
      }
    } catch {
      // localStorage unavailable — use defaults
    }
  });

  function saveToStorage() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ count, clapped }));
    } catch {
      // ignore
    }
  }

  function handleClap() {
    clapped = !clapped;
    count = clapped ? count + 1 : count - 1;
    animating = true;
    saveToStorage();
    setTimeout(() => (animating = false), 200);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // clipboard not available
    }
  }

  const fbUrl = $derived(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
  );
  const xUrl = $derived(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`
  );
</script>
```

- [ ] **Step 2: Add the template (centered stack layout)**

Append after the `</script>` tag:

```svelte
<div
  class="mx-auto max-w-[760px] border-t-2 border-[#c5f7d0] px-4 pt-10 pb-12 text-center md:px-8"
>
  <!-- Clap button -->
  <button
    onclick={handleClap}
    aria-pressed={clapped}
    aria-label={clapped ? "Remove clap" : "Clap for this post"}
    class="font-manrope mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-6 py-3 text-[15px] font-bold text-[#386547] transition-all duration-150"
    class:bg-[#c5f7d0]={clapped}
    class:bg-[#ebf3ed]={!clapped}
    style={animating ? "transform: scale(1.15)" : "transform: scale(1)"}
  >
    <span style="font-size:20px;" aria-hidden="true">👏</span>
    <span>Clap · {count}</span>
  </button>

  <!-- Share label -->
  <p
    class="font-manrope mb-3 text-[11px] font-bold tracking-[0.12em] text-[rgba(41,48,45,0.4)] uppercase"
  >
    Share this post
  </p>

  <!-- Share icons -->
  <div class="flex items-center justify-center gap-3">
    <!-- Facebook -->
    <a
      href={fbUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on Facebook"
      class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#ebf3ed] text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
        />
      </svg>
    </a>

    <!-- X / Twitter -->
    <a
      href={xUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on X"
      class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#ebf3ed] text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    </a>

    <!-- Copy Link -->
    <button
      onclick={copyLink}
      aria-label="Copy link"
      class="font-manrope flex h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-full border-none bg-[#ebf3ed] px-4 text-[12px] font-bold text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      {#if copied}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg
        >
        Copied!
      {:else}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
          ><path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          /><path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          /></svg
        >
        Copy link
      {/if}
    </button>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/post/ClapShare.svelte
git commit -m "feat: add ClapShare component with localStorage mock and share buttons"
```

---

### Task 2: Integrate `ClapShare` into the post detail page

**Files:**

- Modify: `apps/client/src/pages/[slug].astro`

- [ ] **Step 1: Import the component**

At the top of `[slug].astro`, after the existing imports, add:

```astro
import ClapShare from "@/components/post/ClapShare.svelte";
```

The full import block should look like:

```astro
---
import { FeedItem, PostHero } from "@thelunan/ui/components/cards";
import { getCollection, render } from "astro:content";

import Layout from "@/layouts/Layout.astro";
import ClapShare from "@/components/post/ClapShare.svelte";
---
```

- [ ] **Step 2: Derive the canonical post URL**

Inside the frontmatter (after `const tag = ...`), add:

```astro
const postUrl = `${Astro.site ?? "https://thelunan.com"}/${post.id}`;
```

- [ ] **Step 3: Insert the component between `</article>` and Related Posts**

In the template, locate this comment:

```astro
<!-- ─── Related Posts ───────────────────────────────────────── -->
```

Insert the `ClapShare` island directly above it:

```astro
<!-- ─── Clap + Share ──────────────────────────────────────────── -->
<ClapShare
  client:load
  postSlug={post.id}
  postUrl={postUrl}
  postTitle={post.data.title}
/>

<!-- ─── Related Posts ───────────────────────────────────────── -->
```

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/pages/[slug].astro
git commit -m "feat: integrate ClapShare bar into post detail page"
```

---

### Task 3: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev:client
```

Open any post at `http://localhost:4321/<slug>`.

- [ ] **Step 2: Verify clap button**

- The bar appears below the article body, above Related Posts
- Clap button shows "Clap · 12" (seed value) on first visit
- Clicking increments the count and fills the button green (`bg-[#c5f7d0]`)
- Clicking again decrements and returns to the unfilled state
- Refreshing the page preserves the state (localStorage persisted)

- [ ] **Step 3: Verify share buttons**

- Facebook icon opens `facebook.com/sharer/sharer.php?u=...` in a new tab
- X icon opens `twitter.com/intent/tweet?url=...&text=...` in a new tab
- Copy Link button shows "Copied!" for ~2 seconds, then reverts to "Copy link"
- Paste confirms the correct post URL was copied

- [ ] **Step 4: Verify on mobile width**

Resize browser to 375px. Bar should remain centered and readable — no overflow.
