<script lang="ts">
  import { onMount } from "svelte";

  const RATE_LIMIT_MS = 10 * 60 * 1000;
  const STORAGE_KEY = "bb-newsletter-last";
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let email = $state("");
  let err = $state("");
  let info = $state("");
  let submitting = $state(false);
  let cooldownMs = $state(0);
  let done = $state(false);
  let scrollVisible = $state(false);

  onMount(() => {
    const onScroll = () => (scrollVisible = window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  });

  $effect(() => {
    tick();
  });

  function tick() {
    const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const remaining = Math.max(0, RATE_LIMIT_MS - (Date.now() - last));
    cooldownMs = remaining;
    if (remaining > 0) setTimeout(tick, 10_000);
  }

  function cooldownLabel(ms: number): string {
    const mins = Math.ceil(ms / 60_000);
    return `${mins}m`;
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

      if (!res.ok && !data.results)
        throw new Error(data.error ?? "something went wrong");

      const results = data.results ?? [];
      const subscribed = results.filter(
        (r) => r.status === "subscribed"
      ).length;
      const already = results.filter(
        (r) => r.status === "already_subscribed"
      ).length;

      if (subscribed > 0) {
        info = "you're in.";
        email = "";
        done = true;
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        tick();
      } else if (already > 0) {
        info = "already subscribed.";
        done = true;
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

<aside class="nl-aside" aria-label="Newsletter signup">
  <div class="nl-label">stay in the loop</div>

  {#if done}
    <p class="nl-done">{info} ✶</p>
  {:else}
    <p class="nl-sub">new posts, straight to your inbox.</p>

    {#if err}
      <p class="nl-err" role="alert">! {err}</p>
    {/if}
    {#if info}
      <p class="nl-info" role="status">{info}</p>
    {/if}

    <form class="nl-form" onsubmit={submit} novalidate>
      <label for="nl-sidebar-email" class="sr-only">Email address</label>
      <input
        id="nl-sidebar-email"
        bind:value={email}
        class="nl-input"
        placeholder="your@email.com"
        type="email"
        autocomplete="email"
      />
      <button
        type="submit"
        class="nl-btn"
        disabled={submitting || cooldownMs > 0}
        aria-disabled={submitting || cooldownMs > 0}
      >
        {#if submitting}
          …
        {:else if cooldownMs > 0}
          {cooldownLabel(cooldownMs)}
        {:else}
          subscribe
        {/if}
      </button>
    </form>
  {/if}

  <div class="scroll-section">
    <div class="nl-label">scroll</div>
    <button
      type="button"
      onclick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      class="scroll-btn"
      class:scroll-visible={scrollVisible}
    >
      ↑ top
    </button>
  </div>
</aside>

<style>
  .nl-aside {
    display: flex;
    flex-direction: column;
    gap: 0;
    height: calc(100vh - 220px);
  }

  @media (max-width: 1099px) {
    .nl-aside {
      height: auto;
    }
  }

  .scroll-section {
    display: none;
    margin-top: auto;
    padding: 16px 0 12px;
  }

  @media (min-width: 1100px) {
    .scroll-section {
      display: flex;
      flex-direction: column;
    }
  }

  .scroll-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 3px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.7rem;
    font-family: inherit;
    cursor: pointer;
    transition:
      color 0.15s,
      border-color 0.15s,
      opacity 0.2s;
    opacity: 0;
    pointer-events: none;
  }

  .scroll-btn.scroll-visible {
    opacity: 1;
    pointer-events: auto;
  }

  .scroll-btn:hover {
    color: var(--text);
    border-color: var(--muted);
  }

  .scroll-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 3px;
  }

  .nl-label {
    font-size: 0.62rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted2);
    margin-bottom: 10px;
    font-family: inherit;
  }

  .nl-sub {
    font-size: 0.71rem;
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .nl-err {
    font-size: 0.68rem;
    color: var(--accent2);
    margin-bottom: 6px;
  }

  .nl-info {
    font-size: 0.68rem;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .nl-done {
    font-size: 0.75rem;
    color: var(--muted);
    line-height: 1.5;
  }

  .nl-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nl-input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 8px 10px;
    font-size: 0.72rem;
    font-family: inherit;
    color: var(--text);
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
  }

  .nl-input:focus-visible {
    border-color: var(--accent);
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .nl-btn {
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
    text-align: center;
  }

  .nl-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .nl-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>
