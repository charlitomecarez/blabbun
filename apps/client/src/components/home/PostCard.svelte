<script lang="ts">
  import { onMount } from "svelte";

  import { BookmarkButton } from "@blabbun/ui/components/post";
  import { tagClass } from "@blabbun/utils";

  interface Props {
    date: string;
    title: string;
    excerpt?: string;
    tags: string[];
    readTime?: string;
    imageUrl?: string;
    href: string;
    claps?: number;
    commentCount?: number;
    views?: number;
    index?: number;
    postNumber?: number;
    isLatest?: boolean;
    compact?: boolean;
  }

  const {
    date,
    title,
    excerpt = "",
    tags,
    readTime = "",
    imageUrl = "",
    href,
    claps = 0,
    commentCount = 0,
    views = 0,
    index = 0,
    postNumber,
    isLatest = false,
    compact = false,
  }: Props = $props();

  let hov = $state(false);
  // svelte-ignore state_referenced_locally
  let clapCount = $state(claps);
  let hasClapped = $state(false);
  let clapLoading = $state(true);
  let burst = $state(false);
  let showPlus = $state(false);
  let burstTimer: ReturnType<typeof setTimeout> | undefined;
  let plusTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Derive a consistent tilt angle from the href string so each card
   * tilts slightly differently. Maps to the range -0.5..0.5 deg.
   */
  const tilt = $derived(
    ((href.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 5) - 2) *
      0.25
  );

  /**
   * Polaroid rotation: a small deterministic angle based on href.
   * Uses a different hash multiplier so it differs from card tilt.
   */
  const polaroidRot = $derived(
    (((href.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 3) % 7) -
      3) *
      0.6
  );

  const articleTransform = $derived(
    hov ? `rotate(${tilt}deg) translateX(4px)` : "rotate(0deg) translateX(0)"
  );

  const slug = $derived(href.replace(/^\//, ""));
  const isFirstPost = $derived(slug === "welcome-to-blab-bun");

  onMount(() => {
    fetch(`/api/claps/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<{ count: number; hasClapped: boolean }>;
      })
      .then((data) => {
        clapCount = data.count ?? claps;
        hasClapped = data.hasClapped;
      })
      .catch(() => {
        /* silent — clap state failing shouldn't block the feed */
      })
      .finally(() => {
        clapLoading = false;
      });
    return () => {
      clearTimeout(burstTimer);
      clearTimeout(plusTimer);
    };
  });

  async function toggleClap(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (clapLoading) return;
    const optimisticCount = hasClapped ? clapCount - 1 : clapCount + 1;
    const optimisticHasClapped = !hasClapped;
    clapCount = optimisticCount;
    hasClapped = optimisticHasClapped;
    burst = true;
    clearTimeout(burstTimer);
    burstTimer = setTimeout(() => (burst = false), 350);
    if (optimisticHasClapped) {
      showPlus = true;
      clearTimeout(plusTimer);
      plusTimer = setTimeout(() => (showPlus = false), 700);
    }
    try {
      const res = await fetch(`/api/claps/${slug}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { count: number; hasClapped: boolean };
      clapCount = data.count;
      hasClapped = data.hasClapped;
    } catch {
      // revert optimistic update — hasClapped is already the new value, so inverse it
      clapCount = hasClapped ? clapCount - 1 : clapCount + 1;
      hasClapped = !hasClapped;
    }
  }
</script>

<article
  style="transform: {articleTransform}; --reveal-delay: {Math.min(index, 4) *
    0.05}s"
  class="post-card reveal"
  class:hov
  class:first-post={isFirstPost}
  class:latest-post={isLatest}
  class:compact
  onmouseenter={() => (hov = true)}
  onmouseleave={() => (hov = false)}
>
  <!-- "this one →" hover callout — always in DOM, shown via CSS -->
  <span class="handwritten this-one" aria-hidden="true">this one →</span>

  <!-- post number stamp — hidden when first-stamp or latest-stamp takes the slot -->
  {#if !isFirstPost && !isLatest}
    <span class="handwritten post-num" aria-hidden="true"
      >#{postNumber ?? index + 1}</span
    >
  {/if}

  <!-- "new ✶" stamp — only on the latest post in the current view -->
  {#if isLatest && !isFirstPost}
    <span class="handwritten latest-stamp" aria-label="Latest post"
      >🚀 new ✶ #{postNumber}</span
    >
  {/if}

  <!-- "first post!" stamp — only on the welcome post -->
  {#if isFirstPost}
    <span class="handwritten first-stamp" aria-label="First post"
      >🍞 first post!</span
    >
  {/if}

  <!-- Polaroid image (only when imageUrl is provided) -->
  {#if imageUrl}
    <div class="polaroid-wrap" style="transform: rotate({polaroidRot}deg);">
      <div
        class="tape"
        style="top:-9px; left:20px; transform:rotate(-4deg); z-index:2;"
      ></div>
      <div
        class="tape"
        style="top:-9px; right:24px; transform:rotate(5deg); z-index:2;"
      ></div>
      <div class="polaroid-frame">
        <div class="polaroid-img-wrap">
          <img
            src={imageUrl}
            alt={title}
            width="400"
            height="130"
            loading="lazy"
            decoding="async"
            class="polaroid-img"
          />
        </div>
      </div>
    </div>
  {/if}

  <!-- Date + Tag row -->
  <div class="meta-top">
    <span class="handwritten post-date">{date}</span>
    {#each tags as t}
      <span class="tag-badge {tagClass(t)}">{t.toLowerCase()}</span>
    {/each}
  </div>

  <!-- Title -->
  <a {href} class="title-link" aria-label={title}>
    <h2 class="serif post-title" class:hov>{title}</h2>
  </a>

  <!-- Excerpt -->
  {#if excerpt}
    <p class="post-excerpt">{excerpt}</p>
  {/if}

  <!-- Bottom meta row -->
  <div class="meta-bottom">
    <div class="meta-stats">
      {#if readTime}
        <span class="stat">{readTime}</span>
      {/if}
      <button
        type="button"
        class="clap-stat"
        class:clapped={hasClapped}
        class:burst
        onclick={toggleClap}
        disabled={clapLoading}
        title={hasClapped ? "remove clap" : "clap for this post"}
        aria-pressed={hasClapped}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 11.5V6a1.5 1.5 0 0 1 3 0v3m0-3a1.5 1.5 0 0 1 3 0v3m0-2a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-14 0v-4a1.5 1.5 0 0 1 3 0v2"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="clap-count">{clapCount}</span>
        {#if showPlus}
          <span class="clap-plus" aria-hidden="true">+1</span>
        {/if}
      </button>
      {#if commentCount > 0}
        <span class="stat">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style="display:inline-block;vertical-align:middle;margin-right:2px"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>{commentCount}
        </span>
      {/if}
      {#if views > 0}
        <span class="stat">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style="display:inline-block;vertical-align:middle;margin-right:2px"
          >
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>{views.toLocaleString()} views
        </span>
      {/if}
    </div>
    <BookmarkButton {slug} />
  </div>
</article>

<style>
  /* ─── Card shell ──────────────────────────────────────────────── */
  .post-card {
    padding: 22px 0;
    border-bottom: 1px dashed var(--border);
    cursor: pointer;
    position: relative;
    transition:
      transform 0.18s ease,
      background 0.15s;
  }

  /* ─── "this one →" callout ────────────────────────────────────── */
  .this-one {
    position: absolute;
    left: -44px;
    top: 18px;
    color: var(--accent);
    font-size: 1.1rem;
    pointer-events: none;
    transform-origin: right center;
    white-space: nowrap;
    opacity: 0;
    transform: scale(0) rotate(-10deg);
    transition: none;
  }

  .post-card:hover .this-one {
    animation: pop-in 0.2s ease forwards;
  }

  /* ─── Polaroid image ──────────────────────────────────────────── */
  .polaroid-wrap {
    margin: 4px 0 14px;
    position: relative;
  }

  .polaroid-frame {
    background: var(--bg3);
    padding: 8px 8px 22px;
    box-shadow: 4px 4px 0 var(--text);
    border: 1.5px solid var(--text);
    position: relative;
  }

  .polaroid-img-wrap {
    width: 100%;
    height: 130px;
    overflow: hidden;
    position: relative;
  }

  .polaroid-img-wrap::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.05);
  }

  .polaroid-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ─── Date + tag ──────────────────────────────────────────────── */
  .meta-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .post-date {
    font-size: 0.95rem;
    color: var(--muted);
  }

  .tag-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 2px;
    letter-spacing: 0.04em;
    font-weight: 500;
    white-space: nowrap;
  }

  /* ─── Title ───────────────────────────────────────────────────── */
  .title-link {
    display: block;
    text-decoration: none;
    /* stretched link covers the whole card */
  }

  .title-link::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: 3px;
  }

  .post-title {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: 10px;
    text-wrap: pretty;
    letter-spacing: -0.01em;
    color: var(--text);
    transition: color 0.15s;
  }

  .post-title.hov {
    color: var(--accent);
  }

  /* ─── Excerpt ─────────────────────────────────────────────────── */
  .post-excerpt {
    font-size: 0.8rem;
    color: var(--muted);
    line-height: 1.7;
    text-wrap: pretty;
    margin-bottom: 12px;
  }

  /* ─── Bottom meta ─────────────────────────────────────────────── */
  .meta-bottom {
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    position: relative;
    z-index: 10;
  }

  .meta-stats {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .stat {
    font-size: 0.65rem;
    color: var(--muted2);
  }

  /* ─── Post number stamp ──────────────────────────────────────── */
  .post-num {
    position: absolute;
    top: 14px;
    right: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1.5px dashed var(--accent);
    background: var(--accent-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    color: var(--accent);
    transform: rotate(-5deg);
    pointer-events: none;
    z-index: 5;
    line-height: 1;
    letter-spacing: 0;
  }

  /* ─── Mobile ──────────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .post-card {
      margin-left: calc(-2rem - 10px);
      margin-right: calc(-2rem - 10px);
      padding: 18px 1.25rem;
    }

    .this-one {
      display: none;
    }

    .polaroid-img-wrap {
      height: 110px;
    }

    .post-title {
      font-size: 1.05rem;
    }

    .post-date {
      font-size: 0.82rem;
    }
  }

  /* ─── Latest post treatment ──────────────────────────────────── */
  .latest-post {
    padding: 26px 0;
    border-bottom-style: dashed;
    border-bottom-color: var(--border);
  }

  .latest-post .post-title {
    font-size: 1.5rem;
  }

  .latest-stamp {
    position: absolute;
    top: 14px;
    right: 0;
    font-size: 1rem;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1.5px dashed var(--accent);
    padding: 3px 10px;
    border-radius: 3px;
    transform: rotate(-2deg);
    pointer-events: none;
    z-index: 5;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .latest-post .post-title {
      font-size: 1.2rem;
    }
  }

  /* ─── Clap button ────────────────────────────────────────────── */
  .clap-stat {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 10px;
    font-family: inherit;
    font-size: 0.65rem;
    color: var(--muted);
    cursor: pointer;
    position: relative;
    transition:
      color 0.15s,
      border-color 0.15s,
      background 0.15s,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .clap-stat:hover:not(:disabled) {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .clap-stat:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .clap-stat.clapped {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .clap-stat.burst {
    transform: scale(1.2);
  }

  .clap-count {
    font-weight: 500;
  }

  .clap-plus {
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--accent);
    pointer-events: none;
    animation: float-up 0.7s ease forwards;
  }

  @keyframes float-up {
    0% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  }

  /* ─── First post stamp ────────────────────────────────────────── */
  .first-stamp {
    position: absolute;
    top: 14px;
    right: 0;
    font-size: 1rem;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1.5px dashed var(--accent);
    padding: 3px 10px;
    border-radius: 3px;
    transform: rotate(2deg);
    pointer-events: none;
    z-index: 5;
    white-space: nowrap;
    animation: wiggle 4s ease-in-out infinite;
  }

  .first-post {
    border-bottom-style: solid;
    border-bottom-color: var(--accent);
  }

  /* ─── Compact mode (sidebar cards in grid) ──────────────────── */
  .post-card.compact {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 12px;
    border-bottom: none;
    margin-bottom: 0;
  }

  .post-card.compact .this-one {
    display: none;
  }

  .post-card.compact .post-num,
  .post-card.compact .latest-stamp,
  .post-card.compact .first-stamp {
    display: none;
  }

  @media (max-width: 640px) {
    .post-card.compact {
      margin-left: 0;
      margin-right: 0;
      padding: 10px 12px;
    }
  }
</style>
