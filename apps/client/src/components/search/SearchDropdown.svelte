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

  const filtered = $derived.by(() => {
    const normalized = toLower(trim(query));
    if (!normalized) return [];
    return posts
      .filter((p) => {
        const haystack = toLower(
          join([p.title, p.description, ...p.tags], " ")
        );
        return haystack.includes(normalized);
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
    // listen to inline search from Navbar
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
    // legacy toggle (mobile)
    window.addEventListener("search:toggle", async () => {
      open = !open;
      if (open) loadPosts();
      else query = "";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      // "/" shortcut focuses the navbar search input
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

{#if open && filtered.length > 0}
  <div
    bind:this={containerEl}
    style="
      position:fixed;top:49px;left:50%;z-index:99;
      width:calc(100% - 2rem);max-width:640px;
      transform:translateX(-50%);
      border:1px solid var(--border);border-top:none;
      border-radius:0 0 4px 4px;
      background:var(--bg);
      box-shadow:0 8px 24px rgba(0,0,0,0.12);
    "
  >
    {#each filtered as post}
      <a
        href={post.href}
        onclick={close}
        style="
          display:flex;align-items:start;gap:12px;
          padding:10px 16px;text-decoration:none;
          border-bottom:1px solid var(--divider);
          transition:background 0.1s;
        "
        onmouseenter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--bg2)";
        }}
        onmouseleave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <div style="flex:1;min-width:0">
          <p
            style="font-size:0.88rem;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
          >
            {post.title}
          </p>
          <p
            style="font-size:0.72rem;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
          >
            {post.description}
          </p>
        </div>
        {#if post.image}
          <img
            src={post.image}
            alt=""
            style="width:44px;height:30px;border-radius:2px;object-fit:cover;flex-shrink:0;opacity:0.85"
          />
        {/if}
      </a>
    {/each}
  </div>
{/if}
