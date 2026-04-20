<script lang="ts">
  import { onMount } from "svelte";

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
  let inputEl = $state<HTMLInputElement | null>(null);
  let containerEl = $state<HTMLDivElement | null>(null);

  const filtered = $derived(
    query.trim().length === 0
      ? []
      : posts
          .filter((p) => {
            const haystack = [p.title, p.description, ...p.tags]
              .join(" ")
              .toLowerCase();
            return haystack.includes(query.trim().toLowerCase());
          })
          .slice(0, 5)
  );

  async function loadPosts() {
    if (posts.length > 0) return;
    const res = await fetch("/search.json");
    posts = await res.json();
  }

  function handleToggle() {
    open = !open;
    if (open) {
      loadPosts();
      setTimeout(() => inputEl?.focus(), 0);
    } else {
      query = "";
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false;
      query = "";
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (open && containerEl && !containerEl.contains(e.target as Node)) {
      open = false;
      query = "";
    }
  }

  onMount(() => {
    window.addEventListener("search:toggle", handleToggle);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("search:toggle", handleToggle);
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
</script>

{#if open}
  <div
    bind:this={containerEl}
    class="fixed top-[64px] left-1/2 z-40 w-[calc(100%-2rem)] max-w-[680px] -translate-x-1/2 rounded-b-[12px] border border-t-0 border-[rgba(197,247,208,0.5)] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
  >
    <!-- Input -->
    <div class="px-4 pt-4 pb-3">
      <input
        bind:this={inputEl}
        bind:value={query}
        type="search"
        placeholder="Search posts..."
        class="font-manrope w-full rounded-[8px] border border-[rgba(197,247,208,0.6)] bg-[#f1f8f3] px-4 py-2.5 text-[16px] text-[#29302d] placeholder-[rgba(41,48,45,0.4)] outline-none focus:border-[#386547] md:text-[15px]"
      />
    </div>

    <!-- Results -->
    {#if query.trim().length > 0}
      <div class="border-t border-[rgba(197,247,208,0.3)] pb-2">
        {#if filtered.length === 0}
          <p
            class="font-manrope px-4 py-4 text-[14px] text-[rgba(41,48,45,0.45)]"
          >
            No results for &ldquo;{query}&rdquo;
          </p>
        {:else}
          {#each filtered as post}
            <a
              href={post.href}
              onclick={() => {
                open = false;
                query = "";
              }}
              class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[rgba(197,247,208,0.12)]"
            >
              <div class="min-w-0 flex-1">
                <div class="mb-1">
                  <span
                    class="font-manrope inline-block rounded-full bg-[#ebf3ed] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.06em] text-[#386547] uppercase"
                  >
                    {post.tags[0] ?? "EDITORIAL"}
                  </span>
                </div>
                <p
                  class="font-space-grotesk line-clamp-1 text-[15px] font-bold text-[#29302d] md:text-[16px]"
                >
                  {post.title}
                </p>
                <p
                  class="font-manrope mt-0.5 line-clamp-1 text-[13px] text-[rgba(41,48,45,0.55)] md:line-clamp-2"
                >
                  {post.description}
                </p>
              </div>
              {#if post.image}
                <img
                  src={post.image}
                  alt=""
                  class="hidden h-12 w-16 shrink-0 rounded-[6px] object-cover sm:block"
                />
              {/if}
            </a>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
{/if}
