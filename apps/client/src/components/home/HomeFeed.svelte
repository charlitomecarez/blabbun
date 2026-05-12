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
    views?: number;
    postNumber?: number;
    isLatest?: boolean;
  }

  interface Props {
    feedItems: FeedItemData[];
    allTags: string[];
  }

  const { feedItems, allTags }: Props = $props();

  let activeTag = $state("all");
  let visibleCount = $state(10);
  let sort = $state<"newest" | "oldest">("newest");

  const filtered = $derived(
    (activeTag === "all"
      ? feedItems
      : feedItems.filter((item) => item.tags.includes(activeTag))
    )
      .slice()
      .sort((a, b) =>
        sort === "oldest"
          ? (a.postNumber ?? 0) - (b.postNumber ?? 0)
          : (b.postNumber ?? 0) - (a.postNumber ?? 0)
      )
  );

  const zineQuote = $derived(
    sort === "newest" && feedItems.length > 3 ? feedItems[3] : null
  );

  const visible = $derived(
    filtered
      .slice(0, visibleCount)
      .map((item, i) => ({ ...item, isLatest: i === 0 }))
  );
  const hasMore = $derived(visibleCount < filtered.length);

  $effect(() => {
    activeTag;
    sort; // track — reset count when filter or sort changes
    visibleCount = 10;
  });
</script>

<!-- Sort toggle -->
<div style="position:relative; margin-bottom:8px; margin-top:8px;">
  <span
    class="handwritten"
    style="position:absolute; top:-14px; right:12px; background:var(--accent2); color:#fff; font-size:1.1rem; padding:4px 14px; border-radius:14px; transform:rotate(6deg); animation:wiggle 3s ease-in-out infinite; box-shadow:2px 2px 0 var(--text); z-index:5;"
    aria-hidden="true"
  >
    fresh out the oven!
  </span>
  <button
    class="handwritten sort-btn"
    onclick={() => (sort = sort === "newest" ? "oldest" : "newest")}
    aria-label="Toggle sort order"
  >
    {sort === "newest" ? "latest blab ↓" : "oldest blab ↑"}
  </button>
</div>

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
  /* ─── Sort button ────────────────────────────────────────────── */
  .sort-btn {
    font-size: 1.4rem;
    color: var(--accent);
    margin-bottom: 4px;
    transform: rotate(-1deg);
    display: inline-block;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: "Caveat", cursive;
    text-decoration-line: underline;
    text-decoration-style: dashed;
    text-decoration-color: transparent;
    text-underline-offset: 3px;
    transition: text-decoration-color 0.15s;
  }

  .sort-btn:hover {
    text-decoration-color: var(--accent);
  }

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
