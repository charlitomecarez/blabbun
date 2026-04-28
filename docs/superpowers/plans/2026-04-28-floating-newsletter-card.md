# Floating Newsletter Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating newsletter signup card to the blog post page — fixed right edge on desktop, sticky bottom bar on mobile.

**Architecture:** A single new Svelte 5 component `FloatingNewsletter.svelte` handles scroll detection, dismiss persistence, and form submission. It is added to `[slug].astro` outside the `<main>` element with `client:load`. No shared state with other components.

**Tech Stack:** Svelte 5 (runes), Astro 6, Tailwind-free inline styles matching site CSS variables, `/api/newsletter` POST endpoint (existing).

---

### Task 1: Create FloatingNewsletter.svelte

**Files:**
- Create: `apps/client/src/components/post/FloatingNewsletter.svelte`

- [ ] **Step 1: Create the component file**

```svelte
<script lang="ts">
  const { postSlug }: { postSlug: string } = $props();

  const RATE_LIMIT_MS = 10 * 60 * 1000;
  const STORAGE_KEY = "bb-newsletter-last";
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let visible = $state(false);
  let dismissed = $state(false);
  let email = $state("");
  let err = $state("");
  let info = $state("");
  let submitting = $state(false);
  let cooldownMs = $state(0);
  let succeeded = $state(false);

  $effect(() => {
    const dismissKey = `bb-nl-dismiss-${postSlug}`;
    if (localStorage.getItem(dismissKey)) {
      dismissed = true;
      return;
    }

    tick();

    const threshold = document.documentElement.scrollHeight * 0.3;
    function onScroll() {
      if (window.scrollY > threshold) visible = true;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  function tick() {
    const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const remaining = Math.max(0, RATE_LIMIT_MS - (Date.now() - last));
    cooldownMs = remaining;
    if (remaining > 0) setTimeout(tick, 10_000);
  }

  function dismiss() {
    dismissed = true;
    localStorage.setItem(`bb-nl-dismiss-${postSlug}`, "1");
  }

  function cooldownLabel(ms: number): string {
    const mins = Math.ceil(ms / 60_000);
    return `try again in ${mins}m`;
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (cooldownMs > 0) return;

    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      err = "enter a valid email";
      return;
    }

    err = "";
    info = "";
    submitting = true;

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: [trimmed] }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        results?: Array<{ email: string; status: string }>;
        error?: string;
      };

      if (!res.ok && !data.results) throw new Error(data.error ?? "something went wrong");

      const results = data.results ?? [];
      const subscribed = results.filter((r) => r.status === "subscribed").length;
      const already = results.filter((r) => r.status === "already_subscribed").length;

      if (subscribed > 0) {
        info = "you're in. check your inbox.";
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        tick();
        succeeded = true;
        setTimeout(dismiss, 3000);
      } else if (already > 0) {
        info = "already subscribed.";
        succeeded = true;
        setTimeout(dismiss, 3000);
      } else {
        throw new Error("something went wrong");
      }
    } catch (ex) {
      err = ex instanceof Error ? ex.message : "something went wrong";
    } finally {
      submitting = false;
    }
  }
</script>

{#if visible && !dismissed}
  <!-- Desktop card -->
  <div class="fn-desktop" class:fn-show={visible}>
    <button class="fn-close" onclick={dismiss} aria-label="dismiss">×</button>
    <div class="fn-title">stay in the loop</div>
    <div class="fn-sub">new posts, straight to your inbox.</div>
    {#if succeeded}
      <div class="fn-info">{info}</div>
    {:else}
      {#if err}<div class="fn-err">! {err}</div>{/if}
      {#if info}<div class="fn-info">{info}</div>{/if}
      <form class="fn-form" onsubmit={submit}>
        <input
          bind:value={email}
          class="fn-input"
          placeholder="your@email.com"
          type="text"
          autocomplete="email"
        />
        <button type="submit" class="fn-btn" disabled={submitting || cooldownMs > 0}>
          {#if submitting}…{:else if cooldownMs > 0}{cooldownLabel(cooldownMs)}{:else}subscribe{/if}
        </button>
      </form>
    {/if}
  </div>

  <!-- Mobile bar -->
  <div class="fn-mobile" class:fn-show={visible}>
    {#if succeeded}
      <span class="fn-info">{info}</span>
    {:else}
      <span class="fn-mobile-label">📬</span>
      <form class="fn-mobile-form" onsubmit={submit}>
        {#if err}<span class="fn-err fn-mobile-err">! {err}</span>{/if}
        <input
          bind:value={email}
          class="fn-input fn-mobile-input"
          placeholder="your@email.com"
          type="text"
          autocomplete="email"
        />
        <button type="submit" class="fn-btn fn-mobile-btn" disabled={submitting || cooldownMs > 0}>
          {#if submitting}…{:else if cooldownMs > 0}{cooldownLabel(cooldownMs)}{:else}subscribe{/if}
        </button>
      </form>
    {/if}
  </div>
{/if}

<style>
  /* ── Desktop card ─────────────────────────────────────── */
  .fn-desktop {
    display: none;
    position: fixed;
    right: 24px;
    top: 50%;
    transform: translateY(-50%) translateX(120%);
    width: 220px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 20px 18px 18px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
    z-index: 100;
    transition: transform 0.3s ease;
  }

  @media (min-width: 768px) {
    .fn-desktop { display: block; }
    .fn-mobile  { display: none !important; }
  }

  .fn-desktop.fn-show {
    transform: translateY(-50%) translateX(0);
  }

  .fn-close {
    position: absolute;
    top: 8px;
    right: 10px;
    background: none;
    border: none;
    color: var(--muted);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }
  .fn-close:hover { color: var(--text); }

  .fn-title {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 4px;
  }

  .fn-sub {
    font-size: 0.7rem;
    color: var(--muted);
    line-height: 1.55;
    margin-bottom: 14px;
  }

  .fn-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ── Mobile bar ───────────────────────────────────────── */
  .fn-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg2);
    border-top: 1px solid var(--border);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 100;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  @media (min-width: 768px) {
    .fn-mobile { display: none; }
  }

  .fn-mobile.fn-show {
    transform: translateY(0);
  }

  .fn-mobile-label {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .fn-mobile-form {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .fn-mobile-err {
    white-space: nowrap;
  }

  /* ── Shared form elements ─────────────────────────────── */
  .fn-input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 8px 10px;
    font-size: 0.75rem;
    font-family: inherit;
    color: var(--text);
    outline: none;
    width: 100%;
  }

  .fn-mobile-input {
    flex: 1;
    min-width: 0;
  }

  .fn-btn {
    background: var(--accent);
    border: none;
    border-radius: 3px;
    padding: 8px 14px;
    font-size: 0.72rem;
    font-family: inherit;
    color: #fff;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  .fn-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .fn-mobile-btn {
    padding: 8px 12px;
  }

  .fn-err {
    font-size: 0.68rem;
    color: var(--accent);
  }

  .fn-info {
    font-size: 0.7rem;
    color: var(--muted);
  }
</style>
```

