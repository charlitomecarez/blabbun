<script lang="ts">
  import InfiniteScroll from "@/components/InfiniteScroll.svelte";
  import PostCard from "@/components/home/PostCard.svelte";
  import ScribbleDivider from "@/components/home/ScribbleDivider.svelte";

  interface FeedItemData {
    date: string;
    title: string;
    excerpt?: string;
    tags: string[];
    readTime?: string;
    imageUrl?: string;
    href: string;
    claps?: number;
    commentCount?: number;
    postNumber?: number;
  }

  interface Props {
    feedItems: FeedItemData[];
    allTags: string[];
  }

  const { feedItems, allTags }: Props = $props();

  let activeTag = $state("all");
  let visibleCount = $state(10);

  const filtered = $derived(
    activeTag === "all"
      ? feedItems
      : feedItems.filter((item) => item.tags.includes(activeTag))
  );

  const zineQuote = $derived(feedItems.length > 3 ? feedItems[3] : null);

  const visible = $derived(filtered.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < filtered.length);

  $effect(() => {
    activeTag; // track — reset count when filter changes
    visibleCount = 10;
  });
</script>

<!-- Tag filter -->
<nav
  id="tag-filters"
  aria-label="Filter posts by tag"
  class="tag-filter-wrap flex flex-wrap gap-x-4 gap-y-1"
>
  <span class="handwritten filter-label" aria-hidden="true">filter:</span>
  <button
    data-tag="all"
    onclick={() => (activeTag = "all")}
    aria-pressed={activeTag === "all"}
    class="tag-btn"
    class:tag-btn--active={activeTag === "all"}
  >
    all
  </button>
  {#each allTags as t}
    <button
      data-tag={t}
      onclick={() => (activeTag = t)}
      aria-pressed={activeTag === t}
      class="tag-btn"
      class:tag-btn--active={activeTag === t}
    >
      / {t.toLowerCase()}
    </button>
  {/each}
</nav>

<!-- Post list -->
<div id="post-list" class="animate-[fadeIn_0.2s_ease] px-5">
  {#each visible as item, i}
    {#if i === 3 && activeTag === "all" && zineQuote}
      <ScribbleDivider label="↓ a quote i keep thinking about ↓" />
      <a
        href={zineQuote.href}
        class="zine-card"
        style="transform:rotate(-1.2deg)"
      >
        <div
          class="tape"
          style="top:-9px;left:30px;transform:rotate(-4deg)"
        ></div>
        <div
          class="tape"
          style="top:-9px;right:40px;transform:rotate(6deg)"
        ></div>
        <div class="zine-card__meta">
          <span class="handwritten zine-card__date">{zineQuote.date}</span>
          {#each zineQuote.tags as t}
            <span class="zine-card__tag">{t.toLowerCase()}</span>
          {/each}
        </div>
        <h2 class="serif zine-card__title">{zineQuote.title}</h2>
        {#if zineQuote.excerpt}
          <p class="zine-card__excerpt serif">"{zineQuote.excerpt}"</p>
        {/if}
        <div class="zine-card__footer">
          <div class="zine-card__stats">
            {#if zineQuote.readTime}<span class="zine-card__stat"
                >{zineQuote.readTime}</span
              >{/if}
            {#if zineQuote.claps && zineQuote.claps > 0}<span
                class="zine-card__stat">👏 {zineQuote.claps}</span
              >{/if}
            {#if zineQuote.commentCount && zineQuote.commentCount > 0}<span
                class="zine-card__stat">💬 {zineQuote.commentCount}</span
              >{/if}
          </div>
          <span class="handwritten zine-card__cta">read it →</span>
        </div>
      </a>
    {:else}
      <PostCard {...item} index={i} />
    {/if}
  {/each}
  <InfiniteScroll {hasMore} onLoadMore={() => (visibleCount += 10)} />
</div>

<style>
  .tag-filter-wrap {
    border-top: 1px solid var(--divider);
    padding-top: 18px;
    margin-top: 20px;
    margin-bottom: 4px;
    align-items: center;
  }

  .filter-label {
    font-size: 1rem;
    color: var(--muted);
    margin-right: 4px;
    line-height: 1;
    align-self: center;
  }

  .tag-btn {
    background: none;
    border: none;
    padding: 3px 0;
    font-size: 0.7rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    font-weight: 400;
    color: var(--muted);
    transition: color 0.12s;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  .tag-btn:hover {
    color: var(--accent);
  }

  .tag-btn--active {
    color: var(--accent);
    font-weight: 500;
  }

  .zine-card {
    display: block;
    position: relative;
    background: var(--bg2);
    border: 1.5px solid var(--text);
    padding: 28px 24px 22px;
    margin: 24px 8px 32px;
    box-shadow: 4px 4px 0 var(--text);
    text-decoration: none;
    transition: transform 0.15s;
  }

  .zine-card:hover {
    transform: rotate(-1.2deg) translate(-2px, -2px) !important;
  }

  .zine-card__meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .zine-card__date {
    font-size: 0.95rem;
    color: var(--muted);
  }

  .zine-card__tag {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 2px;
    letter-spacing: 0.04em;
    font-weight: 500;
    background: var(--accent-soft);
    color: var(--accent);
  }

  .zine-card__title {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: 10px;
    text-wrap: pretty;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .zine-card__excerpt {
    font-size: 0.88rem;
    font-style: italic;
    color: var(--muted);
    line-height: 1.65;
    text-wrap: pretty;
    margin-bottom: 16px;
  }

  .zine-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .zine-card__stats {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .zine-card__stat {
    font-size: 0.65rem;
    color: var(--muted2);
  }

  .zine-card__cta {
    font-size: 1rem;
    color: var(--accent);
  }
</style>
