<script lang="ts">
  import { tagClass } from "@blabbun/utils";

  interface Props {
    author?: string;
    date?: string;
    title: string;
    excerpt?: string;
    tag?: string;
    readTime?: string;
    imageUrl?: string;
    href?: string;
    claps?: number;
    commentCount?: number;
  }

  const {
    date = "",
    title,
    excerpt = "",
    tag = "EDITORIAL",
    readTime = "5 min read",
    imageUrl = "",
    href = "#",
    claps,
    commentCount,
  }: Props = $props();
</script>

<!--
  Pure-CSS hover — no client: directive needed.
  The parent list has padding-left:20px; the › sits in that gutter via left:-20px.
-->
<article class="feed-card">
  <!-- › gutter arrow — CSS opacity transition -->
  <div class="feed-arrow" aria-hidden="true">›</div>

  <!-- Image -->
  {#if imageUrl}
    <div class="feed-img-wrap">
      <img
        src={imageUrl}
        alt={title}
        width="616"
        height="140"
        loading="lazy"
        decoding="async"
        class="feed-img"
      />
    </div>
  {/if}

  <!-- Date + tag badge -->
  <div class="feed-meta-top">
    {#if date}
      <span class="feed-date">{date}</span>
    {/if}
    <span class="feed-badge {tagClass(tag)}">{tag}</span>
  </div>

  <!-- Title (stretched link) -->
  <a {href} class="feed-title-link" aria-label={title}>
    <h3 class="feed-title">{title}</h3>
  </a>

  <!-- Excerpt -->
  {#if excerpt}
    <p class="feed-excerpt">{excerpt}</p>
  {/if}

  <!-- Meta row -->
  <div class="feed-meta-bottom">
    <span class="feed-stat">{readTime}</span>
    {#if claps !== undefined && claps > 0}
      <span class="feed-stat">👏 {claps}</span>
    {/if}
    {#if commentCount !== undefined}
      <span class="feed-stat">💬 {commentCount}</span>
    {/if}
  </div>
</article>

<style>
  /* ─── Card shell ───────────────────────────────────────────── */
  .feed-card {
    padding: 22px 0;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    position: relative;
    transition: background 0.15s;
  }

  /* ─── › arrow — lives in the 20px left gutter ─────────────── */
  .feed-arrow {
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent);
    font-size: 0.9rem;
    line-height: 1;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s;
  }
  .feed-card:hover .feed-arrow {
    opacity: 1;
  }

  /* ─── Image ───────────────────────────────────────────────── */
  .feed-img-wrap {
    width: 100%;
    height: 140px;
    border-radius: 3px;
    margin-bottom: 20px;
    overflow: hidden;
    position: relative;
  }
  .feed-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .feed-card:hover .feed-img {
    transform: scale(1.02);
  }
  @media (max-width: 640px) {
    /* Break out of <main> px-8 (2rem) + #post-list padding (20px) on both sides */
    .feed-card {
      margin-left: calc(-2rem - 10px);
      margin-right: calc(-2rem - 10px);
      padding: 18px 1.25rem;
    }
    /* Hide gutter arrow — no gutter on mobile */
    .feed-arrow {
      display: none;
    }
    /* Image bleeds out of the card's own 1.25rem padding */
    .feed-img-wrap {
      margin-left: -1.25rem;
      margin-right: -1.25rem;
      width: calc(100% + 2.5rem);
      border-radius: 0;
      height: 180px;
      margin-bottom: 14px;
    }
    .feed-meta-top {
      gap: 8px;
      margin-bottom: 6px;
    }
    .feed-date {
      font-size: 0.65rem;
    }
    .feed-badge {
      font-size: 0.65rem;
    }
    .feed-title {
      font-size: 1rem;
      line-height: 1.45;
      margin-bottom: 6px;
    }
    .feed-excerpt {
      font-size: 0.76rem;
      line-height: 1.6;
      margin-bottom: 8px;
    }
    .feed-meta-bottom {
      gap: 10px;
    }
    .feed-stat {
      font-size: 0.64rem;
    }
  }

  /* ─── Date + badge row ────────────────────────────────────── */
  .feed-meta-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .feed-date {
    font-size: 0.68rem;
    color: var(--muted);
  }

  /* ─── Tag badge base ──────────────────────────────────────── */
  .feed-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 2px;
    letter-spacing: 0.04em;
    font-weight: 500;
    white-space: nowrap;
  }

  /* ─── Title ───────────────────────────────────────────────── */
  .feed-title-link {
    display: block;
    text-decoration: none;
  }
  /* stretched link: covers whole card */
  .feed-title-link::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: 3px;
  }
  .feed-title {
    font-size: 0.93rem;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 8px;
    text-wrap: pretty;
    color: var(--text);
    transition: color 0.15s;
  }
  .feed-card:hover .feed-title {
    color: var(--accent);
  }

  /* ─── Excerpt ─────────────────────────────────────────────── */
  .feed-excerpt {
    font-size: 0.78rem;
    color: var(--muted);
    line-height: 1.65;
    text-wrap: pretty;
    margin-bottom: 10px;
  }

  /* ─── Bottom meta ─────────────────────────────────────────── */
  .feed-meta-bottom {
    display: flex;
    gap: 12px;
    align-items: center;
    position: relative;
    z-index: 10;
  }
  .feed-stat {
    font-size: 0.65rem;
    color: var(--muted2);
  }
</style>
