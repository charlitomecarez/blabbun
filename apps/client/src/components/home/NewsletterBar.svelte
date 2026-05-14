<script lang="ts">
  const RATE_LIMIT_MS = 10 * 60 * 1000;
  const STORAGE_KEY = "bb-newsletter-last";

  let email = $state("");
  let err = $state("");
  let info = $state("");
  let submitting = $state(false);
  let cooldownMs = $state(0);
  let done = $state(false);
  let subCount = $state<number | null>(null);

  $effect(() => {
    tick();
    fetch("/api/newsletter")
      .then((r) => r.json() as Promise<{ count?: number }>)
      .then((d) => {
        if (typeof d?.count === "number") subCount = d.count;
      })
      .catch(() => {});
  });

  function tick() {
    const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const remaining = Math.max(0, RATE_LIMIT_MS - (Date.now() - last));
    cooldownMs = remaining;
    if (remaining > 0) setTimeout(tick, 10_000);
  }

  function cooldownLabel(ms: number): string {
    const mins = Math.ceil(ms / 60_000);
    return `try again in ${mins}m`;
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function parseEmails(raw: string): string[] {
    return raw
      .split(/[,\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (cooldownMs > 0) return;

    const emails = parseEmails(email);
    if (!emails.length || emails.some((e) => !EMAIL_RE.test(e))) {
      err = "enter valid email(s), comma-separated";
      return;
    }

    err = "";
    info = "";
    submitting = true;

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emails }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        results?: Array<{ email: string; status: string }>;
        error?: string;
      };

      if (!res.ok && !data.results) {
        throw new Error(data.error ?? "something went wrong");
      }

      const results = data.results ?? [];
      const subscribed = results.filter(
        (r) => r.status === "subscribed"
      ).length;
      const already = results.filter(
        (r) => r.status === "already_subscribed"
      ).length;

      if (subscribed > 0) {
        info =
          subscribed === 1
            ? "you're in. check your inbox."
            : `${subscribed} addresses added.`;
        if (already > 0) info += ` (${already} already subscribed)`;
        email = "";
        done = true;
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        tick();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gtag?.("event", "subscribe", {
          method: "newsletter",
          source: "homepage_bar",
        });
      } else if (already > 0) {
        info =
          already === 1 ? "already subscribed." : "all already subscribed.";
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

<aside aria-label="Newsletter signup" class="newsletter-wrap reveal">
  <!-- Tape strip -->
  <div class="tape" style="top:-9px; left:40%; transform:rotate(-3deg);"></div>

  <!-- "no spam, promise!" annotation -->
  <span class="no-spam handwritten" aria-hidden="true">no spam, promise!</span>

  {#if done}
    <!-- Done state -->
    <h2 class="newsletter-title serif" style="font-style:italic;">
      you're in. ✶
    </h2>
    <p class="newsletter-sub">
      i'll send the next one when i have something worth saying. could be
      tomorrow. could be never.
    </p>
  {:else}
    <!-- Default state -->
    <h2 class="newsletter-title serif" style="font-style:italic;">
      get new posts in your inbox
    </h2>
    <p class="newsletter-sub">
      an email when something new drops.{#if subCount !== null}
        <span class="sub-count"> · {subCount} subscribed</span>
      {/if}
    </p>

    {#if err}
      <p class="form-error" role="alert">! {err}</p>
    {/if}
    {#if info}
      <p class="form-info" role="status">{info}</p>
    {/if}

    <form class="newsletter-form" onsubmit={submit} novalidate>
      <label for="nl-email" class="sr-only">Email address</label>
      <input
        id="nl-email"
        bind:value={email}
        class="email-input"
        placeholder="your@email.com, friend@email.com"
        type="text"
        autocomplete="email"
      />
      <button
        type="submit"
        class="subscribe-btn"
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
</aside>

<style>
  .newsletter-wrap {
    background: var(--bg2);
    border: 1.5px solid var(--text);
    border-radius: 4px;
    padding: 30px 28px;
    margin: 40px 4px;
    position: relative;
    transform: rotate(-0.4deg);
    box-shadow: 4px 4px 0 var(--text);
    overflow: visible;
  }

  .no-spam {
    position: absolute;
    top: -22px;
    right: -12px;
    color: var(--accent2);
    font-size: 1.3rem;
    transform: rotate(8deg);
    display: inline-block;
    pointer-events: none;
    white-space: nowrap;
  }

  .newsletter-title {
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--text);
    line-height: 1.2;
  }

  .newsletter-sub {
    font-size: 0.74rem;
    color: var(--muted);
    margin-bottom: 16px;
    line-height: 1.65;
  }
  .sub-count {
    color: var(--muted2);
  }

  .form-error {
    font-size: 0.7rem;
    color: var(--accent2);
    margin-bottom: 8px;
  }

  .form-info {
    font-size: 0.7rem;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .newsletter-form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .email-input {
    flex: 1;
    min-width: 200px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 9px 14px;
    font-size: 0.78rem;
    font-family: inherit;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
  }

  .email-input:focus {
    border-color: var(--accent);
  }

  .subscribe-btn {
    background: var(--accent);
    border: none;
    border-radius: 3px;
    padding: 9px 20px;
    font-size: 0.74rem;
    font-family: inherit;
    color: #fff;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s;
    min-height: 44px;
  }

  .subscribe-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
