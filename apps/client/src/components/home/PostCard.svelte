<script lang="ts">
  import { BookmarkButton } from "@blabbun/ui/components/post";
  import { tagClass } from "@blabbun/utils";

  interface Props {
    date: string;
    title: string;
    excerpt?: string;
    tag: string;
    readTime?: string;
    imageUrl?: string;
    href: string;
    claps?: number;
    commentCount?: number;
    index?: number;
  }

  const {
    date,
    title,
    excerpt = "",
    tag,
    readTime = "",
    imageUrl = "",
    href,
    claps = 0,
    commentCount = 0,
    index = 0,
  }: Props = $props();

  let hov = $state(false);

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
</script>

<article
  style="transform: {articleTransform};"
  class="post-card"
  class:hov
  onmouseenter={() => (hov = true)}
  onmouseleave={() => (hov = false)}
>
  <!-- "this one →" hover callout — always in DOM, shown via CSS -->
  <span class="handwritten this-one" aria-hidden="true">this one →</span>

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
    <span class="tag-badge {tagClass(tag)}">{tag.toLowerCase()}</span>
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
      {#if claps > 0}
        <span class="stat">👏 {claps}</span>
      {/if}
      {#if commentCount > 0}
        <span class="stat">💬 {commentCount}</span>
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
    background: #fff;
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
</style>
