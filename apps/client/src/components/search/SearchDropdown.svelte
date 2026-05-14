<script lang="ts">
  import { onMount, tick } from "svelte";
  import { join, toLower, trim } from "lodash-es";

  interface SearchEntry {
    title: string;
    description: string;
    tags: string[];
    href: string;
    image?: string;
  }

  let open = $state(false);
  let query = $state("");
  let posts = $state<SearchEntry[]>([]);
  // svelte-ignore non_reactive_update
  let containerEl: HTMLDivElement | null = null;
  let loaded = false;

  const q = $derived(toLower(trim(query)));

  const filtered = $derived.by(() => {
    if (!q) return [];
    const qCompact = q.replace(/\s+/g, "");
    return posts
      .filter((p) => {
        const haystack = toLower(
          join([p.title, p.description, ...p.tags], " ")
        );
        // Also match against a whitespace-stripped version so queries like
        // "blabbun" hit titles/content containing "Blab Bun".
        return (
          haystack.includes(q) ||
          haystack.replace(/\s+/g, "").includes(qCompact)
        );
      })
      .slice(0, 6);
  });

  async function loadPosts() {
    if (loaded) return;
    const res = await fetch("/search.json");
    if (!res.ok) return;
    posts = await res.json();
    loaded = true;
  }

  function close() {
    open = false;
    query = "";
  }

  function handleClickOutside(e: MouseEvent) {
    if (open && containerEl && !containerEl.contains(e.target as Node)) close();
  }

  onMount(() => {
    window.addEventListener("search:query", ((e: CustomEvent) => {
      query = e.detail as string;
      if (query) {
        open = true;
        loadPosts();
      } else close();
    }) as EventListener);
    window.addEventListener("search:open", () => {
      open = true;
      loadPosts();
    });
    window.addEventListener("search:close", close);
    window.addEventListener("search:toggle", async () => {
      open = !open;
      if (open) loadPosts();
      else query = "";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (
        e.key === "/" &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        (e.target as HTMLElement).tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        const inp = document.querySelector<HTMLInputElement>(
          "header input[type=search]"
        );
        inp?.focus();
      }
    });
    document.addEventListener("mousedown", handleClickOutside);
  });
</script>

{#if open && q}
  <div bind:this={containerEl} class="sr-panel" role="listbox">
    <!-- result count header -->
    <div class="sr-header">
      <span class="sr-header-count"
        >{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span
      >
      <span class="sr-header-q">for &ldquo;{q}&rdquo;</span>
    </div>

    {#if filtered.length === 0}
      <!-- no results state -->
      <div class="sr-empty">
        <div class="sr-empty-title">nothing found.</div>
        <div class="sr-empty-sub">try different words.</div>
      </div>
    {:else}
      <!-- result list -->
      <div class="sr-list">
        {#each filtered as post}
          <!-- svelte-ignore a11y_role_has_required_aria_props -->
          <a href={post.href} onclick={close} class="sr-row" role="option">
            <div class="sr-row-body">
              <div class="sr-title">{post.title}</div>
              {#if post.description}
                <div class="sr-desc">{post.description}</div>
              {/if}
              {#if post.tags?.length}
                <div class="sr-tags">
                  {#each post.tags.slice(0, 3) as t}
                    <span class="sr-tag">/ {t.toLowerCase()}</span>
                  {/each}
                </div>
              {/if}
            </div>
            {#if post.image}
              <img src={post.image} alt={post.title} class="sr-thumb" />
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ─── Panel ───────────────────────────────────────────────── */
  .sr-panel {
    position: fixed;
    top: 49px;
    left: 50%;
    z-index: 99;
    width: calc(100% - 2rem);
    max-width: 640px;
    transform: translateX(-50%);
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    animation: fadeSlideIn 0.15s ease-out;
    font-family: inherit;
  }

  /* ─── Header ──────────────────────────────────────────────── */
  .sr-header {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 10px 16px;
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--divider);
  }
  .sr-header-count {
    color: var(--accent);
    font-weight: 500;
  }
  .sr-header-q {
    color: var(--muted2);
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.7rem;
  }

  /* ─── Empty state ─────────────────────────────────────────── */
  .sr-empty {
    padding: 22px 16px;
    text-align: center;
  }
  .sr-empty-title {
    font-family: "Caveat", cursive;
    font-size: 1.15rem;
    color: var(--text);
    margin-bottom: 2px;
  }
  .sr-empty-sub {
    font-size: 0.72rem;
    color: var(--muted);
  }

  /* ─── List ────────────────────────────────────────────────── */
  .sr-list {
    max-height: 60vh;
    overflow-y: auto;
  }
  .sr-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    text-decoration: none;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    position: relative;
    transition: background 0.12s;
  }
  .sr-row:last-child {
    border-bottom: none;
  }
  .sr-row:hover,
  .sr-row:focus-visible {
    background: var(--bg2);
    outline: none;
  }
  .sr-row:hover .sr-title,
  .sr-row:focus-visible .sr-title {
    color: var(--accent);
  }

  .sr-row-body {
    flex: 1;
    min-width: 0;
  }
  .sr-title {
    font-size: 0.84rem;
    font-weight: 500;
    line-height: 1.45;
    color: var(--text);
    text-wrap: pretty;
    transition: color 0.15s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sr-desc {
    font-size: 0.7rem;
    color: var(--muted);
    line-height: 1.55;
    margin-top: 3px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sr-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .sr-tag {
    font-size: 0.62rem;
    color: var(--muted2);
    letter-spacing: 0.03em;
  }

  .sr-thumb {
    width: 48px;
    height: 36px;
    border-radius: 2px;
    object-fit: cover;
    flex-shrink: 0;
    opacity: 0.9;
    border: 1px solid var(--divider);
  }

  /* ─── Mobile ──────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .sr-panel {
      width: 100%;
      border-left: none;
      border-right: none;
      border-radius: 0;
    }
    .sr-row {
      padding: 11px 14px;
    }
    .sr-title {
      font-size: 0.82rem;
    }
    .sr-thumb {
      width: 40px;
      height: 30px;
    }
  }
</style>
