<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  const REACTIONS = [
    { emoji: "🔥", label: "fire" },
    { emoji: "💭", label: "thinking" },
    { emoji: "👀", label: "eyes" },
    { emoji: "💯", label: "100" },
    { emoji: "😭", label: "crying" },
  ];

  const DONE_KEY = `bb-midreact-done-${slug}`;

  function reactionStorageKey(label: string) {
    return `bb-reaction-${slug}-${label}`;
  }

  let visible = $state(false);
  let dismissed = $state(false);
  let mounted = $state(false);

  onMount(() => {
    const alreadyReacted = !!localStorage.getItem(`bb-reaction-mine-${slug}`);
    const done = !!localStorage.getItem(DONE_KEY);
    if (alreadyReacted || done) {
      dismissed = true;
      return;
    }

    mounted = true;

    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total =
        (el.scrollHeight || document.body.scrollHeight) - el.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      if (pct >= 50) {
        visible = true;
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  // Does not support undo — unlike ReactionBar, mid-scroll picks are one-way.
  // bb-reaction-mine-{slug} will remain set even if ReactionBar later shows 0.
  function react(label: string) {
    const current = parseInt(
      localStorage.getItem(reactionStorageKey(label)) ?? "0",
      10
    );
    localStorage.setItem(reactionStorageKey(label), String(current + 1));
    localStorage.setItem(`bb-reaction-mine-${slug}`, label);
    localStorage.setItem(DONE_KEY, "1");
    dismissed = true;
  }

  function dismiss() {
    localStorage.setItem(DONE_KEY, "1");
    dismissed = true;
  }
</script>

{#if mounted && visible && !dismissed}
  <div
    class="mid-react"
    role="region"
    aria-label="Mid-article reaction"
    data-testid="mid-scroll-reaction"
  >
    <span class="mid-react-label">thoughts so far? →</span>
    <div class="mid-react-pills">
      {#each REACTIONS as r}
        <button
          type="button"
          class="mid-react-pill"
          onclick={() => react(r.label)}
          aria-label={`React with ${r.label}`}
        >
          {r.emoji}
        </button>
      {/each}
    </div>
    <button
      type="button"
      class="mid-react-dismiss"
      onclick={dismiss}
      aria-label="Dismiss reaction prompt"
    >
      ×
    </button>
  </div>
{/if}

<style>
  .mid-react {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    border: 1.5px solid var(--accent);
    border-radius: 6px;
    padding: 10px 14px;
    background: var(--accent-soft);
    margin: 28px 0;
    animation: mid-react-in 0.3s ease;
  }

  @keyframes mid-react-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mid-react-label {
    font-family: "Caveat", cursive;
    font-size: 1.05rem;
    color: var(--accent);
    flex-shrink: 0;
  }

  .mid-react-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .mid-react-pill {
    font-size: 1.1rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: transform 0.12s;
    line-height: 1;
    font-family: inherit;
  }

  .mid-react-pill:hover {
    transform: scale(1.2);
  }

  .mid-react-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--muted);
    font-size: 1rem;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
    font-family: inherit;
  }

  .mid-react-dismiss:hover {
    color: var(--text);
  }

  @media (prefers-reduced-motion: reduce) {
    .mid-react {
      animation: none;
    }
  }
</style>
