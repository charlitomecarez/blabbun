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
    style="color: {saved ? 'var(--accent)' : 'var(--muted)'}"
  >
    🔖
  </button>
{/if}

<style>
  .bookmark-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    font-size: 1.1rem;
    transition: color 0.15s;
  }
</style>
