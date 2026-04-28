<script lang="ts">
  import IntersectionObserver from "svelte-intersection-observer";

  interface Props {
    hasMore: boolean;
    onLoadMore: () => void;
  }

  const { hasMore, onLoadMore }: Props = $props();

  let sentinel: HTMLElement | null = null;
  let intersecting = $state(false);

  $effect(() => {
    if (intersecting && hasMore) onLoadMore();
  });
</script>

{#if hasMore}
  <IntersectionObserver element={sentinel} bind:intersecting>
    <div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>
  </IntersectionObserver>
  <div class="loading" aria-label="Loading more posts">· · ·</div>
{:else}
  <div class="end" aria-label="End of list">— end —</div>
{/if}

<style>
  .sentinel {
    height: 1px;
  }
  .loading {
    text-align: center;
    font-size: 0.7rem;
    color: var(--muted);
    padding: 24px 0;
    animation: pulse 1.4s ease-in-out infinite;
    letter-spacing: 0.15em;
  }
  .end {
    text-align: center;
    font-size: 0.65rem;
    color: var(--muted2);
    padding: 24px 0;
    letter-spacing: 0.08em;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 1;
    }
  }
</style>
