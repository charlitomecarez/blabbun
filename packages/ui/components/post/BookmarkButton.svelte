<script lang="ts">
  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let saved = $state(false);
  let mounted = $state(false);
  let burst = $state(false);
  let burstTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    saved = localStorage.getItem(`bb-bookmark-${slug}`) === "1";
    mounted = true;
  });

  function toggle() {
    if (!mounted) return;
    saved = !saved;
    burst = true;
    clearTimeout(burstTimer);
    burstTimer = setTimeout(() => (burst = false), 350);
    if (saved) {
      localStorage.setItem(`bb-bookmark-${slug}`, "1");
    } else {
      localStorage.removeItem(`bb-bookmark-${slug}`);
    }
    // Notify the Navbar bookmark badge to update its count.
    window.dispatchEvent(new Event("storage"));
  }
</script>

{#if mounted}
  <button
    type="button"
    class="bookmark-btn"
    onclick={toggle}
    aria-label={saved ? "Remove bookmark" : "Bookmark this post"}
    title={saved ? "Remove bookmark" : "Bookmark"}
    class:saved
    class:burst
    aria-pressed={saved}
  >
    🔖<span class="bookmark-label">{saved ? "saved" : "save"}</span>
  </button>
{/if}

<style>
  .bookmark-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 10px;
    font-family: inherit;
    font-size: 0.8rem;
    color: var(--muted);
    cursor: pointer;
    line-height: 1;
    transition:
      color 0.15s,
      border-color 0.15s,
      background 0.15s,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .bookmark-btn:hover {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .bookmark-btn.saved {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .bookmark-btn.burst {
    transform: scale(1.2);
  }

  .bookmark-label {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
