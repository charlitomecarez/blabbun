# Interactive Reading Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four client-side interactive features to the post reading page — section progress dots, a mid-scroll reaction prompt, scroll-triggered checkpoint dividers, and a text-selection quote popover — to reduce reader drop-off and increase engagement.

**Architecture:** All four are new Svelte 5 components mounted in `apps/client/src/pages/[slug].astro`. No new API routes. State lives in `localStorage` using namespaced keys per post slug. `ReadingDots` and `MidScrollReaction` live in `packages/ui/components/post/`; `CheckpointDividers` and `QuotePopover` live in `apps/client/src/components/post/` because they manipulate the app's DOM directly.

**Tech Stack:** Svelte 5 runes (`$props()`, `$state()`, `$effect()`, `onMount`), `IntersectionObserver`, Clipboard API, localStorage, Playwright (e2e tests), CSS custom properties (`var(--accent)`, `var(--bg)`, etc.)

---

## File Map

| Action | Path |
|---|---|
| Create | `packages/ui/components/post/ReadingDots.svelte` |
| Create | `packages/ui/components/post/MidScrollReaction.svelte` |
| Modify | `packages/ui/components/post/index.ts` |
| Create | `apps/client/src/components/post/CheckpointDividers.svelte` |
| Create | `apps/client/src/components/post/QuotePopover.svelte` |
| Modify | `apps/client/src/pages/[slug].astro` |
| Create | `apps/client/tests/e2e/interactive-reading.spec.ts` |

---

## Task 1: ReadingDots component

**Files:**
- Create: `packages/ui/components/post/ReadingDots.svelte`
- Modify: `packages/ui/components/post/index.ts`
- Modify: `apps/client/src/pages/[slug].astro`
- Create: `apps/client/tests/e2e/interactive-reading.spec.ts`

A fixed column of dots left of the article (desktop only). One dot per `h2`. Active dot = filled accent, past = faded, upcoming = muted. Click scrolls to that section.

- [ ] **Step 1: Create `ReadingDots.svelte`**

