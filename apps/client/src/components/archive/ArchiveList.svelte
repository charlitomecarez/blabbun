<script lang="ts">
  import { tagClass } from "@blabbun/utils";

  import InfiniteScroll from "@/components/InfiniteScroll.svelte";

  interface PostItem {
    title: string;
    description: string;
    pubDate: string;
    pubDateRaw: string;
    monthGroup: string;
    tag: string;
    href: string;
    imageUrl?: string;
    claps?: number;
    commentCount?: number;
  }

  interface Props {
    posts: PostItem[];
    tags: string[];
    lockedTag?: string;
  }

  const { posts, tags, lockedTag }: Props = $props();

  // svelte-ignore state_referenced_locally
  let activeTag = $state(lockedTag ?? null);

  const TAG_LIMIT = 5;
  let tagsExpanded = $state(false);
  const visibleTags = $derived(
    tagsExpanded ||
      (activeTag !== null &&
        !tags.slice(0, TAG_LIMIT).includes(activeTag ?? ""))
      ? tags
      : tags.slice(0, TAG_LIMIT)
  );
  const hiddenCount = $derived(Math.max(0, tags.length - TAG_LIMIT));
  let sort = $state<"newest" | "oldest">("newest");
  let month = $state("all");
  let visibleCount = $state(10);

  const months = $derived(
    [...new Set(posts.map((p) => p.pubDateRaw.slice(0, 7)))].sort().reverse()
  );

  const filtered = $derived(
    posts
      .filter((p) => !activeTag || p.tag === activeTag)
      .filter((p) => month === "all" || p.pubDateRaw.startsWith(month))
      .sort((a, b) =>
        sort === "newest"
          ? Date.parse(b.pubDateRaw) - Date.parse(a.pubDateRaw)
          : Date.parse(a.pubDateRaw) - Date.parse(b.pubDateRaw)
      )
  );

  const visible = $derived(filtered.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < filtered.length);

  $effect(() => {
    activeTag;
    sort;
    month; // track — reset count when any filter changes
    visibleCount = 10;
  });
</script>

<div class="archive-root">
  <!-- Controls row -->
  <div class="controls-row">
    {#if !lockedTag}
      <div>
        <div class="controls-label">tag</div>
        <div class="tag-filter-row">
          <button
            class="tag-btn"
            class:active={!activeTag}
            onclick={() => (activeTag = null)}>all</button
          >
          {#each visibleTags as t}
            <button
              class="tag-btn"
              class:active={activeTag === t}
              onclick={() => (activeTag = activeTag === t ? null : t)}
              >/ {t.toLowerCase()}</button
            >
          {/each}
          {#if !tagsExpanded && hiddenCount > 0}
            <button
              class="tag-btn tag-more"
              onclick={() => (tagsExpanded = true)}>+{hiddenCount} more</button
            >
          {:else if tagsExpanded && hiddenCount > 0}
            <button
              class="tag-btn tag-more"
              onclick={() => (tagsExpanded = false)}>less</button
            >
          {/if}
        </div>
      </div>
    {/if}

    <div class="controls-right">
      <select bind:value={month} class="sel" aria-label="Filter by month">
        <option value="all">all time</option>
        {#each months as m}
          <option value={m}>
            {new Date(m + "-01").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </option>
        {/each}
      </select>
      <select bind:value={sort} class="sel" aria-label="Sort">
        <option value="newest">newest</option>
        <option value="oldest">oldest</option>
      </select>
    </div>
  </div>

  {#if filtered.length === 0}
    <p style="color:var(--muted);font-size:0.8rem">nothing matches.</p>
  {:else}
    <!-- Archive list -->
    <div class="archive-list">
      {#each visible as p}
        <div class="archive-row">
          <!-- Stretched link -->
          <a href={p.href} class="archive-link" aria-label={p.title}></a>

          <!-- Date + badge + stats -->
          <div class="archive-meta">
            <span class="archive-date">{p.pubDate}</span>
            <span class="archive-badge {tagClass(p.tag)}">{p.tag}</span>
            <span class="archive-stats"
              >👏 {p.claps ?? 0} · 💬 {p.commentCount ?? 0}</span
            >
          </div>

          <!-- Title -->
          <div class="archive-title">{p.title}</div>
        </div>
      {/each}
    </div>
    <InfiniteScroll {hasMore} onLoadMore={() => (visibleCount += 10)} />
  {/if}
</div>

<style>
  /* ─── Controls ────────────────────────────────────────────── */
  .controls-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--divider);
    align-items: flex-end;
  }
  .controls-label {
    font-size: 0.62rem;
    color: var(--muted);
    margin-bottom: 5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .archive-root {
    animation: fadeIn 0.2s ease;
  }
  .controls-right {
    margin-left: auto;
    display: flex;
    gap: 10px;
  }
  .sel {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 5px 10px;
    font-size: 0.7rem;
    color: var(--text);
    font-family: inherit;
    outline: none;
    cursor: pointer;
  }
  .tag-filter-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .tag-btn {
    background: none;
    border: none;
    padding: 3px 0;
    font-size: 0.7rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    color: var(--muted);
    font-weight: 400;
    transition: color 0.12s;
  }
  .tag-btn.active,
  .tag-btn:hover {
    color: var(--accent);
    font-weight: 500;
  }
  .tag-more {
    color: var(--muted2);
    font-size: 0.65rem;
  }
  .tag-more:hover {
    color: var(--accent);
    font-weight: 400;
  }

  /* ─── Archive row ─────────────────────────────────────────── */
  .archive-list {
    padding-left: 20px;
  }
  .archive-row {
    padding: 13px 0;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    position: relative;
  }

  @media (max-width: 640px) {
    /* Remove gutter — no room for it on mobile */
    .archive-list {
      padding-left: 0;
    }
    /* Container is now px-4 (1rem) — no breakout needed */
    .archive-row {
      padding: 13px 0;
    }
    .archive-meta {
      gap: 6px;
      margin-bottom: 4px;
    }
    .archive-date {
      font-size: 0.64rem;
    }
    .archive-badge {
      font-size: 0.64rem;
    }
    .archive-stats {
      font-size: 0.6rem;
    }
    .archive-title {
      font-size: 0.84rem;
    }
  }
  .archive-link {
    position: absolute;
    inset: 0;
    z-index: 2;
  }
  .archive-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 5px;
    flex-wrap: wrap;
  }
  .archive-date {
    font-size: 0.67rem;
    color: var(--muted);
  }
  .archive-stats {
    font-size: 0.62rem;
    color: var(--muted2);
  }
  .archive-title {
    font-size: 0.86rem;
    font-weight: 500;
    line-height: 1.45;
    color: var(--text);
    transition: color 0.15s;
    text-wrap: pretty;
    position: relative;
    z-index: 1;
  }
  .archive-row:hover .archive-title {
    color: var(--accent);
  }

  /* ─── Badge base ──────────────────────────────────────────── */
  .archive-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 2px;
    letter-spacing: 0.04em;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
