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

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<button
  type="button"
  onclick={scrollToTop}
  aria-label="Scroll to top"
  aria-hidden={String(!visible)}
  tabindex={visible ? 0 : -1}
  class="fixed right-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center
         rounded-full border border-[rgba(197,247,208,0.5)] bg-[#ebf3ed]
         text-[#386547] shadow-sm transition-opacity duration-300
         hover:bg-[#dceee0] focus:outline-none focus-visible:ring-2
         focus-visible:ring-[#386547]"
  class:opacity-0={!visible}
  class:pointer-events-none={!visible}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
</button>