Create `packages/ui/components/post/ReadingDots.svelte` with this content:

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  interface Section {
    title: string;
    el: HTMLElement;
  }

  let sections = $state<Section[]>([]);
  let activeIndex = $state(0);
  let mounted = $state(false);

  onMount(() => {
    const h2s = Array.from(
      document.querySelectorAll(".post-content h2")
    ) as HTMLElement[];
    if (h2s.length <= 1) return;

    sections = h2s.map((el) => ({
      title: el.textContent?.trim() ?? "",
      el,
    }));
    mounted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sections.findIndex((s) => s.el === entry.target);
            if (idx !== -1) activeIndex = idx;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const s of sections) observer.observe(s.el);
    return () => observer.disconnect();
  });

  function scrollToSection(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

{#if mounted && sections.length > 1}
  <nav class="reading-dots" aria-label="Article sections">
    {#each sections as section, i}
      <button
        type="button"
        class="dot"
        class:active={i === activeIndex}
        class:past={i < activeIndex}
        onclick={() => scrollToSection(section.el)}
        aria-label={section.title}
        title={section.title}
      ></button>
      {#if i < sections.length - 1}
        <div class="dot-line" aria-hidden="true"></div>
      {/if}
    {/each}
  </nav>
{/if}

<style>
  .reading-dots {
    position: fixed;
    /* Sits just left of the 680px content column */
    left: calc(50% - 340px - 28px);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 50;
  }

  @media (max-width: 900px) {
    .reading-dots {
      display: none;
    }
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: var(--muted2);
    cursor: pointer;
    padding: 0;
    transition:
      background 0.2s,
      transform 0.2s;
    flex-shrink: 0;
  }

  .dot.active {
    background: var(--accent);
    transform: scale(1.3);
  }

  .dot.past {
    background: color-mix(in srgb, var(--accent) 45%, transparent);
  }

  .dot:hover:not(.active) {
    transform: scale(1.4);
    background: var(--muted);
  }

  .dot-line {
    width: 2px;
    height: 14px;
    background: var(--divider);
    flex-shrink: 0;
  }
</style>
```

- [ ] **Step 2: Export from barrel**

Edit `packages/ui/components/post/index.ts` — add `ReadingDots` to the exports:

```ts
export { default as BookmarkButton } from "./BookmarkButton.svelte";
export { default as ReactionBar } from "./ReactionBar.svelte";
export { default as ReadingDots } from "./ReadingDots.svelte";
export { default as ReadingProgress } from "./ReadingProgress.svelte";
```

- [ ] **Step 3: Mount in `[slug].astro`**

Open `apps/client/src/pages/[slug].astro`. Add `ReadingDots` to the import on line 3:

```astro
import {
  BookmarkButton,
  ReactionBar,
  ReadingDots,
  ReadingProgress,
} from "@blabbun/ui/components/post";
```

Then add the component just after the existing `<ReadingProgress client:idle />` (around line 95):

```astro
<ReadingProgress client:idle />
<ReadingDots client:idle slug={post.id} />
```

- [ ] **Step 4: Write the Playwright test**

Create `apps/client/tests/e2e/interactive-reading.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const POST = "/welcome-to-blab-bun";

// ─── ReadingDots ──────────────────────────────────────────────
test.describe("ReadingDots", () => {
  test("renders dots for each h2 on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(POST);
    const dots = page.locator(".reading-dots .dot");
    // welcome-to-blab-bun has 4 h2s
    await expect(dots).toHaveCount(4);
  });

  test("is hidden on narrow viewports", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(POST);
    await expect(page.locator(".reading-dots")).toHaveCSS("display", "none");
  });

  test("first dot is active on load", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(POST);
    await expect(page.locator(".reading-dots .dot.active")).toHaveCount(1);
  });
});
```

- [ ] **Step 5: Start dev server and run the test**

```bash
cd apps/client && pnpm test --grep "ReadingDots"
```

Expected: all 3 ReadingDots tests pass. If a test fails, check that the `welcome-to-blab-bun.mdx` post has 4 `h2` elements and that the component is mounted correctly.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/components/post/ReadingDots.svelte \
        packages/ui/components/post/index.ts \
        apps/client/src/pages/\[slug\].astro \
        apps/client/tests/e2e/interactive-reading.spec.ts
git commit -m "feat(post): add ReadingDots section progress component"
```

---

## Task 2: MidScrollReaction component

**Files:**
- Create: `packages/ui/components/post/MidScrollReaction.svelte`
- Modify: `packages/ui/components/post/index.ts`
- Modify: `apps/client/src/pages/[slug].astro`
- Modify: `apps/client/tests/e2e/interactive-reading.spec.ts`

Inline block that fades in at ~50% scroll. Same 5 emojis as `ReactionBar`. Reacting updates the same localStorage keys so the bottom bar reflects the pick. Dismisses on reaction or `×`.

- [ ] **Step 1: Create `MidScrollReaction.svelte`**

Create `packages/ui/components/post/MidScrollReaction.svelte`:

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
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

  const DONE_KEY = `bb-midreact-done-${slug}`;

  function reactionStorageKey(label: string) {
    return `bb-reaction-${slug}-${label}`;
  }

  let visible = $state(false);
  let dismissed = $state(false);
  let mounted = $state(false);

  $effect(() => {
    const alreadyReacted = !!localStorage.getItem(`bb-reaction-mine-${slug}`);
    const done = !!localStorage.getItem(DONE_KEY);
    if (alreadyReacted || done) {
      dismissed = true;
      return;
    }

    mounted = true;

    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total =
        (el.scrollHeight || document.body.scrollHeight) - el.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      if (pct >= 50) visible = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  function react(label: string) {
    const current = parseInt(
      localStorage.getItem(reactionStorageKey(label)) ?? "0",
      10
    );
    localStorage.setItem(reactionStorageKey(label), String(current + 1));
    localStorage.setItem(`bb-reaction-mine-${slug}`, label);
    localStorage.setItem(DONE_KEY, "1");
    dismissed = true;
  }

  function dismiss() {
    localStorage.setItem(DONE_KEY, "1");
    dismissed = true;
  }
</script>

{#if mounted && visible && !dismissed}
  <div
    class="mid-react"
    role="region"
    aria-label="Mid-article reaction"
    data-testid="mid-scroll-reaction"
  >
    <span class="mid-react-label">thoughts so far? →</span>
    <div class="mid-react-pills">
      {#each REACTIONS as r}
        <button
          type="button"
          class="mid-react-pill"
          onclick={() => react(r.label)}
          aria-label={`React with ${r.label}`}
        >
          {r.emoji}
        </button>
      {/each}
    </div>
    <button
      type="button"
      class="mid-react-dismiss"
      onclick={dismiss}
      aria-label="Dismiss reaction prompt"
    >
      ×
    </button>
  </div>
{/if}

<style>
  .mid-react {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    border: 1.5px solid var(--accent);
    border-radius: 6px;
    padding: 10px 14px;
    background: var(--accent-soft);
    margin: 28px 0;
    animation: mid-react-in 0.3s ease;
  }

  @keyframes mid-react-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mid-react-label {
    font-family: "Caveat", cursive;
    font-size: 1.05rem;
    color: var(--accent);
    flex-shrink: 0;
  }

  .mid-react-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .mid-react-pill {
    font-size: 1.1rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: transform 0.12s;
    line-height: 1;
    font-family: inherit;
  }

  .mid-react-pill:hover {
    transform: scale(1.2);
  }

  .mid-react-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--muted);
    font-size: 1rem;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
    font-family: inherit;
  }

  .mid-react-dismiss:hover {
    color: var(--text);
  }

  @media (prefers-reduced-motion: reduce) {
    .mid-react {
      animation: none;
    }
  }
</style>
```

- [ ] **Step 2: Export from barrel**

Edit `packages/ui/components/post/index.ts`:

```ts
export { default as BookmarkButton } from "./BookmarkButton.svelte";
export { default as MidScrollReaction } from "./MidScrollReaction.svelte";
export { default as ReactionBar } from "./ReactionBar.svelte";
export { default as ReadingDots } from "./ReadingDots.svelte";
export { default as ReadingProgress } from "./ReadingProgress.svelte";
```

- [ ] **Step 3: Mount in `[slug].astro`**

Update the import in `[slug].astro`:

```astro
import {
  BookmarkButton,
  MidScrollReaction,
  ReactionBar,
  ReadingDots,
  ReadingProgress,
} from "@blabbun/ui/components/post";
```

Add the component inside `<main>`, in the article body div just before `</div>` that closes the `style="padding-top:4px"` wrapper (around line 153 — after `<Content />`):

```astro
<div style="padding-top:4px">
  <div class="prose ... post-content max-w-none">
    <Content />
  </div>
  <MidScrollReaction client:visible slug={post.id} />
</div>
```

- [ ] **Step 4: Add MidScrollReaction tests**

Append to `apps/client/tests/e2e/interactive-reading.spec.ts`:

```ts
// ─── MidScrollReaction ────────────────────────────────────────
test.describe("MidScrollReaction", () => {
  test("is not visible on initial load", async ({ page }) => {
    await page.goto(POST);
    await expect(
      page.getByTestId("mid-scroll-reaction")
    ).not.toBeVisible();
  });

  test("appears after scrolling past 50%", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.documentElement;
      window.scrollTo({ top: el.scrollHeight });
    });
    await expect(
      page.getByTestId("mid-scroll-reaction")
    ).toBeVisible({ timeout: 2000 });
  });

  test("dismisses when × is clicked", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }));
    const prompt = page.getByTestId("mid-scroll-reaction");
    await expect(prompt).toBeVisible({ timeout: 2000 });
    await prompt.getByRole("button", { name: "Dismiss reaction prompt" }).click();
    await expect(prompt).not.toBeVisible();
  });

  test("dismisses and saves to localStorage when emoji picked", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }));
    const prompt = page.getByTestId("mid-scroll-reaction");
    await expect(prompt).toBeVisible({ timeout: 2000 });
    await prompt.getByRole("button", { name: "React with fire" }).click();
    await expect(prompt).not.toBeVisible();
    const stored = await page.evaluate(() =>
      localStorage.getItem("bb-reaction-mine-welcome-to-blab-bun")
    );
    expect(stored).toBe("fire");
  });
});
```

- [ ] **Step 5: Run the tests**

```bash
cd apps/client && pnpm test --grep "MidScrollReaction"
```

Expected: all 4 MidScrollReaction tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/components/post/MidScrollReaction.svelte \
        packages/ui/components/post/index.ts \
        apps/client/src/pages/\[slug\].astro \
        apps/client/tests/e2e/interactive-reading.spec.ts
git commit -m "feat(post): add MidScrollReaction inline prompt"
```

