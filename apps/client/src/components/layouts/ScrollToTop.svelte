<script lang="ts">
  import { onMount } from "svelte";

  let visible = $state(false);

  onMount(() => {
    const onScroll = () => {
      visible = window.scrollY > 300;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  });
</script>

<button
  type="button"
  onclick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  aria-label="Scroll to top"
  aria-hidden={visible ? undefined : true}
  tabindex={visible ? 0 : -1}
  class="scroll-fixed"
  style="opacity:{visible ? '1' : '0'};pointer-events:{visible
    ? 'auto'
    : 'none'};">↑</button
>

<style>
  .scroll-fixed {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 50;
    width: 32px;
    height: 32px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg2);
    border: 1px solid var(--border);
    color: var(--muted);
    cursor: pointer;
    font-size: 0.8rem;
    font-family: inherit;
    transition: opacity 0.2s;
  }

  @media (min-width: 1100px) {
    .scroll-fixed {
      display: none;
    }
  }
</style>
