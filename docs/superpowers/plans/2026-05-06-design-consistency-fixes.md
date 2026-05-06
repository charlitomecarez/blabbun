# Design Consistency Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 identified design inconsistencies so all pages look and feel like they belong to the same site.

**Architecture:** All changes are isolated to existing files — no new components needed. Each task touches one file (or one tight concern) and can be verified with `pnpm lint && pnpm build` from the monorepo root.

**Tech Stack:** Astro 6, Svelte 5, Tailwind CSS 4, IBM Plex Mono / Fraunces / Caveat fonts, CSS custom properties via `global.css`.

---

## File Map

| File | Change |
|---|---|
| `apps/client/src/layouts/Layout.astro` | Add `initial-scale=1` to viewport meta |
| `packages/ui/styles/global.css` | Fix `html { font-size }` from 15px → 16px |
| `apps/client/src/pages/topics/index.astro` | Replace inline container style with Tailwind, normalize h1 |
| `apps/client/src/pages/topics/[tag].astro` | Replace inline container style with Tailwind, normalize h1 |
| `apps/client/src/pages/archive.astro` | Normalize h1 to utility-page standard |
| `apps/client/src/pages/saved.astro` | Normalize h1 to utility-page standard |
| `apps/client/src/pages/404.astro` | Normalize h1 to utility-page standard |
| `packages/ui/components/layouts/Navbar.svelte` | Replace 🔖 emoji with SVG bookmark icon |
| `apps/client/src/components/home/PostCard.svelte` | Replace 👏 and 💬 emoji stats with text labels |

---

### Task 1: Fix viewport meta — add `initial-scale=1`

**Files:**
- Modify: `apps/client/src/layouts/Layout.astro:54`

- [ ] **Step 1: Edit the viewport meta tag**

In `apps/client/src/layouts/Layout.astro`, find:
```html
<meta name="viewport" content="width=device-width" />
```
Replace with:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/layouts/Layout.astro
git commit -m "fix: add initial-scale=1 to viewport meta"
```

---

### Task 2: Fix base font size (15px → 16px)

**Files:**
- Modify: `packages/ui/styles/global.css:27`

- [ ] **Step 1: Update font size**

In `packages/ui/styles/global.css`, find:
```css
html {
  font-size: 15px;
}
```
Replace with:
```css
html {
  font-size: 16px;
}
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/styles/global.css
git commit -m "fix: raise base font-size from 15px to 16px for mobile readability"
```

---

### Task 3: Normalize `topics/index.astro` container and h1

**Files:**
- Modify: `apps/client/src/pages/topics/index.astro`

The page currently uses an inline `style` attribute on `<main>` instead of Tailwind classes, and its h1 uses `font-weight:700` + `font-size:1.6rem` which doesn't match the utility-page standard used on archive/saved (`font-size:1.05rem; font-weight:600`).

- [ ] **Step 1: Replace main element and normalize h1**

Replace the entire `<main>` opening tag and its contents up to the closing tag with:

```astro
<Layout
  title="Topics"
  description={`Browse all ${topics.length} topics on blabbun — from personal essays to tech rants and everything in between.`}
>
  <main
    class="mx-auto min-h-[60vh] w-full max-w-[680px] flex-1 px-4 py-6 sm:px-8 sm:py-8"
  >
    <h1 style="font-size:1.05rem;font-weight:600;margin-bottom:22px">
      topics
    </h1>

    <div
      style="border-bottom:1px solid var(--accent);padding-bottom:8px;margin-bottom:4px"
    >
      <span
        style="font-size:0.62rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted2)"
      >
        all topics
      </span>
    </div>

    <div>
      {
        topics.map(({ tag, count, slug, label }) => (
          <a
            href={`/topics/${slug}`}
            data-testid={`topic-link-${slug}`}
            style="
              display:flex;align-items:center;gap:14px;
              padding:14px 0;
              border-bottom:1px solid var(--divider);
              text-decoration:none;transition:background 0.1s;
            "
          >
            <span
              style="
                font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
                background:var(--accent-soft);color:var(--accent);
                border-radius:3px;padding:3px 8px;flex-shrink:0;
              "
            >
              {tag}
            </span>
            <span style="flex:1;font-size:0.88rem;font-weight:500;color:var(--text)">
              {label}
            </span>
            <span style="font-size:0.72rem;color:var(--muted2)">
              {count} {count === 1 ? "post" : "posts"}
            </span>
          </a>
        ))
      }
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/topics/index.astro
git commit -m "fix: normalize topics page container to Tailwind classes and align h1 style"
```

---

### Task 4: Normalize `topics/[tag].astro` container and h1

**Files:**
- Modify: `apps/client/src/pages/topics/[tag].astro`

Same issue as `topics/index.astro` — uses `style="max-width:680px;margin:0 auto;padding:32px 32px"` on `<main>` and a large bold `1.6rem` h1.

- [ ] **Step 1: Replace main element and normalize h1**

In `apps/client/src/pages/topics/[tag].astro`, replace the `<main ...>` opening attribute from:
```astro
<main
  style="max-width:680px;margin:0 auto;padding:32px 32px;width:100%;flex:1;min-height:60vh"