---

## Task 3: CheckpointDividers component

**Files:**
- Create: `apps/client/src/components/post/CheckpointDividers.svelte`
- Modify: `apps/client/src/pages/[slug].astro`
- Modify: `apps/client/tests/e2e/interactive-reading.spec.ts`

On mount, queries all `h2`s inside `.post-content`, inserts a styled divider `<div>` before each one, then uses `IntersectionObserver` to fade each divider in as it scrolls into view.

- [ ] **Step 1: Create `CheckpointDividers.svelte`**

Create `apps/client/src/components/post/CheckpointDividers.svelte`:

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  const MESSAGES = [
    "✶ still here? respect. ✶",
    "✶ you're still going, love that. ✶",
    "✶ halfway through the blab. ✶",
    "✶ getting to the good part → ✶",
    "✶ almost there. keep going. ✶",
  ];

  onMount(() => {
    const h2s = Array.from(
      document.querySelectorAll(".post-content h2")
    ) as HTMLElement[];
    if (!h2s.length) return;

    const injected: HTMLElement[] = [];

    h2s.forEach((h2, i) => {
      const div = document.createElement("div");
      div.className = "checkpoint-divider";
      div.setAttribute("aria-hidden", "true");
      div.setAttribute("data-testid", "checkpoint-divider");

      const msg = document.createElement("span");
      msg.className = "checkpoint-message";
      msg.textContent = MESSAGES[i % MESSAGES.length];
      div.appendChild(msg);

      h2.parentElement?.insertBefore(div, h2);
      injected.push(div);
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      injected.forEach((el) => el.classList.add("visible"));
      return () => injected.forEach((el) => el.remove());
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 }
    );

    injected.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      injected.forEach((el) => el.remove());
    };
  });
