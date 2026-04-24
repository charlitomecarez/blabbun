<script lang="ts">
  const RATE_LIMIT_MS = 10 * 60 * 1000;
  const STORAGE_KEY = "bb-newsletter-last";

  let email = $state("");
  let err = $state("");
  let info = $state("");
  let submitting = $state(false);
  let cooldownMs = $state(0);

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
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        tick();
      } else if (already > 0) {
        info =
          already === 1 ? "already subscribed." : "all already subscribed.";
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

<div class="newsletter-card">
  <div class="newsletter-title">get new posts in your inbox</div>
  <div class="newsletter-sub">
    no schedule. no issues. just an email when something new drops. separate
    multiple addresses with a comma.
  </div>
  {#if err}
    <div class="form-error">! {err}</div>
  {/if}
  {#if info}
    <div class="form-info">{info}</div>
  {/if}
  <form class="newsletter-form" onsubmit={submit}>
    <input
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
</div>

<style>
  .newsletter-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 26px 28px;
    margin: 40px 0;
  }

  .newsletter-title {
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--text);
  }

  .newsletter-sub {
    font-size: 0.74rem;
    color: var(--muted);
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .form-error {
    font-size: 0.7rem;
    color: var(--accent);
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
  }

  .subscribe-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
