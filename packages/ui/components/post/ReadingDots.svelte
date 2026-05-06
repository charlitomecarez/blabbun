<script lang="ts">
  import { onMount } from "svelte";

  interface Section {
    title: string;
    el: HTMLElement;
  }

  let sections = $state<Section[]>([]);
  let activeIndex = $state(0);
  let mounted = $state(false);

  onMount(() => {
    const h2s = Array.from(
      document.querySelectorAll(".post-content h2")
    ) as HTMLElement[];
    if (h2s.length <= 1) return;

    sections = h2s.map((el) => ({
      title: el.textContent?.trim() ?? "",
      el,
    }));
    mounted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sections.findIndex((s) => s.el === entry.target);
            if (idx !== -1) activeIndex = idx;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const s of sections) observer.observe(s.el);

    function onScroll() {
      if (!sections.length) return;
      if (window.scrollY < sections[0].el.offsetTop - 100) {
        activeIndex = 0;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  });

  function scrollToSection(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

{#if mounted && sections.length > 1}
  <nav class="reading-dots" aria-label="Article sections">
    {#each sections as section, i}
      <button
        type="button"
        class="dot"
        class:active={i === activeIndex}
        class:past={i < activeIndex}
        onclick={() => scrollToSection(section.el)}
        aria-label={section.title}
        title={section.title}
      ></button>
      {#if i < sections.length - 1}
        <div class="dot-line" aria-hidden="true"></div>
      {/if}
    {/each}
  </nav>
{/if}

<style>
  .reading-dots {
    position: fixed;
    /* Sits just left of the 680px content column */
    left: calc(50% - 340px - 28px);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 50;
  }

  @media (max-width: 900px) {
    .reading-dots {
      display: none;
    }
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: var(--muted2);
    cursor: pointer;
    padding: 0;
    transition:
      background 0.2s,
      transform 0.2s;
    flex-shrink: 0;
  }

  .dot.active {
    background: var(--accent);
    transform: scale(1.3);
  }

  .dot.past {
    background: color-mix(in srgb, var(--accent) 45%, transparent);
  }

  .dot:hover:not(.active) {
    transform: scale(1.4);
    background: var(--muted);
  }

  .dot-line {
    width: 2px;
    height: 14px;
    background: var(--divider);
    flex-shrink: 0;
  }
</style>
