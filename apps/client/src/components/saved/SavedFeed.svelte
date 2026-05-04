<script lang="ts">
  import { FeedItem } from "@blabbun/ui/components/cards";

  interface SearchPost {
    title: string;
    description: string;
    tags: string[];
    href: string;
    image: string | null;
  }

  let allPosts = $state<SearchPost[]>([]);
  let savedSlugs = $state<string[]>([]);
  let loaded = $state(false);

  function readSavedSlugs(): string[] {
    return Object.keys(localStorage)
      .filter(
        (k) => k.startsWith("bb-bookmark-") && localStorage.getItem(k) === "1"
      )
      .map((k) => k.replace("bb-bookmark-", ""));
  }

  $effect(() => {
    savedSlugs = readSavedSlugs();

    fetch("/search.json")
      .then((r) => r.json())
      .then((posts: unknown) => {
        allPosts = posts as SearchPost[];
        loaded = true;
      })
      .catch(() => {
        loaded = true;
      });

    function onStorage() {
      savedSlugs = readSavedSlugs();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  });

  const savedPosts = $derived(
    savedSlugs
      .map((slug) => allPosts.find((p) => p.href.replace(/^\//, "") === slug))
      .filter((p): p is SearchPost => p !== undefined)
  );
</script>

{#if !loaded}
  <div class="feed-placeholder">loading…</div>
{:else if savedPosts.length === 0}
  <div class="feed-empty">
    nothing saved yet. hit the 🔖 on any post to save it for later.
  </div>
{:else}
  <div class="feed-count">
    {savedPosts.length} post{savedPosts.length !== 1 ? "s" : ""} bookmarked
  </div>
  <div class="feed-list">
    {#each savedPosts as post (post.href)}
      <FeedItem
        title={post.title}
        excerpt={post.description}
        tag={(post.tags[0] ?? "editorial").toUpperCase()}
        imageUrl={post.image ?? ""}
        href={post.href}
      />
    {/each}
  </div>
{/if}

<style>
  .feed-placeholder,
  .feed-empty {
    padding: 40px 0;
    font-size: 0.8rem;
    color: var(--muted);
    border-top: 1px solid var(--divider);
  }

  .feed-count {
    font-size: 0.72rem;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .feed-list {
    padding-left: 20px;
  }
</style>
