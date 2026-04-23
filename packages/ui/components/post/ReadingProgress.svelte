<script lang="ts">
  import { onMount } from "svelte";
  let pct = $state(0);

  onMount(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total =
        (el.scrollHeight || document.body.scrollHeight) - el.clientHeight;
      pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });
</script>

<div
  style="position:fixed;top:0;left:0;right:0;height:2px;z-index:200;background:var(--divider)"
  aria-hidden="true"
>
  <div
    style="height:100%;background:var(--accent);width:{pct}%;transition:width 0.1s linear"
  ></div>
</div>
