<script lang="ts">
  import InfiniteScroll from "@/components/InfiniteScroll.svelte";
  import PostCard from "@/components/home/PostCard.svelte";

  interface FeedItemData {
    date: string;
    title: string;
    excerpt?: string;
    tag: string;
    readTime?: string;
    imageUrl?: string;
    href: string;
    claps?: number;
    commentCount?: number;
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
      : feedItems.filter((item) => item.tag === activeTag)
  );

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
    <PostCard {...item} index={i} />
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
</style>
