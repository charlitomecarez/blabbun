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

  let cooldownTimer: ReturnType<typeof setTimeout> | undefined;
  let autoDismissTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const dismissKey = `bb-nl-dismiss-${postSlug}`;
    if (localStorage.getItem(dismissKey)) {
      dismissed = true;
      return;
    }

    function refreshCooldown() {
      const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
      const remaining = Math.max(0, RATE_LIMIT_MS - (Date.now() - last));
      cooldownMs = remaining;
      if (remaining > 0) cooldownTimer = setTimeout(refreshCooldown, 10_000);
    }

    refreshCooldown();

    function onScroll() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const threshold = scrollable * 0.3;
      if (window.scrollY >= threshold) visible = true;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(cooldownTimer);
      clearTimeout(autoDismissTimer);
    };
  });

  function dismiss() {
    clearTimeout(autoDismissTimer);
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
        info = "you're in. check your inbox.";
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        cooldownMs = 0;
        succeeded = true;
        autoDismissTimer = setTimeout(dismiss, 3000);
      } else if (already > 0) {
        info = "already subscribed.";
        succeeded = true;
        autoDismissTimer = setTimeout(dismiss, 3000);
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
  <div
    class="fn-desktop"
    role="complementary"
    class:fn-show={visible}
    aria-label="Newsletter signup"
  >
    <button class="fn-close" onclick={dismiss} aria-label="dismiss">×</button>
    <div class="fn-title">stay in the loop</div>
    <div class="fn-sub">new posts, straight to your inbox.</div>
    {#if succeeded}
      <div class="fn-info">{info}</div>
    {:else}
      <div aria-live="polite" aria-atomic="true">
        {#if err}<div class="fn-err">! {err}</div>{/if}
        {#if info}<div class="fn-info">{info}</div>{/if}
      </div>
      <form class="fn-form" onsubmit={submit}>
        <input
          bind:value={email}
          class="fn-input"
          placeholder="your@email.com"
          type="email"
          autocomplete="email"
        />
        <button
          type="submit"
          class="fn-btn"
          disabled={submitting || cooldownMs > 0}
        >
          {#if submitting}…{:else if cooldownMs > 0}{cooldownLabel(
              cooldownMs
            )}{:else}subscribe{/if}
        </button>
      </form>
    {/if}
  </div>

  <!-- Mobile bar -->
  <div
    class="fn-mobile"
    role="complementary"
    class:fn-show={visible}
    aria-label="Newsletter signup"
  >
    {#if succeeded}
      <div aria-live="polite" aria-atomic="true">
        <span class="fn-info">{info}</span>
      </div>
    {:else}
      <span class="fn-mobile-label">subscribe</span>
      <form class="fn-mobile-form" onsubmit={submit}>
        <div aria-live="polite" aria-atomic="true">
          {#if err}<span class="fn-err fn-mobile-err">! {err}</span>{/if}
        </div>
        <input
          bind:value={email}
          class="fn-input fn-mobile-input"
          placeholder="your@email.com"
          type="email"
          autocomplete="email"
        />
        <button
          type="submit"
          class="fn-btn fn-mobile-btn"
          disabled={submitting || cooldownMs > 0}
        >
          {#if submitting}…{:else if cooldownMs > 0}{cooldownLabel(
              cooldownMs
            )}{:else}subscribe{/if}
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
    .fn-desktop {
      display: block;
    }
    .fn-mobile {
      display: none;
    }
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
  .fn-close:hover {
    color: var(--text);
  }
  .fn-close:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 2px;
  }

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
    .fn-mobile {
      display: none;
    }
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
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
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
  .fn-input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
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

  .fn-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
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

  @media (prefers-reduced-motion: reduce) {
    .fn-desktop,
    .fn-mobile {
      transition: none;
    }
  }
</style>