</script>

<style>
  :global(.checkpoint-divider) {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 28px 0 10px;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
  }

  :global(.checkpoint-divider.visible) {
    opacity: 1;
    transform: translateY(0);
  }

  :global(.checkpoint-divider::before),
  :global(.checkpoint-divider::after) {
    content: "";
    flex: 1;
    height: 1px;
  }

  :global(.checkpoint-divider::before) {
    background: linear-gradient(
      to right,
      transparent,
      color-mix(in srgb, var(--accent) 35%, transparent)
    );
  }

  :global(.checkpoint-divider::after) {
    background: linear-gradient(
      to left,
      transparent,
      color-mix(in srgb, var(--accent) 35%, transparent)
    );
  }

  :global(.checkpoint-message) {
    font-family: "Caveat", cursive;
    font-size: 0.8rem;
    color: var(--muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
```

- [ ] **Step 2: Mount in `[slug].astro`**

Add the import at the top of the frontmatter in `[slug].astro` (alongside the existing client component imports):

```astro
import CheckpointDividers from "@/components/post/CheckpointDividers.svelte";
```

Mount it directly after `<Content />`, inside the `style="padding-top:4px"` wrapper, alongside `<MidScrollReaction>` from Task 2:

```astro
<div style="padding-top:4px">
  <div class="prose ... post-content max-w-none">
    <Content />
  </div>
  <CheckpointDividers client:idle />
  <MidScrollReaction client:visible slug={post.id} />
</div>
```

- [ ] **Step 3: Add CheckpointDividers tests**

Append to `apps/client/tests/e2e/interactive-reading.spec.ts`:

```ts
// ─── CheckpointDividers ───────────────────────────────────────
test.describe("CheckpointDividers", () => {
  test("injects one divider before each h2", async ({ page }) => {
    await page.goto(POST);
    // welcome-to-blab-bun has 4 h2s → 4 dividers
    await expect(
      page.locator("[data-testid='checkpoint-divider']")
    ).toHaveCount(4);
  });

  test("dividers start hidden and become visible after scrolling", async ({
    page,
  }) => {
    await page.goto(POST);
    const dividers = page.locator("[data-testid='checkpoint-divider']");
    // First divider starts with opacity 0
    await expect(dividers.first()).toHaveCSS("opacity", "0");
    // Scroll past it
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    await expect(dividers.first()).toHaveCSS("opacity", "1", {
      timeout: 2000,
    });
  });

  test("displays Caveat-font checkpoint messages", async ({ page }) => {
    await page.goto(POST);
    const firstMessage = page
      .locator("[data-testid='checkpoint-divider'] .checkpoint-message")
      .first();
    await expect(firstMessage).toHaveText("✶ still here? respect. ✶");
  });
});
```

- [ ] **Step 4: Run the tests**

```bash
cd apps/client && pnpm test --grep "CheckpointDividers"
```

Expected: all 3 CheckpointDividers tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/components/post/CheckpointDividers.svelte \
        apps/client/src/pages/\[slug\].astro \
        apps/client/tests/e2e/interactive-reading.spec.ts
git commit -m "feat(post): add CheckpointDividers scroll-reveal dividers"
```

---

## Task 4: QuotePopover component

**Files:**
- Create: `apps/client/src/components/post/QuotePopover.svelte`
- Modify: `apps/client/src/pages/[slug].astro`
- Modify: `apps/client/tests/e2e/interactive-reading.spec.ts`

Listens to `selectionchange`. When a selection of 10–280 chars inside `.post-content` is detected, positions a dark popover above it with two actions: save quote to `localStorage['bb-quotes']`, or copy `"[quote]"\n— blabbun.com/[slug]` to clipboard.

- [ ] **Step 1: Create `QuotePopover.svelte`**

Create `apps/client/src/components/post/QuotePopover.svelte`:

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    slug: string;
    title: string;
  }

  const { slug, title }: Props = $props();

  interface SavedQuote {
    text: string;
    slug: string;
    title: string;
    savedAt: string;
  }

  const MIN_CHARS = 10;
  const MAX_CHARS = 280;
  const MAX_QUOTES = 50;

  let visible = $state(false);
  let popoverX = $state(0);
  let popoverY = $state(0);
  let selectedText = $state("");
  let saveLabel = $state("💬 save quote");
  let shareLabel = $state("✦ share");

  let popoverEl: HTMLDivElement | undefined = $state();

  onMount(() => {
    function onSelectionChange() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        visible = false;
        return;
      }

      const text = selection.toString().trim();
      if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
        visible = false;
        return;
      }

      const range = selection.getRangeAt(0);
      const postContent = document.querySelector(".post-content");
      if (!postContent?.contains(range.commonAncestorContainer)) {
        visible = false;
        return;
      }

      const rect = range.getBoundingClientRect();
      popoverX = rect.left + rect.width / 2;
      popoverY = rect.top - 8; // viewport-relative — works with position:fixed
      selectedText = text;
      visible = true;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && visible) {
        e.stopPropagation(); // prevent history.back() in [slug].astro
        visible = false;
        window.getSelection()?.removeAllRanges();
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (popoverEl && !popoverEl.contains(e.target as Node)) {
        visible = false;
      }
    }

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  });

  function saveQuote() {
    const raw = localStorage.getItem("bb-quotes");
    const quotes: SavedQuote[] = raw ? (JSON.parse(raw) as SavedQuote[]) : [];
    quotes.push({
      text: selectedText,
      slug,
      title,
      savedAt: new Date().toISOString(),
    });
    if (quotes.length > MAX_QUOTES) quotes.splice(0, quotes.length - MAX_QUOTES);
    localStorage.setItem("bb-quotes", JSON.stringify(quotes));
    saveLabel = "✓ saved!";
    setTimeout(() => (saveLabel = "💬 save quote"), 1500);
  }

  async function shareQuote() {
    const shareText = `"${selectedText}"\n— blabbun.com/${slug}`;
    try {
      await navigator.clipboard.writeText(shareText);
      shareLabel = "✓ copied!";
      setTimeout(() => (shareLabel = "✦ share"), 1500);
    } catch {
      // Clipboard API not available — silently skip
    }
  }
