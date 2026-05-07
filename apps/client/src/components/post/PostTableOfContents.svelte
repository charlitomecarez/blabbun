<script lang="ts">
  import { onMount } from "svelte";

  interface Heading {
    slug: string;
    text: string;
    depth: number;
  }

  const { postUrl, postTitle }: { postUrl: string; postTitle: string } =
    $props();

  let headings = $state<Heading[]>([]);
  let activeSlug = $state("");
  let copied = $state(false);

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  onMount(() => {
    const container = document.querySelector(".post-content");
    if (!container) return;

    // Scan for h2 and h3 elements — works for both markdown ## and raw <h2> HTML
    const els = Array.from(
      container.querySelectorAll("h2, h3")
    ) as HTMLElement[];

    // Assign IDs and scroll offset (clears sticky navbar) for all headings
    els.forEach((el) => {
      if (!el.id) {
        el.id = slugify(el.textContent ?? "");
      }
      el.style.scrollMarginTop = "72px";
    });

    headings = els.map((el) => ({
      slug: el.id,
      text: el.textContent?.trim() ?? "",
      depth: el.tagName === "H3" ? 3 : 2,
    }));

    if (!els.length) return;

    const OFFSET = 76; // navbar ~52px + 24px breathing room

    function updateActive() {
      // If we're near the top, deactivate all (title item is default)
      if (window.scrollY < 80) {
        activeSlug = "";
        return;
      }
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= OFFSET) {
          current = el.id;
        } else {
          break;
        }
      }
      activeSlug = current;
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  });

  function scrollToTop(e: MouseEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.pushState(null, "", location.pathname);
    activeSlug = "";
  }

  function scrollToHeading(e: MouseEvent, slug: string) {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", `#${slug}`);
    activeSlug = slug;
  }

  function copyLink() {
    navigator.clipboard.writeText(postUrl).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 2000);
    });
  }

  const fbShareUrl = $derived(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
  );
  const xShareUrl = $derived(
    `https://x.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`
  );
</script>

<aside class="toc-aside" aria-label="Table of contents">
  <div class="toc-label">on this page</div>
  <nav>
    <a
      href="#"
      class="toc-link toc-title"
      class:toc-active={activeSlug === ""}
      onclick={scrollToTop}
    >
      {postTitle}
    </a>

    {#if headings.length > 0}
      {#each headings as h}
        <a
          href={`#${h.slug}`}
          class="toc-link"
          class:toc-active={activeSlug === h.slug}
          style={h.depth >= 3 ? "padding-left: 20px;" : ""}
          onclick={(e) => scrollToHeading(e, h.slug)}
        >
          {h.text}
        </a>
      {/each}
    {/if}
  </nav>

  <div class="share-section">
    <div class="toc-label">share</div>
    <div class="share-links">
      <a
        href={fbShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="share-btn"
        aria-label="Share on Facebook"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
      </a>
      <a
        href={xShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="share-btn"
        aria-label="Share on X"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      </a>
      <button onclick={copyLink} class="share-btn" aria-label="Copy link">
        {#if copied}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {:else}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            />
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</aside>

<style>
  .toc-aside {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 220px);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .toc-aside::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1099px) {
    .toc-aside {
      height: auto;
    }

    .share-section {
      margin-top: 20px;
    }
  }

  .toc-label {
    font-size: 0.62rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted2);
    margin-bottom: 10px;
    font-family: inherit;
  }

  .toc-link {
    display: block;
    font-size: 0.71rem;
    line-height: 1.55;
    color: var(--muted);
    text-decoration: none;
    padding: 3px 6px 3px 8px;
    border-left: 2px solid transparent;
    border-radius: 0 3px 3px 0;
    transition:
      color 0.2s,
      border-color 0.2s,
      background 0.2s;
    font-family: inherit;
  }

  .toc-title {
    font-weight: 500;
    color: var(--text);
    margin-bottom: 4px;
  }

  .toc-link:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }

  .toc-active {
    color: var(--accent);
    border-left-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    font-weight: 500;
  }

  @media (prefers-reduced-motion: reduce) {
    .toc-link {
      transition: none;
    }
  }

  .share-section {
    display: flex;
    flex-direction: column;
    margin-top: auto;
    padding: 16px 12px 12px;
    /* background: var(--bg2);
    border: 1px solid var(--border); */
    border-radius: 4px;
  }

  .share-links {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .share-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 3px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--muted);
    text-decoration: none;
    cursor: pointer;
    transition:
      color 0.15s,
      border-color 0.15s;
    font-family: inherit;
    padding: 0;
    flex-shrink: 0;
  }

  .share-btn:hover {
    color: var(--text);
    border-color: var(--muted);
  }

  .share-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 3px;
  }
</style>
