<script lang="ts">
  import FeaturedCard from "@/components/home/FeaturedCard.svelte";
  import PostCard from "@/components/home/PostCard.svelte";

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

  const isGridView = $derived(sort === "newest" && activeTag === "all");
  const featuredPost = $derived(filtered[0] ?? null);
  const sidebarPosts = $derived(filtered.slice(1, 4));
  const listingPosts = $derived(isGridView ? filtered.slice(4) : filtered);
  const visibleListing = $derived(listingPosts.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < listingPosts.length);

  $effect(() => {
    activeTag; // track — reset count when filter changes
    sort; // track — reset count when sort changes
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

{#if isGridView && featuredPost}
  <section class="grid-section" aria-label="Featured posts">
    <div class="featured-grid" class:solo={sidebarPosts.length === 0}>
      <FeaturedCard
        date={featuredPost.date}
        title={featuredPost.title}
        excerpt={featuredPost.excerpt}
        tags={featuredPost.tags}
        readTime={featuredPost.readTime}
        href={featuredPost.href}
        claps={featuredPost.claps}
        commentCount={featuredPost.commentCount}
        views={featuredPost.views}
        postNumber={featuredPost.postNumber}
      />
      {#if sidebarPosts.length > 0}
        <div class="sidebar-col">
          <div class="sidebar-label handwritten">also fresh</div>
          {#each sidebarPosts as item, i}
            <PostCard {...item} index={i} compact={true} />
          {/each}
        </div>
      {/if}
    </div>
  </section>

  {#if visibleListing.length > 0}
    <div class="listing-divider" aria-hidden="true">
      <span class="divider-label">more posts</span>
    </div>
    <section class="listing-section" aria-label="More posts">
      {#each visibleListing as item, i}
        <PostCard {...item} index={i} isLatest={false} />
      {/each}
    </section>
  {/if}

{:else}
  <div id="post-list" class="animate-[fadeIn_0.2s_ease] px-5">
    {#each visibleListing.map((item, i) => ({ ...item, isLatest: i === 0 })) as item, i}
      <PostCard {...item} index={i} />
    {/each}
  </div>
{/if}

{#if hasMore}
  <div class="load-more-wrap">
    <button class="load-more-btn" onclick={() => (visibleCount += 10)}>
      <span aria-hidden="true">↓</span> load more posts
    </button>
  </div>
{/if}

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

  /* ─── Grid section ───────────────────────────────────────────── */
  .grid-section {
    margin-top: 20px;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 12px;
    align-items: start;
  }

  .featured-grid.solo {
    grid-template-columns: 1fr;
  }

  .sidebar-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sidebar-label {
    font-size: 0.85rem;
    color: var(--muted2);
    margin-bottom: 2px;
    transform: rotate(-1deg);
    display: inline-block;
  }

  /* ─── Listing divider ────────────────────────────────────────── */
  .listing-divider {
    position: relative;
    border-top: 1px dashed var(--border);
    margin: 28px 0 0;
    text-align: center;
  }

  .divider-label {
    position: relative;
    top: -9px;
    display: inline-block;
    background: var(--bg);
    padding: 0 12px;
    font-size: 0.65rem;
    color: var(--muted2);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .listing-section {
    padding: 0 20px;
  }

  /* ─── Load more ──────────────────────────────────────────────── */
  .load-more-wrap {
    display: flex;
    justify-content: center;
    margin: 24px 0 8px;
  }

  .load-more-btn {
    background: none;
    border: 1.5px dashed var(--border);
    border-radius: 6px;
    padding: 10px 32px;
    font-size: 0.72rem;
    font-family: inherit;
    color: var(--muted);
    cursor: pointer;
    letter-spacing: 0.04em;
    transition:
      color 0.15s,
      border-color 0.15s;
  }

  .load-more-btn:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  /* ─── Responsive ─────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .featured-grid {
      grid-template-columns: 1fr;
    }

    .listing-section {
      padding: 0;
    }
  }
</style>