</script>

{#if visible}
  <div
    bind:this={popoverEl}
    class="quote-popover"
    style="left:{popoverX}px;top:{popoverY}px"
    role="toolbar"
    aria-label="Quote actions"
    data-testid="quote-popover"
  >
    <button type="button" class="qp-btn" onclick={saveQuote}
      >{saveLabel}</button
    >
    <span class="qp-sep" aria-hidden="true">|</span>
    <button type="button" class="qp-btn" onclick={shareQuote}
      >{shareLabel}</button
    >
    <div class="qp-arrow" aria-hidden="true"></div>
  </div>
{/if}

<style>
  .quote-popover {
    position: fixed;
    transform: translate(-50%, -100%);
    background: var(--text);
    color: var(--bg);
    border-radius: 4px;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.68rem;
    white-space: nowrap;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 200;
    animation: qp-in 0.15s ease;
    pointer-events: auto;
  }

  @keyframes qp-in {
    from {
      opacity: 0;
      transform: translate(-50%, calc(-100% + 6px));
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%);
    }
  }

  .qp-btn {
    background: none;
    border: none;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.12s;
  }

  .qp-btn:hover {
    opacity: 0.7;
  }

  .qp-sep {
    opacity: 0.3;
  }

  .qp-arrow {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: var(--text);
  }

  @media (prefers-reduced-motion: reduce) {
    .quote-popover {
      animation: none;
    }
  }
