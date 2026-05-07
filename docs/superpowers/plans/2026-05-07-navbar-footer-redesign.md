# Navbar & Footer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add character and interactivity to the Navbar and Footer — logo tilt, scribble underline hover on nav links, pill-shaped search that expands on focus, Caveat font on theme toggle, SVG wave footer divider, and Caveat tagline.

**Architecture:** All changes are purely visual — CSS hover effects via a new `<style>` block in each Svelte component. No prop, logic, or layout changes. Existing inline styles are preserved where they aren't being replaced; new interactive states use scoped Svelte CSS classes.

**Tech Stack:** Svelte 5 (runes), Tailwind CSS 4, IBM Plex Mono + Caveat fonts (already loaded in Layout.astro), CSS custom properties from `global.css`

---

## File Map

| File | What changes |
|------|-------------|
| `packages/ui/components/layouts/Navbar.svelte` | Add `<style>` block; add CSS classes to logo, nav links, search wrapper, saved btn, theme btn |
| `packages/ui/components/layouts/Footer.svelte` | Add `<style>` block; replace `border-top` with SVG wave; replace tagline; add link hover class |

---

### Task 1: Navbar — logo tilt on hover

**Files:**
- Modify: `packages/ui/components/layouts/Navbar.svelte`

> These are pure style changes. No logic or props change. Verify visually by running the dev server.

- [ ] **Step 1: Add a `<style>` block at the bottom of Navbar.svelte** (after the closing `</header>` tag)

```svelte
<style>
  /* ── Logo ── */
  .logo-link .logo-img {
    transition: transform 0.2s ease;
    transform-origin: center bottom;
  }
  .logo-link:hover .logo-img {
    transform: rotate(8deg) scale(1.08);
  }
  .logo-link .logo-text {
    transition: color 0.15s;
  }
  .logo-link:hover .logo-text {
    color: var(--accent);
  }
</style>
```

- [ ] **Step 2: Add classes to the logo `<a>` and its children**

Find the logo `<a>` block (currently around line 131) and update it:

```svelte
<a
  href="/"
  class="logo-link"
  style="
    background:none;border:none;cursor:pointer;padding:0;
    font-family:inherit;
    display:flex;align-items:center;gap:9px;flex-shrink:0;
    text-decoration:none;
  "
>
  <img
    src="/blabbun-logo.webp"
    alt="blab bun"
    width="28"
    height="28"
    fetchpriority="high"
    class="logo-img"
    style="width:28px;height:28px;object-fit:contain;flex-shrink:0"
  />
  <span
    class="logo-text"
    style="font-size:0.95rem;font-weight:600;letter-spacing:-0.01em;color:var(--text)"
  >
    blab bun<span style="color:var(--accent)">.</span>
  </span>
</a>
```

- [ ] **Step 3: Start the dev server and verify**

```bash
pnpm dev:client
```

Open `http://localhost:4321`. Hover the logo — the bunny image should tilt right and the "blab bun" text should shift to amber. Logo text color transition should be smooth.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/components/layouts/Navbar.svelte
git commit -m "feat(navbar): logo tilt and text accent on hover"
```

---

### Task 2: Navbar — nav link scribble underline on hover

**Files:**
- Modify: `packages/ui/components/layouts/Navbar.svelte`

- [ ] **Step 1: Add nav link styles to the existing `<style>` block**

Append inside the `<style>` block:

```css
  /* ── Nav links ── */
  .nav-link {
    position: relative;
    padding-bottom: 3px;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 6px;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6' preserveAspectRatio='none'><path d='M0 4 Q 12 1, 25 4 T 50 4 T 75 4 T 100 4' stroke='%23C4832A' stroke-width='2' fill='none' stroke-linecap='round'/></svg>") no-repeat;
    background-size: 100% 100%;
    opacity: 0;
    transform: scaleX(0.6);
    transform-origin: left;
    transition: opacity 0.2s ease, transform 0.22s ease;
  }
  .nav-link:hover::after,
  .nav-link.nav-link--active::after {
    opacity: 1;
    transform: scaleX(1);
  }
  /* dark mode — warmer amber stroke */
  :global(body.dark) .nav-link::after {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6' preserveAspectRatio='none'><path d='M0 4 Q 12 1, 25 4 T 50 4 T 75 4 T 100 4' stroke='%23D4A040' stroke-width='2' fill='none' stroke-linecap='round'/></svg>");
  }
