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
    href: string;
    claps?: number;
    commentCount?: number;
    views?: number;
    postNumber?: number;
  }

  const {
    date,
    title,
    excerpt = "",
    tags,
    readTime = "",
    href,
    claps = 0,
    commentCount = 0,
    views = 0,
    postNumber,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let clapCount = $state(claps);
  let hasClapped = $state(false);
  let clapLoading = $state(true);
  let clapPending = $state(false);
  let burst = $state(false);
  let showPlus = $state(false);
  let burstTimer: ReturnType<typeof setTimeout> | undefined;
  let plusTimer: ReturnType<typeof setTimeout> | undefined;

  const slug = $derived(href.replace(/^\//, ""));

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
      .catch(() => {})
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
    if (clapLoading || clapPending) return;
    clapPending = true;
    const optimisticHasClapped = !hasClapped;
    clapCount = hasClapped ? clapCount - 1 : clapCount + 1;
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
      clapCount = hasClapped ? clapCount - 1 : clapCount + 1;
      hasClapped = !hasClapped;
    } finally {
      clapPending = false;
    }
  }
</script>

<article class="featured-card">
  <!-- Top badges row -->
  <div class="badges-row">
    <span class="latest-badge">🚀 LATEST</span>
    {#if tags.length > 0}
      <span class="tag-pill {tagClass(tags[0])}">{tags[0].toLowerCase()}</span>
    {/if}
  </div>

  <!-- Post number + date -->
  <div class="meta-top">
    {#if postNumber != null}
      <span class="post-num">#{postNumber}</span>
    {/if}
    <span class="post-date">{date}</span>
  </div>

  <!-- Title — the ::after stretched link makes the whole card clickable -->
  <a {href} class="title-link" aria-label={title}>
    <h2 class="post-title">{title}</h2>
  </a>

  <!-- Excerpt -->
  {#if excerpt}
    <p class="post-excerpt">{excerpt}</p>
  {/if}

  <!-- Stats row -->
  <div class="stats-row">
    {#if readTime}
      <span class="stat">{readTime}</span>
    {/if}
    {#if views > 0}
      <span class="stat">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          class="stat-icon"
        >
          <path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
        </svg>{views.toLocaleString()} views
      </span>
    {/if}
  </div>

  <!-- Action row — sits above the stretched link -->
  <div class="action-row">
    <!-- Clap button -->
    <button
      type="button"
      class="clap-btn"
      class:clapped={hasClapped}
      class:burst
      onclick={toggleClap}
      disabled={clapLoading}
      title={hasClapped ? "remove clap" : "clap for this post"}
      aria-pressed={hasClapped}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

    <!-- Comment count pill (only when > 0) -->
    {#if commentCount > 0}
      <span class="comment-pill">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          class="stat-icon"
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

    <!-- Bookmark button -->
    <BookmarkButton {slug} />

    <!-- Read CTA -->
    <span class="read-cta" aria-hidden="true">read →</span>
  </div>
</article>

<style>
  /* ─── Card shell ──────────────────────────────────────────────── */
  .featured-card {
    --featured-bg: #1a1008;
    background: var(--featured-bg);
    border-radius: 8px;
    padding: 24px;
    min-height: 280px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }

  /* Subtle accent gradient overlay */
  .featured-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at top left,
      color-mix(in srgb, var(--accent) 12%, transparent) 0%,
      transparent 60%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* ─── Title link + stretched overlay ────────────────────────── */
  .title-link {
    text-decoration: none;
    position: relative;
    z-index: 1;
  }

  .title-link::after {
    content: "";
    position: absolute;
    inset: -9999px;
    z-index: 0;
  }

  /* ─── Top badges ──────────────────────────────────────────────── */
  .badges-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }

  .latest-badge {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--accent);
    color: #fff;
    padding: 3px 8px;
    border-radius: 3px;
  }

  .tag-pill {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    border-radius: 2px;
    white-space: nowrap;
  }

  /* ─── Meta top ────────────────────────────────────────────────── */
  .meta-top {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 1;
  }

  .post-num {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .post-date {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.45);
  }

  /* ─── Title ───────────────────────────────────────────────────── */
  .post-title {
    font-size: 1.45rem;
    font-weight: 600;
    line-height: 1.25;
    color: #fff;
    text-wrap: pretty;
    letter-spacing: -0.01em;
    margin: 0;
    position: relative;
    z-index: 1;
  }

  /* ─── Excerpt ─────────────────────────────────────────────────── */
  .post-excerpt {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.6;
    text-wrap: pretty;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  /* ─── Stats row ───────────────────────────────────────────────── */
  .stats-row {
    display: flex;
    gap: 12px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .stat {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.35);
  }

  .stat-icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: 2px;
  }

  /* ─── Action row ──────────────────────────────────────────────── */
  .action-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    position: relative;
    z-index: 10;
    margin-top: auto;
  }

  /* ─── Clap button ─────────────────────────────────────────────── */
  .clap-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid var(--accent);
    border-radius: 20px;
    padding: 4px 10px;
    font-family: inherit;
    font-size: 0.65rem;
    color: var(--accent);
    cursor: pointer;
    position: relative;
    transition:
      color 0.15s,
      border-color 0.15s,
      background 0.15s,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .clap-btn:hover:not(:disabled) {
    background: var(--accent-soft);
  }

  .clap-btn:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .clap-btn.clapped {
    background: var(--accent-soft);
  }

  .clap-btn.burst {
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
    0% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-12px);
    }
  }

  /* ─── Comment pill ────────────────────────────────────────────── */
  .comment-pill {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.45);
  }

  /* ─── Read CTA ────────────────────────────────────────────────── */
  .read-cta {
    margin-left: auto;
    background: var(--accent);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 4px;
    pointer-events: none;
    white-space: nowrap;
  }
</style>