</style>
```

- [ ] **Step 2: Mount in `[slug].astro`**

Add import in the frontmatter:

```astro
import QuotePopover from "@/components/post/QuotePopover.svelte";
```

Mount just before `</main>` (after the related posts section, alongside `<FloatingNewsletter>`):

```astro
  <FloatingNewsletter client:idle postSlug={post.id} />
  <QuotePopover client:idle slug={post.id} title={post.data.title} />
</Layout>
```

- [ ] **Step 3: Add QuotePopover tests**

Append to `apps/client/tests/e2e/interactive-reading.spec.ts`:

```ts
// ─── QuotePopover ─────────────────────────────────────────────
test.describe("QuotePopover", () => {
  test("does not appear for selections under 10 chars", async ({ page }) => {
    await page.goto(POST);
    // Select a very short piece of text
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el) return;
      const range = document.createRange();
      range.setStart(el.firstChild!, 0);
      range.setEnd(el.firstChild!, 5);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
    });
    await expect(page.getByTestId("quote-popover")).not.toBeVisible();
  });

  test("appears when selecting sufficient text inside article", async ({
    page,
  }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el || !el.firstChild) return;
      const text = el.firstChild.textContent ?? "";
      const range = document.createRange();
      range.setStart(el.firstChild, 0);
      range.setEnd(el.firstChild, Math.min(60, text.length));
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      // Trigger selectionchange
      document.dispatchEvent(new Event("selectionchange"));
    });
    await expect(page.getByTestId("quote-popover")).toBeVisible({
      timeout: 1000,
    });
  });

  test("save quote button stores quote in localStorage", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el || !el.firstChild) return;
      const text = el.firstChild.textContent ?? "";
      const range = document.createRange();
      range.setStart(el.firstChild, 0);
      range.setEnd(el.firstChild, Math.min(60, text.length));
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
    });
    const popover = page.getByTestId("quote-popover");
    await expect(popover).toBeVisible({ timeout: 1000 });
    await popover.getByRole("button", { name: /save quote/ }).click();
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem("bb-quotes");
      return raw ? JSON.parse(raw) : [];
    });
    expect(stored.length).toBe(1);
    expect(stored[0].slug).toBe("welcome-to-blab-bun");
  });

  test("Escape closes popover without triggering history.back", async ({
    page,
  }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el || !el.firstChild) return;
      const text = el.firstChild.textContent ?? "";
      const range = document.createRange();
      range.setStart(el.firstChild, 0);
      range.setEnd(el.firstChild, Math.min(60, text.length));
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
    });
    await expect(page.getByTestId("quote-popover")).toBeVisible({
      timeout: 1000,
    });
    await page.keyboard.press("Escape");
    // Popover closes
    await expect(page.getByTestId("quote-popover")).not.toBeVisible();
    // Page did not navigate back (still on the post)
    expect(page.url()).toContain("welcome-to-blab-bun");
  });
});
```

- [ ] **Step 4: Run the tests**

```bash
cd apps/client && pnpm test --grep "QuotePopover"
```

Expected: all 4 QuotePopover tests pass.

- [ ] **Step 5: Run the full interactive-reading suite**

```bash
cd apps/client && pnpm test --grep "interactive-reading"
```

Expected: all 14 tests across all four features pass on Chromium, Firefox, and WebKit.

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/components/post/QuotePopover.svelte \
        apps/client/src/pages/\[slug\].astro \
        apps/client/tests/e2e/interactive-reading.spec.ts
git commit -m "feat(post): add QuotePopover text-selection save/share"
```

