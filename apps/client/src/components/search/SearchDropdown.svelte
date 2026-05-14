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
    <!-- result count header -->
    <div
      style="padding:8px 16px 6px;font-size:0.72rem;color:var(--muted);border-bottom:1px solid var(--divider)"
    >
      {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
    </div>

    {#if filtered.length === 0}
      <!-- no results state -->
      <div style="padding:20px 16px;font-size:0.8rem;color:var(--muted)">
        nothing found. try different words.
      </div>
    {:else}
      <!-- result list -->
      <div style="padding-left:20px">
        {#each filtered as post}
          <a
            href={post.href}
            onclick={close}
            style="
              display:flex;align-items:flex-start;gap:12px;
              padding:13px 16px 13px 0;text-decoration:none;
              border-bottom:1px solid var(--divider);
              cursor:pointer;position:relative;
              transition:background 0.1s;
            "
            onmouseenter={(e) => {
              const title = (
                e.currentTarget as HTMLElement
              ).querySelector<HTMLElement>(".sr-title");
              if (title) title.style.color = "var(--accent)";
            }}
            onmouseleave={(e) => {
              const title = (
                e.currentTarget as HTMLElement
              ).querySelector<HTMLElement>(".sr-title");
              if (title) title.style.color = "var(--text)";
            }}
          >
            <div style="flex:1;min-width:0">
              <div
                class="sr-title"
                style="font-size:0.86rem;font-weight:500;line-height:1.45;color:var(--text);text-wrap:pretty;transition:color 0.15s"
              >
                {post.title}
              </div>
              {#if post.description}
                <div
                  style="font-size:0.72rem;color:var(--muted);margin-top:3px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical"
                >
                  {post.description}
                </div>
              {/if}
            </div>
            {#if post.image}
              <img
                src={post.image}
                alt={post.title}
                style="width:44px;height:30px;border-radius:2px;object-fit:cover;flex-shrink:0;opacity:0.85"
              />
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
{/if}