```

- [ ] **Step 2: Update nav link markup in the desktop `<nav>` block**

Replace the `{#each links as link}` block inside the desktop nav (currently around line 157):

```svelte
<nav style="gap:18px;align-items:center;flex:1" class="hidden md:flex">
  {#each links as link}
    <a
      href={link.href}
      class="nav-link {link.active ? 'nav-link--active' : ''}"
      style="
        background:none;border:none;font-size:0.74rem;
        font-family:inherit;cursor:pointer;letter-spacing:0.03em;
        text-decoration:none;
        color:{link.active ? 'var(--accent)' : 'var(--muted)'};
        transition:color 0.15s;
      "
    >
      {link.label}
    </a>
  {/each}
</nav>
```

- [ ] **Step 3: Verify**

In the browser at `http://localhost:4321`, hover each nav link — the amber scribble underline should slide in from the left. The active link (e.g. "home" on `/`) should show it at rest.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/components/layouts/Navbar.svelte
git commit -m "feat(navbar): scribble underline slides in on nav link hover"
```

---

### Task 3: Navbar — pill search bar with expand, `/` hint, and focus glow

**Files:**
- Modify: `packages/ui/components/layouts/Navbar.svelte`

- [ ] **Step 1: Add search styles to the `<style>` block**

```css
  /* ── Search ── */
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-wrap .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 0.85rem;
    pointer-events: none;
    transition: color 0.15s;
  }
  .search-wrap:focus-within .search-icon {
    color: var(--accent);
  }
  .search-input {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 28px 5px 28px;
    font-size: 0.74rem;
    font-family: inherit;
    color: var(--text);
    width: 160px;
    outline: none;
    transition: width 0.25s ease, border-color 0.15s, box-shadow 0.15s;
  }
  .search-input:focus {
    width: 220px;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .search-input::placeholder {
    color: var(--muted2);
  }
  .kbd-hint {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.58rem;
    color: var(--muted2);
    pointer-events: none;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0 4px;
    line-height: 1.6;
    transition: opacity 0.15s;
  }
  .search-wrap:focus-within .kbd-hint {
    opacity: 0;
  }
```

- [ ] **Step 2: Replace the desktop search div markup**

Find the `<!-- Inline search bar -->` comment block (currently around line 181) and replace the entire `<div style="position:relative;...">` block:

```svelte
<!-- Inline search bar -->
<div class="search-wrap">
  <span class="search-icon">⌕</span>
  <input
    value={search}
    oninput={handleDesktopSearch}
    onkeydown={handleDesktopSearchKey}
    placeholder="search..."
    type="search"
    aria-label="Search posts"
    class="search-input"
  />
  {#if !search}
    <span class="kbd-hint">/</span>
  {/if}
</div>
```

- [ ] **Step 3: Verify**

At `http://localhost:4321`, confirm:
- Search bar has rounded pill ends at rest
- Clicking into it widens smoothly and shows amber border + soft glow ring
- The `/` hint fades out when focused
- The `⌕` icon turns amber when focused
- Typing a query dispatches the search overlay as before

- [ ] **Step 4: Commit**

```bash
git add packages/ui/components/layouts/Navbar.svelte
git commit -m "feat(navbar): pill search bar with expand-on-focus and kbd hint"
```

---

### Task 4: Navbar — pill saved button + Caveat theme toggle

**Files:**
- Modify: `packages/ui/components/layouts/Navbar.svelte`

- [ ] **Step 1: Add styles for saved button and theme toggle**

```css
  /* ── Saved button ── */
  .saved-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 0.68rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    white-space: nowrap;
    font-family: inherit;
    transition: border-color 0.15s, color 0.15s;
  }
  .saved-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  /* ── Theme toggle ── */
  .theme-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 12px;
    font-family: 'Caveat', cursive;
    font-size: 0.92rem;
    color: var(--muted);
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.02em;
    transition: border-color 0.15s, color 0.15s;
  }
  .theme-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
```

- [ ] **Step 2: Update the desktop saved button markup**

Replace the saved `<a>` block (currently around line 209):

```svelte
<!-- Saved / bookmarks -->
<a
  href="/saved"
  title="saved posts"
  class="saved-btn"
>
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style="flex-shrink:0"
  >
    <path
      d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  {#if bookmarkCount > 0}
    <span
      style="font-size:0.55rem;background:var(--accent);color:#fff;border-radius:8px;padding:0 4px;line-height:1.7;margin-left:1px"
    >
      {bookmarkCount}
    </span>
  {/if}
</a>
```

- [ ] **Step 3: Update both desktop and mobile theme toggle buttons**

Replace the **desktop** theme toggle (currently around line 246):

```svelte
<!-- Theme toggle -->
<button
  onclick={toggleTheme}
  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
  class="theme-btn"
>
  {isDark ? "☀ light mode" : "◑ dark mode"}
</button>
```

Replace the **mobile** theme toggle (currently around line 265):

```svelte
<button
  onclick={toggleTheme}
  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
  class="theme-btn"
  style="font-size:0.82rem"
>
  {isDark ? "☀" : "◑"}
</button>
```

- [ ] **Step 4: Verify**

At `http://localhost:4321`:
- Saved button is pill-shaped, hover turns amber
- Theme toggle uses Caveat script, reads "☀ light mode" / "◑ dark mode" (desktop), still functions correctly
- Mobile theme toggle still works, still pill-shaped

- [ ] **Step 5: Commit**

```bash
git add packages/ui/components/layouts/Navbar.svelte
git commit -m "feat(navbar): pill saved/theme buttons, Caveat theme label"
```

---

### Task 5: Footer — SVG wave divider, Caveat tagline, link hover underlines

**Files:**
- Modify: `packages/ui/components/layouts/Footer.svelte`

- [ ] **Step 1: Replace the entire Footer.svelte content**

The current footer is short and uses `export let` (Svelte 4 syntax). Note the component is in `@blabbun/ui` and already uses runes-style where needed — keep the prop as-is since the file uses `export let` directly (no `$props()` needed for a single prop).

```svelte
<script lang="ts">
  export let wordCount: number = 0;
</script>

<div style="max-width:680px;width:100%;margin:0 auto">
  <!-- Hand-drawn SVG wave replaces the straight border-top -->
  <svg
    width="100%"
    height="12"
    viewBox="0 0 680 12"
    preserveAspectRatio="none"
    aria-hidden="true"
    style="display:block"
  >
    <path
      d="M0 7 Q 50 2, 100 7 T 200 7 T 300 7 T 400 7 T 500 7 T 600 7 T 680 7"
      stroke="var(--divider)"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
    />
  </svg>

  <footer class="footer-inner">
    <!-- left -->
    <div>
      <span class="footer-tagline">thoughts, unfiltered.</span>
      {#if wordCount > 0}
        <div style="font-size:0.62rem;color:var(--muted2);margin-top:3px">
          {wordCount.toLocaleString()} words blabbed so far
        </div>
      {/if}
    </div>

    <!-- right links -->
    <div style="display:flex;gap:16px;align-items:center">
      <a href="/about" class="footer-link">about</a>
      <a href="/now" class="footer-link">/now</a>
      <a href="/terms" class="footer-link">terms</a>
      <a
        href="/rss.xml"
        style="font-size:0.64rem;color:var(--accent);text-decoration:none;border:1px solid var(--accent);border-radius:2px;padding:1px 6px;letter-spacing:0.04em;transition:background 0.15s"
        class="footer-rss"
      >RSS</a>
    </div>
  </footer>
</div>

<style>
  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 32px 22px;
  }

  .footer-tagline {
    font-family: 'Caveat', cursive;
    font-size: 1.15rem;
    color: var(--accent);
    letter-spacing: 0.01em;
    display: inline-block;
    transform: rotate(-0.5deg);
  }

  .footer-link {
    font-size: 0.68rem;
    color: var(--muted);
    text-decoration: none;
    position: relative;
    padding-bottom: 2px;
    transition: color 0.15s;
  }
  .footer-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.18s ease;
  }
  .footer-link:hover {
    color: var(--accent);
  }
  .footer-link:hover::after {
    transform: scaleX(1);
  }

  .footer-rss:hover {
    background: var(--accent-soft);
  }
</style>
```

- [ ] **Step 2: Verify**

At `http://localhost:4321`, scroll to the bottom:
- The straight `border-top` line is gone, replaced by a subtle hand-drawn SVG wave
- "thoughts, unfiltered." appears in Caveat amber script, slightly rotated
- Word count is still visible below it
- Hover "about", "/now", "terms" — accent underline slides in from the left
- Hover RSS badge — soft amber background appears

- [ ] **Step 3: Commit**

```bash
git add packages/ui/components/layouts/Footer.svelte
git commit -m "feat(footer): SVG wave divider, Caveat tagline, link hover underlines"
```

---

### Task 6: Final cross-browser check and mobile pass

**Files:** None — verification only

- [ ] **Step 1: Check mobile layout**

In DevTools, switch to a mobile viewport (375px wide). Confirm:
- Hamburger menu still opens
- Mobile search still works (full-width, rectangular — intentionally not pill)
- Mobile theme toggle shows only the icon (`☀` / `◑`), not the full Caveat label
- Footer wraps correctly — tagline and links stack cleanly

- [ ] **Step 2: Check light mode**

In the browser, toggle to light mode. Confirm:
- Logo tilt still works
- Nav scribble underline is visible (stroke `#C4832A`)
- Search glow ring is visible with light mode `--accent-soft` (`#faebd7`)
- Footer tagline and link hover underlines render correctly

- [ ] **Step 3: Check dark mode**

Toggle back to dark mode. Confirm all interactions still work and the scribble SVG uses the dark stroke `#D4A040`.

- [ ] **Step 4: Final commit if any tweaks were made**

```bash
git add -p
git commit -m "fix(navbar/footer): cross-browser and mobile polish"
```
