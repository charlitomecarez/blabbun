# Scroll-to-Top Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed scroll-to-top button to the global layout that fades in after 300px of scroll and smoothly returns the user to the top on click.

**Architecture:** A new `ScrollToTop.svelte` component is created in `apps/client/src/components/layouts/` and imported into `Layout.astro` alongside `SearchDropdown`. The component manages its own visibility via a scroll event listener and uses CSS transitions for the fade effect.

**Tech Stack:** Svelte 5 (runes), Tailwind CSS v4, Astro, Playwright (e2e tests)

---

### Task 1: Create the ScrollToTop Svelte component

**Files:**

- Create: `apps/client/src/components/layouts/ScrollToTop.svelte`

- [ ] **Step 1: Create the component file**

Create `apps/client/src/components/layouts/ScrollToTop.svelte` with the following content:

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  let visible = $state(false);

  onMount(() => {
    const onScroll = () => {
      visible = window.scrollY > 300;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<button
  onclick={scrollToTop}
  aria-label="Scroll to top"
  class="fixed right-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center
         rounded-full border border-[rgba(197,247,208,0.5)] bg-[#ebf3ed]
         text-[#386547] shadow-sm transition-opacity duration-300
         hover:bg-[#dceee0] focus:outline-none focus-visible:ring-2
         focus-visible:ring-[#386547]"
  style="opacity: {visible ? 1 : 0}; pointer-events: {visible
    ? 'auto'
    : 'none'};"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
</button>
```

- [ ] **Step 2: Verify the file was created correctly**

```bash
cat apps/client/src/components/layouts/ScrollToTop.svelte
```

Expected: file content printed with no errors.

---

### Task 2: Integrate ScrollToTop into Layout.astro

**Files:**

- Modify: `apps/client/src/layouts/Layout.astro`

- [ ] **Step 1: Add the import to Layout.astro**

Open `apps/client/src/layouts/Layout.astro`. The current imports section (lines 1–7) looks like:

```astro
---
import "@blabbun/ui/styles/global.css";

import { Footer, Navbar } from "@blabbun/ui/components/layouts";

import SearchDropdown from "@/components/search/SearchDropdown.svelte";
---
```

Add the ScrollToTop import so it becomes:

```astro
---
import "@blabbun/ui/styles/global.css";

import { Footer, Navbar } from "@blabbun/ui/components/layouts";

import SearchDropdown from "@/components/search/SearchDropdown.svelte";
import ScrollToTop from "@/components/layouts/ScrollToTop.svelte";
---
```

- [ ] **Step 2: Add the component tag to the body**

Find the line `<SearchDropdown client:load />` in the body and add `<ScrollToTop client:load />` directly below it:

```astro
<Navbar client:load links={navLinks} />
<SearchDropdown client:load />
<ScrollToTop client:load />
```

- [ ] **Step 3: Start dev server and verify visually**

```bash
cd apps/client && pnpm dev
```

Open `http://localhost:4321` in a browser. Scroll down more than 300px — the green round button should appear in the bottom-right corner. Click it — the page should smoothly scroll back to the top. The button should disappear again when back at the top.

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/components/layouts/ScrollToTop.svelte apps/client/src/layouts/Layout.astro
git commit -m "feat: add scroll-to-top button to global layout"
```

---

### Task 3: Add Playwright e2e test

**Files:**

- Create: `apps/client/tests/e2e/scroll-to-top.spec.ts`

- [ ] **Step 1: Create the test file**

Create `apps/client/tests/e2e/scroll-to-top.spec.ts`:

```typescript
import { expect, test } from "@playwright/test";

test.describe("scroll-to-top button", () => {
  test("is hidden on initial load", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toHaveCSS("opacity", "0");
  });

  test("appears after scrolling 300px", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    await page.waitForTimeout(100);
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toHaveCSS("opacity", "1");
  });

  test("scrolls page to top when clicked", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    await page.waitForTimeout(100);
    const button = page.getByRole("button", { name: "Scroll to top" });
    await button.click();
    await page.waitForTimeout(600); // allow smooth scroll to complete
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests**

Make sure the dev server is running (`pnpm dev` in `apps/client`), then from the repo root:

```bash
cd apps/client && pnpm test --project=chromium tests/e2e/scroll-to-top.spec.ts
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/client/tests/e2e/scroll-to-top.spec.ts
git commit -m "test: add e2e tests for scroll-to-top button"
```
