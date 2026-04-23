<script lang="ts">
  let email = $state("");
  let submitted = $state(false);
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
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error);
      }
      submitted = true;
    } catch (ex) {
      err = ex instanceof Error ? ex.message : "something went wrong";
    } finally {
      submitting = false;
    }
  }
</script>

<div
  style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:26px 28px;margin:40px 0"
>
  {#if submitted}
    <div
      style="font-size:0.85rem;font-weight:500;margin-bottom:5px;color:var(--text)"
    >
      you're in.
    </div>
    <div style="font-size:0.76rem;color:var(--muted);line-height:1.6">
      i'll send the next one when i have something worth saying.
    </div>
  {:else}
    <div
      style="font-size:0.85rem;font-weight:500;margin-bottom:4px;color:var(--text)"
    >
      get new posts in your inbox
    </div>
    <div
      style="font-size:0.74rem;color:var(--muted);margin-bottom:16px;line-height:1.6"
    >
      no schedule. no issues. just an email when something new drops.
    </div>
    {#if err}<div
        style="font-size:0.7rem;color:var(--accent);margin-bottom:8px"
      >
        ! {err}
      </div>{/if}
    <form onsubmit={submit} style="display:flex;gap:10px;flex-wrap:wrap">
      <input
        bind:value={email}
        placeholder="your@email.com"
        type="email"
        style="flex:1;min-width:200px;background:var(--bg);border:1px solid var(--border);border-radius:3px;padding:9px 14px;font-size:0.78rem;font-family:inherit;color:var(--text);outline:none"
      />
      <button
        type="submit"
        disabled={submitting}
        style="background:var(--accent);border:none;border-radius:3px;padding:9px 20px;font-size:0.74rem;font-family:inherit;color:#fff;cursor:pointer;white-space:nowrap;opacity:{submitting
          ? '0.6'
          : '1'}"
      >
        {submitting ? "…" : "subscribe"}
      </button>
    </form>
  {/if}
</div>
