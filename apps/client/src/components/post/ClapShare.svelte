<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    postSlug: string;
    postUrl: string;
    postTitle: string;
    inline?: boolean;
  }

  const { postSlug, postUrl, postTitle, inline = false }: Props = $props();

  let count = $state(0);
  let mine = $state(0);
  let loading = $state(true);
  let burst = $state(false);
  let shareOpen = $state(false);
  let copied = $state(false);
  let clapTimer: ReturnType<typeof setTimeout> | undefined;
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  const maxClaps = 50;

  onMount(async () => {
    try {
      const res = await fetch(`/api/claps/${postSlug}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { count: number; hasClapped: boolean };
      count = data.count ?? 0;
      mine = data.hasClapped ? 1 : 0;
    } catch {
      /* silent */
    } finally {
      loading = false;
    }
    return () => {
      clearTimeout(clapTimer);
      clearTimeout(copyTimer);
    };
  });

  async function clap() {
    if (mine >= maxClaps || loading) return;
    count += 1;
    mine += 1;
    burst = true;
    clearTimeout(clapTimer);
    clapTimer = setTimeout(() => (burst = false), 350);
    try {
      const res = await fetch(`/api/claps/${postSlug}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { count: number; hasClapped: boolean };
      count = data.count;
    } catch {
      count -= 1;
      mine -= 1;
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = false), 2000);
    } catch {
      /* */
    }
  }

  const encodedUrl = $derived(encodeURIComponent(postUrl));
  const encodedTitle = $derived(encodeURIComponent(postTitle));

  const btnStyle =
    "background:var(--bg2);border:1px solid var(--border);border-radius:3px;padding:7px 13px;font-size:0.72rem;font-family:inherit;cursor:pointer;color:var(--muted);letter-spacing:0.03em;transition:color 0.15s,border-color 0.15s;display:flex;align-items:center;gap:6px;text-decoration:none;width:100%;text-align:left";
</script>

<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
  <!-- ClapButton — exact design: round 44px circle -->
  <div style="display:flex;align-items:center;gap:10px">
    <button
      type="button"
      onclick={clap}
      disabled={loading}
      title={mine >= maxClaps ? "max claps reached" : "clap for this post"}
      style="
        background:none;border:1px solid {mine > 0
        ? 'var(--accent)'
        : 'var(--border)'};
        border-radius:50%;width:44px;height:44px;
        cursor:{mine >= maxClaps ? 'not-allowed' : 'pointer'};
        font-size:1.2rem;display:flex;align-items:center;justify-content:center;
        color:{mine > 0 ? 'var(--accent)' : 'var(--muted)'};
        transform:{burst ? 'scale(1.35)' : 'scale(1)'};
        transition:transform 0.25s cubic-bezier(.34,1.56,.64,1);
      ">👏</button
    >
    <div>
      <div style="font-size:0.88rem;font-weight:500;color:var(--text)">
        {count}
      </div>
      <div style="font-size:0.62rem;color:var(--muted)">
        {mine > 0 ? `you clapped ${mine}x` : "clap if you liked it"}
      </div>
    </div>
  </div>

  <!-- SharePanel — popup on click, exact design -->
  <div style="position:relative">
    <button
      type="button"
      onclick={() => (shareOpen = !shareOpen)}
      style="
        background:var(--bg2);border:1px solid {shareOpen
        ? 'var(--accent)'
        : 'var(--border)'};
        border-radius:3px;padding:7px 13px;font-size:0.72rem;font-family:inherit;cursor:pointer;
        color:{shareOpen ? 'var(--accent)' : 'var(--muted)'};
        letter-spacing:0.03em;transition:color 0.15s,border-color 0.15s;
        display:flex;align-items:center;gap:6px;
      "
    >
      ↗ share
    </button>

    {#if shareOpen}
      <div
        style="
          position:absolute;bottom:calc(100% + 8px);left:0;
          background:var(--bg2);border:1px solid var(--border);
          border-radius:4px;padding:8px;
          display:flex;flex-direction:column;gap:4px;
          min-width:180px;box-shadow:0 4px 20px rgba(0,0,0,0.12);
          z-index:50;
        "
      >
        <button
          type="button"
          onclick={copyLink}
          style="
            {btnStyle};
            color:{copied ? 'var(--accent)' : 'var(--muted)'};
            border-color:{copied ? 'var(--accent)' : 'var(--border)'};
          "
        >
          {copied ? "✓ copied!" : "🔗 copy link"}
        </button>
        <a
          href="https://twitter.com/intent/tweet?text={encodedTitle}&url={encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style={btnStyle}>𝕏 share on X</a
        >
        <a
          href="https://www.facebook.com/sharer/sharer.php?u={encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style={btnStyle}>f share on Facebook</a
        >
        <a
          href="https://reddit.com/submit?url={encodedUrl}&title={encodedTitle}"
          target="_blank"
          rel="noopener noreferrer"
          style={btnStyle}>↑ share on Reddit</a
        >
      </div>
    {/if}
  </div>

  <!-- Bookmark pushed to right -->
  <slot />
</div>
