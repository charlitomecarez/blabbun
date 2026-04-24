<script lang="ts">
  let email = $state("");
  let done = $state(
    // Guard for SSR — localStorage is unavailable on the server.
    typeof localStorage !== "undefined"
      ? localStorage.getItem("bb-subscribed") === "1"
      : false
  );
  let err = $state("");
  let submitting = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    if (!email.includes("@")) {
      err = "that doesn't look like an email";
      return;
    }
    err = "";
    submitting = true;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to subscribe");
      }
      done = true;
      localStorage.setItem("bb-subscribed", "1");
    } catch (ex) {
      err = ex instanceof Error ? ex.message : "something went wrong";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="newsletter-card">
  {#if done}
    <div class="newsletter-title">you're in.</div>
    <div class="newsletter-sub">
      i'll send the next one when i have something worth saying. could be
      tomorrow. could be never.
    </div>
  {:else}
    <div class="newsletter-title">get new posts in your inbox</div>
    <div class="newsletter-sub">
      no schedule. no issues. just an email when something new drops.
    </div>
    {#if err}
      <div class="form-error">! {err}</div>
    {/if}
    <form class="newsletter-form" onsubmit={submit}>
      <input
        bind:value={email}
        class="email-input"
        placeholder="your@email.com"
        type="email"
      />
      <button type="submit" class="subscribe-btn" disabled={submitting}>
        {submitting ? "…" : "subscribe"}
      </button>
    </form>
  {/if}
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
  }
</style>