---

## Task 5: Final smoke check

- [ ] **Step 1: Start the dev server and open the post page**

```bash
pnpm dev:client
```

Open `http://localhost:4321/welcome-to-blab-bun` in a browser.

- [ ] **Step 2: Manually verify all four features**

Check each one works end-to-end:

1. **ReadingDots** — four dots visible on the left side (desktop). Hover shows section title. Click scrolls to that section.
2. **MidScrollReaction** — scroll to the bottom; prompt with "thoughts so far? →" appears. Click an emoji; prompt disappears. Reload — prompt does not reappear (localStorage flag set). Scroll to the bottom ReactionBar and confirm the emoji you picked is marked active.
3. **CheckpointDividers** — scroll slowly; accent-line dividers fade in above each `h2`. Check each has a checkpoint message.
4. **QuotePopover** — select 10+ chars of article text; dark popover appears above it. Click "save quote" — button flashes "✓ saved!". Click "✦ share" — button flashes "✓ copied!". Press Escape — popover closes, page stays on the post.

- [ ] **Step 3: Check dark mode**

Toggle dark mode (existing theme button in navbar). Verify all four features use the correct CSS variables (dots use `--accent`, popover background uses `--text`, checkpoint messages use `--muted`).

- [ ] **Step 4: Run the full test suite**

```bash
cd apps/client && pnpm test
```

Expected: all tests pass (existing + new interactive-reading suite).

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(post): interactive reading — smoke check complete"
```
