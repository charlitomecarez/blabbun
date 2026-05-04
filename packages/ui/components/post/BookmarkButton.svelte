<script lang="ts">
  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let saved = $state(false);
  let mounted = $state(false);

  $effect(() => {
    saved = localStorage.getItem(`bb-bookmark-${slug}`) === "1";
    mounted = true;
  });

  function toggle() {
    if (!mounted) return;
    saved = !saved;
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
    title={saved ? "Bookmarked" : "Bookmark"}
    class:saved
  >
    🔖{#if saved}<span class="bookmark-label">saved</span>{/if}
  </button>
{/if}

<style>
  .bookmark-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    font-family: inherit;
    font-size: 1rem;
    transition:
      color 0.15s,
      background 0.15s;
    color: var(--muted);
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    line-height: 1;
  }
  .bookmark-btn.saved {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .bookmark-label {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
