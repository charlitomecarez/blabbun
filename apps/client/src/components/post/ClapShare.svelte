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

  /** Maximum claps a single visitor can give per post. */
  const MAX_CLAPS = 50;

  onMount(async () => {
    try {
      const res = await fetch(`/api/claps/${postSlug}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { count: number; hasClapped: boolean };
      count = data.count ?? 0;
      mine = data.hasClapped ? 1 : 0;
    } catch {
      /* silent — clap count failing shouldn't block page render */
    } finally {
      loading = false;
    }

    return () => {
      clearTimeout(clapTimer);
      clearTimeout(copyTimer);
    };
  });

  async function clap() {
    if (mine >= MAX_CLAPS || loading) return;
    // Optimistic update — revert on error.
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
      /* clipboard API not available in all contexts */
    }
  }

  const encodedUrl = $derived(encodeURIComponent(postUrl));
  const encodedTitle = $derived(encodeURIComponent(postTitle));
</script>

<div class="clap-wrap">
  <!-- Clap button + count -->
  <div class="clap-group">
    <button
      type="button"
      class="clap-btn"
      onclick={clap}
      disabled={loading}
      title={mine >= MAX_CLAPS ? "max claps reached" : "clap for this post"}
      class:active={mine > 0}
      class:burst
      class:maxed={mine >= MAX_CLAPS}
    >
      👏
    </button>
    <div>
      <div class="clap-count-num">{count}</div>
      <div class="clap-count-label">
        {mine > 0 ? `you clapped ${mine}x` : "clap if you liked it"}
      </div>
    </div>
  </div>

  <!-- Share panel -->
  <div class="share-wrapper">
    <button
      type="button"
      class="share-btn"
      onclick={() => (shareOpen = !shareOpen)}
      class:open={shareOpen}
    >
      ↗ share
    </button>

    {#if shareOpen}
      <div class="share-panel">
        <button
          type="button"
          class="share-link"
          onclick={copyLink}
          class:copied
        >
          {copied ? "✓ copied!" : "🔗 copy link"}
        </button>
        <a
          class="share-link"
          href="https://twitter.com/intent/tweet?text={encodedTitle}&url={encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          𝕏 share on X
        </a>
        <a
          class="share-link"
          href="https://www.facebook.com/sharer/sharer.php?u={encodedUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          f share on Facebook
        </a>
        <a
          class="share-link"
          href="https://reddit.com/submit?url={encodedUrl}&title={encodedTitle}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ↑ share on Reddit
        </a>
      </div>
    {/if}
  </div>

  <!-- Bookmark slot — pushed right by the parent's flex layout -->
  <slot />
</div>

<style>
  .clap-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  /* ─── Clap button ─────────────────────────────────────────── */
  .clap-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .clap-btn {
    background: none;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .clap-count-num {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text);
  }

  .clap-count-label {
    font-size: 0.62rem;
    color: var(--muted);
  }

  /* ─── Share button ────────────────────────────────────────── */
  .share-wrapper {
    position: relative;
  }

  .share-btn {
    background: var(--bg2);
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    padding: 7px 13px;
    font-size: 0.72rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition:
      color 0.15s,
      border-color 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ─── Share panel popup ───────────────────────────────────── */
  .share-panel {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 180px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    z-index: 50;
  }

  .share-link {
    background: var(--bg2);
    border-width: 1px;
    border-style: solid;
    border-radius: 3px;
    padding: 7px 13px;
    font-size: 0.72rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition:
      color 0.15s,
      border-color 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    width: 100%;
    text-align: left;
    color: var(--muted);
    border-color: var(--border);
  }
  .share-link:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  /* Dynamic state modifiers */
  .clap-btn.active {
    border-color: var(--accent);
    color: var(--accent);
  }
  .clap-btn.burst {
    transform: scale(1.35);
  }
  .clap-btn.maxed {
    cursor: not-allowed;
  }
  .share-btn.open {
    border-color: var(--accent);
    color: var(--accent);
  }
  .share-link.copied {
    color: var(--accent);
    border-color: var(--accent);
  }
</style>
