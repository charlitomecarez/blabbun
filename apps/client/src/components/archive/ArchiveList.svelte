<script lang="ts">
  import { FeedItem } from "@thelunan/ui/components/cards";

  interface PostItem {
    title: string;
    description: string;
    pubDate: string;
    pubDateRaw: string; // ISO 8601 — must be post.data.pubDate.toISOString()
    monthGroup: string;
    tag: string;
    href: string;
  }

  interface Props {
    posts: PostItem[];
    tags: string[];
  }

  const { posts, tags }: Props = $props();

  let activeTag = $state("all");
  let sortOrder = $state<"newest" | "oldest">("newest");

  const filtered = $derived(
    posts
      .filter((p) =>
        activeTag === "all"
          ? true
          : p.tag.toLowerCase() === activeTag.toLowerCase()
      )
      .sort((a, b) => {
        const aTs = Date.parse(a.pubDateRaw);
        const bTs = Date.parse(b.pubDateRaw);
        return sortOrder === "newest" ? bTs - aTs : aTs - bTs;
      })
  );

  const groups = $derived.by(() => {
    const map = new Map<string, PostItem[]>();
    for (const post of filtered) {
      const existing = map.get(post.monthGroup) ?? [];
      map.set(post.monthGroup, [...existing, post]);
    }
    return [...map.entries()];
  });
</script>

<div>
  <!-- Filter bar -->
  <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <!-- Tag pills -->
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => (activeTag = "all")}
        aria-pressed={activeTag === "all"}
        class="font-manrope rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase transition-colors
               {activeTag === 'all'
          ? 'bg-[#386547] text-[#ccf05f]'
          : 'bg-[#ebf3ed] text-[#386547] hover:bg-[#d8ede0]'}"
      >
        All
      </button>
      {#each tags as tag}
        <button
          onclick={() => (activeTag = tag)}
          aria-pressed={activeTag === tag}
          class="font-manrope rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase transition-colors
                 {activeTag === tag
            ? 'bg-[#386547] text-[#ccf05f]'
            : 'bg-[#ebf3ed] text-[#386547] hover:bg-[#d8ede0]'}"
        >
          {tag}
        </button>
      {/each}
    </div>

    <!-- Sort dropdown — aria-label required by e2e test contract -->
    <select
      aria-label="Sort"
      bind:value={sortOrder}
      class="font-manrope rounded-[8px] border border-[rgba(197,247,208,0.8)] bg-white px-3 py-1.5 text-[13px] text-[#29302d] focus:outline-none"
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </select>
  </div>

  {#if filtered.length === 0}
    <p
      class="font-manrope py-12 text-center text-[15px] text-[rgba(41,48,45,0.45)]"
    >
      No posts tagged "{activeTag}".
    </p>
  {:else}
    <!-- Grouped post list -->
    {#each groups as [month, monthPosts]}
      <div class="mb-8">
        <div class="mb-2 border-b-2 border-[#c5f7d0] pb-3">
          <span
            class="font-manrope text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase"
          >
            {month}
          </span>
        </div>
        {#each monthPosts as post}
          <FeedItem
            title={post.title}
            excerpt={post.description}
            date={post.pubDate}
            tag={post.tag}
            href={post.href}
          />
        {/each}
      </div>
    {/each}
  {/if}
</div>
