<script lang="ts">
  import { FeedItem } from "@blabbun/ui/components/cards";

  import InfiniteScroll from "@/components/InfiniteScroll.svelte";

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
<div
  id="tag-filters"
  style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"
>
  <button
    data-tag="all"
    onclick={() => (activeTag = "all")}
    style="background:none;border:none;padding:3px 0;font-size:0.7rem;font-family:inherit;cursor:pointer;letter-spacing:0.03em;font-weight:{activeTag ===
    'all'
      ? '500'
      : '400'};color:{activeTag === 'all' ? 'var(--accent)' : 'var(--muted)'}"
    >all</button
  >
  {#each allTags as t}
    <button
      data-tag={t}
      onclick={() => (activeTag = t)}
      style="background:none;border:none;padding:3px 0;font-size:0.7rem;font-family:inherit;cursor:pointer;letter-spacing:0.03em;font-weight:{activeTag ===
      t
        ? '500'
        : '400'};color:{activeTag === t ? 'var(--accent)' : 'var(--muted)'}"
      >/ {t.toLowerCase()}</button
    >
  {/each}
</div>

<!-- Post list -->
<div
  id="post-list"
  style="padding-left:20px;padding-right:20px;animation:fadeIn 0.2s ease"
>
  {#each visible as item}
    <div data-tag={item.tag}>
      <FeedItem {...item} />
    </div>
  {/each}
  <InfiniteScroll {hasMore} onLoadMore={() => (visibleCount += 10)} />
</div>