>
```
to:
```astro
<main
  class="mx-auto min-h-[60vh] w-full max-w-[680px] flex-1 px-4 py-6 sm:px-8 sm:py-8"
>
```

Then replace the inner header `<div style="padding-top:48px;padding-bottom:24px">` wrapper and the h1 inside it from:
```astro
    <div style="padding-top:48px;padding-bottom:24px">
      <a
        href="/topics"
        style="
          display:inline-flex;align-items:center;gap:5px;
          font-size:0.68rem;font-weight:600;color:var(--muted2);
          text-decoration:none;transition:color 0.15s;margin-bottom:20px;
        "
        onmouseenter="this.style.color='var(--accent)'"
        onmouseleave="this.style.color='var(--muted2)'"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13 7H1M6 2L1 7l5 5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"></path>
        </svg>
        topics
      </a>

      <div style="margin-bottom:10px">
        <span
          style="
            font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
            background:var(--accent);color:#fff;
            border-radius:3px;padding:3px 8px;
          "
        >
          {tag}
        </span>
      </div>

      <h1
        style="font-size:1.6rem;font-weight:700;letter-spacing:-0.03em;color:var(--text);margin-bottom:6px"
      >
        {label}<span style="color:var(--accent)">.</span>
      </h1>
      <p style="font-size:0.72rem;color:var(--muted2)">
        {postItems.length}
        {postItems.length === 1 ? "post" : "posts"}
      </p>
    </div>
```
with:
```astro
    <div style="margin-bottom:22px">
      <a
        href="/topics"
        style="
          display:inline-flex;align-items:center;gap:5px;
          font-size:0.68rem;font-weight:600;color:var(--muted2);
          text-decoration:none;transition:color 0.15s;margin-bottom:14px;
        "
        onmouseenter="this.style.color='var(--accent)'"
        onmouseleave="this.style.color='var(--muted2)'"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13 7H1M6 2L1 7l5 5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"></path>
        </svg>
        topics
      </a>

      <div style="margin-bottom:8px">
        <span
          style="
            font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
            background:var(--accent);color:#fff;
            border-radius:3px;padding:3px 8px;
          "
        >
          {tag}
        </span>
      </div>

      <h1 style="font-size:1.05rem;font-weight:600;margin-bottom:4px">
        {label}
      </h1>
      <p style="font-size:0.72rem;color:var(--muted2)">
        {postItems.length}
        {postItems.length === 1 ? "post" : "posts"}
      </p>
    </div>
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/topics/[tag].astro
git commit -m "fix: normalize topic tag page container to Tailwind classes and align h1 style"
```

---

### Task 5: Normalize `archive.astro` h1

**Files:**
- Modify: `apps/client/src/pages/archive.astro:61`

The archive h1 already uses the right size (`1.05rem`, `font-weight:600`) — but its container uses `px-4 py-6 sm:px-8 sm:py-8` while `index.astro` only uses `px-8` (no responsive padding). Archive is already the better pattern; no change needed to archive itself. **Skip this task — archive is already the reference standard.**

---

### Task 5: Normalize `saved.astro` h1 and remove redundant back link wrapper

**Files:**
- Modify: `apps/client/src/pages/saved.astro`

`saved.astro` has `<div style="animation:fadeIn 0.2s ease">` wrapping everything — the fadeIn animation should be on the `<main>` itself to avoid the extra wrapper div. The h1 is already correct (`1.05rem`, `font-weight:600`). Remove the redundant wrapper and move animation to `<main>`.

- [ ] **Step 1: Move animation from wrapper div to main, remove extra div**

Replace the current content of `saved.astro` `<Layout>` body from:
```astro
  <main
    class="mx-auto min-h-[60vh] w-full max-w-[680px] flex-1 px-4 py-6 sm:px-8 sm:py-8"
  >
    <div style="animation:fadeIn 0.2s ease">
      <a
        href="/"
        style="color:var(--accent);font-family:'Caveat',cursive;font-size:1.1rem;
               text-decoration:none;padding:0;display:inline-block;margin-bottom:24px"
      >
        ← back to the blabs
      </a>

      <h1 style="font-size:1.05rem;font-weight:600;margin-bottom:6px">saved</h1>

      <SavedFeed client:load />
    </div>
  </main>