- [ ] **Step 2: Verify the file saved correctly**

```bash
wc -l apps/client/src/components/post/FloatingNewsletter.svelte
```
Expected: ~200+ lines

---

### Task 2: Wire component into the blog post page

**Files:**
- Modify: `apps/client/src/pages/[slug].astro`

- [ ] **Step 1: Add the import** at the top of the frontmatter, after the existing imports

```astro
import FloatingNewsletter from "@/components/post/FloatingNewsletter.svelte";
```

- [ ] **Step 2: Add the component** just before `</Layout>` (outside `<main>`, so it overlays the full viewport)

```astro
  <FloatingNewsletter client:load postSlug={post.id} />
</Layout>
```

The closing `</Layout>` tag is currently at line ~231. The component goes on the line immediately before it.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/post/FloatingNewsletter.svelte apps/client/src/pages/[slug].astro
git commit -m "feat: add floating newsletter card to blog post page"
```

---

### Task 3: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev:client
```

Open `http://localhost:4321` and navigate to any blog post.

- [ ] **Step 2: Verify desktop behaviour**
  - Card is hidden on load
  - Scrolls down ~30% → card slides in from right
  - `×` button dismisses it, and it stays gone after page reload (localStorage key set)
  - Submit a test email → success message appears → card auto-hides after 3s

- [ ] **Step 3: Verify mobile behaviour**
  - In browser DevTools, set viewport to 375px wide
  - Scroll down ~30% → bottom bar slides up
  - Submit a test email → success message shown in bar

- [ ] **Step 4: Verify no overlap with article content**
  - On a viewport where the article maxes out at 680px, confirm the desktop card sits in the gutter and does not overlap the text

- [ ] **Step 5: Commit if any fixes were needed**

```bash
git add -p
git commit -m "fix: floating newsletter card adjustments"
```
