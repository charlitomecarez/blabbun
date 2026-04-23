<script lang="ts">
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

  // Map tag → CSS class for color theming (light + dark handled entirely in CSS)
  function tagClass(t: string): string {
    const map: Record<string, string> = {
      RANTS: "tag-rants",
      TAKES: "tag-takes",
      "HALF-BAKED IDEAS": "tag-halfbaked",
      "LIFE STUFF": "tag-lifestuff",
      CULTURE: "tag-culture",
      EDITORIAL: "tag-editorial",
      TECHNICAL: "tag-technical",
    };
    return map[t.toUpperCase()] ?? "tag-default";
  }
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
        alt=""
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

  /* Light mode tag colors */
  .tag-rants {
    background: #fce8e8;
    color: #9b2121;
  }
  .tag-takes {
    background: #e8f0fc;
    color: #1a3a8c;
  }
  .tag-halfbaked {
    background: #fef3e2;
    color: #8a5a00;
  }
  .tag-lifestuff {
    background: #e8f8ee;
    color: #1a6b3a;
  }
  .tag-culture {
    background: #f3e8fc;
    color: #6a1a8c;
  }
  .tag-editorial {
    background: #faebd7;
    color: #8a5a00;
  }
  .tag-technical {
    background: #e8f0fc;
    color: #1a3a8c;
  }
  .tag-default {
    background: #f0ede8;
    color: #6b5e4e;
  }

  /* Dark mode tag colors — scoped via :global(body.dark) */
  :global(body.dark) .tag-rants {
    background: #2a1414;
    color: #d47070;
  }
  :global(body.dark) .tag-takes {
    background: #111a2a;
    color: #6a96d4;
  }
  :global(body.dark) .tag-halfbaked {
    background: #241a08;
    color: #c49040;
  }
  :global(body.dark) .tag-lifestuff {
    background: #0e2218;
    color: #5aab78;
  }
  :global(body.dark) .tag-culture {
    background: #1e1228;
    color: #a870d4;
  }
  :global(body.dark) .tag-editorial {
    background: #241a08;
    color: #c49040;
  }
  :global(body.dark) .tag-technical {
    background: #111a2a;
    color: #6a96d4;
  }
  :global(body.dark) .tag-default {
    background: #1e1a14;
    color: #a09080;
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