```
with:
```astro
  <main
    class="mx-auto min-h-[60vh] w-full max-w-[680px] flex-1 px-4 py-6 sm:px-8 sm:py-8"
    style="animation:fadeIn 0.2s ease"
  >
    <a
      href="/"
      style="color:var(--accent);font-family:'Caveat',cursive;font-size:1.1rem;
             text-decoration:none;padding:0;display:inline-block;margin-bottom:24px"
    >
      ← back to the blabs
    </a>

    <h1 style="font-size:1.05rem;font-weight:600;margin-bottom:6px">saved</h1>

    <SavedFeed client:load />
  </main>
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/saved.astro
git commit -m "fix: remove redundant wrapper div in saved page, move animation to main"
```

---

### Task 6: Normalize `404.astro` h1 to match utility-page standard

**Files:**
- Modify: `apps/client/src/pages/404.astro`

The 404 page uses `text-[1.2rem]` for its h1, slightly larger than the `1.05rem` standard used on archive/saved. Normalize to `1.05rem` via inline style to match the rest.

- [ ] **Step 1: Update h1 size**

In `apps/client/src/pages/404.astro`, replace:
```astro
      <h1
        class="mb-3 text-[1.2rem] leading-[1.4] font-semibold text-[var(--text)]"
      >
        this page doesn't exist.
      </h1>
```
with:
```astro
      <h1
        class="mb-3 text-[1.05rem] leading-[1.4] font-semibold text-[var(--text)]"
      >
        this page doesn't exist.
      </h1>
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/404.astro
git commit -m "fix: normalize 404 h1 size to match utility page standard (1.05rem)"
```

---

### Task 7: Replace 🔖 emoji in Navbar with SVG bookmark icon

**Files:**
- Modify: `packages/ui/components/layouts/Navbar.svelte`

The bookmark icon appears twice: once in the desktop nav and once in the mobile dropdown. Both must be replaced.

- [ ] **Step 1: Replace desktop bookmark emoji**

In `packages/ui/components/layouts/Navbar.svelte`, find the desktop saved link (around line 209):
```svelte
      <a
        href="/saved"
        title="saved posts"
        style="
          background:none;border:1px solid var(--border);border-radius:3px;
          padding:5px 8px;font-size:0.72rem;cursor:pointer;
          color:var(--muted);
          display:flex;align-items:center;gap:4px;
          text-decoration:none;white-space:nowrap;position:relative;
          font-family:inherit;
        "
      >
        🔖
        {#if bookmarkCount > 0}
```
Replace `🔖` with:
```svelte
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex-shrink:0">
          <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
```

- [ ] **Step 2: Replace mobile bookmark emoji**

In the same file, find the mobile saved link (around line 360):
```svelte
          🔖 saved
```
Replace with:
```svelte
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex-shrink:0;display:inline-block;vertical-align:middle;margin-right:4px">
            <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>saved
```

- [ ] **Step 3: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/components/layouts/Navbar.svelte
git commit -m "fix: replace bookmark emoji with SVG icon in navbar"
```

---

### Task 8: Replace emoji stat icons in PostCard with text labels

**Files:**
- Modify: `apps/client/src/components/home/PostCard.svelte`

The 👏 and 💬 emojis in the stat row are UI elements, not personality content. Replace with minimal SVG icons that match the blog's thin-line aesthetic.

- [ ] **Step 1: Replace clap and comment emoji stats**

In `apps/client/src/components/home/PostCard.svelte`, find the stat section:
```svelte
      {#if claps > 0}
        <span class="stat">👏 {claps}</span>
      {/if}
      {#if commentCount > 0}
        <span class="stat">💬 {commentCount}</span>
      {/if}
```
Replace with:
```svelte
      {#if claps > 0}
        <span class="stat">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="display:inline-block;vertical-align:middle;margin-right:2px">
            <path d="M7 11.5V6a1.5 1.5 0 0 1 3 0v3m0-3a1.5 1.5 0 0 1 3 0v3m0-2a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-14 0v-4a1.5 1.5 0 0 1 3 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>{claps}
        </span>
      {/if}
      {#if commentCount > 0}
        <span class="stat">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="display:inline-block;vertical-align:middle;margin-right:2px">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>{commentCount}
        </span>
      {/if}
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/home/PostCard.svelte
git commit -m "fix: replace clap and comment emojis with SVG icons in PostCard"
```

---

## Final Build Check

After all tasks are done:

- [ ] **Run full build**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm build
```
Expected: exits 0, no TypeScript or Astro errors.

- [ ] **Visual spot-check** — start dev server and verify each page looks consistent

```bash
pnpm dev:client
```
Check: `/`, `/archive`, `/saved`, `/topics`, `/topics/rants`, `/about`, `/now`, a post page `/<any-slug>`, and `/404` (navigate to a nonexistent URL).

Confirm: all utility pages (`archive`, `saved`, `topics`, `404`) have matching small h1s; Navbar shows SVG bookmark; post cards show SVG stat icons; no horizontal scroll on mobile viewport (375px).
