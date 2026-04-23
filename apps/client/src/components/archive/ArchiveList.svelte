<script lang="ts">
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
  let sort = $state<"newest" | "oldest">("newest");
  let month = $state("all");

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

  const selStyle =
    "background:var(--input-bg);border:1px solid var(--border);border-radius:3px;padding:5px 10px;font-size:0.7rem;color:var(--text);font-family:inherit;outline:none;cursor:pointer";
</script>

<div style="animation:fadeIn 0.2s ease">
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
          {#each tags as t}
            <button
              class="tag-btn"
              class:active={activeTag === t}
              onclick={() => (activeTag = activeTag === t ? null : t)}
              >/ {t.toLowerCase()}</button
            >
          {/each}
        </div>
      </div>
    {/if}

    <div style="margin-left:auto;display:flex;gap:10px">
      <select bind:value={month} style={selStyle} aria-label="Filter by month">
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
      <select bind:value={sort} style={selStyle} aria-label="Sort">
        <option value="newest">newest</option>
        <option value="oldest">oldest</option>
      </select>
    </div>
  </div>

  {#if filtered.length === 0}
    <p style="color:var(--muted);font-size:0.8rem">nothing matches.</p>
  {:else}
    <!-- Archive list — AllPostsView style: compact rows with hover title color -->
    <div class="archive-list">
      {#each filtered as p}
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
  .archive-link {
    position: absolute;
    inset: 0;
    z-index: 0;
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

  /* Light mode */
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

  /* Dark mode */
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
</style>
