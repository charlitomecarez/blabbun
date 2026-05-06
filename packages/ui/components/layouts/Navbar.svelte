<script lang="ts">
  interface NavLink {
    label: string;
    href: string;
    active?: boolean;
  }

  interface SearchEntry {
    title: string;
    description: string;
    tags: string[];
    href: string;
  }

  interface Props {
    links?: NavLink[];
    postCount?: number;
  }

  const {
    links = [
      { label: "archive", href: "/archive" },
      { label: "topics", href: "/topics" },
      { label: "about", href: "/about" },
    ],
    postCount = 0,
  }: Props = $props();

  let isDark = $state(
    typeof document !== "undefined"
      ? document.body.classList.contains("dark")
      : false
  );
  let search = $state("");
  let mobileOpen = $state(false);

  // Mobile-local search state
  let mobilePosts = $state<SearchEntry[]>([]);
  let mobileSearchLoaded = false;
  let mobileQuery = $state("");

  const mobileFiltered = $derived.by(() => {
    const q = mobileQuery.trim().toLowerCase();
    if (!q) return [];
    return mobilePosts
      .filter((p) => {
        const hay = [p.title, p.description, ...p.tags].join(" ").toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 5);
  });

  async function loadMobilePosts() {
    if (mobileSearchLoaded) return;
    const res = await fetch("/search.json");
    if (!res.ok) return;
    mobilePosts = await res.json();
    mobileSearchLoaded = true;
  }

  function toggleTheme() {
    isDark = !isDark;
    const t = isDark ? "dark" : "light";
    document.body.className = t;
    localStorage.setItem("bb-theme", t);
  }

  function handleDesktopSearch(e: Event) {
    search = (e.target as HTMLInputElement).value;
    if (search) {
      window.dispatchEvent(
        new CustomEvent("search:query", { detail: search, bubbles: true })
      );
      window.dispatchEvent(new CustomEvent("search:open", { bubbles: true }));
    } else {
      window.dispatchEvent(new CustomEvent("search:close", { bubbles: true }));
    }
  }

  function handleDesktopSearchKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      search = "";
      window.dispatchEvent(new CustomEvent("search:close", { bubbles: true }));
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleMobileSearch(e: Event) {
    mobileQuery = (e.target as HTMLInputElement).value;
    if (mobileQuery) loadMobilePosts();
  }

  function handleMobileMenu() {
    mobileOpen = !mobileOpen;
    if (mobileOpen) loadMobilePosts();
    else mobileQuery = "";
  }

  let bookmarkCount = $state(0);
  $effect(() => {
    function updateCount() {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("bb-bookmark-")
      );
      bookmarkCount = keys.filter(
        (k) => localStorage.getItem(k) === "1"
      ).length;
    }
    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  });
</script>

<header
  style="
    border-bottom:1px solid var(--divider);
    position:sticky;top:0;z-index:100;
    background:var(--bg);
    backdrop-filter:blur(8px);
  "
>
  <div
    style="
      max-width:680px;margin:0 auto;
      padding:12px 16px;
      display:flex;align-items:center;gap:20px;
    "
    class="sm:px-8"
  >
    <!-- Logo -->
    <a
      href="/"
      class="logo-link"
      style="
        background:none;border:none;cursor:pointer;padding:0;
        font-family:inherit;
        display:flex;align-items:center;gap:9px;flex-shrink:0;
        text-decoration:none;
      "
    >
      <img
        src="/blabbun-logo.webp"
        alt="blab bun"
        width="28"
        height="28"
        fetchpriority="high"
        class="logo-img"
        style="width:28px;height:28px;object-fit:contain;flex-shrink:0"
      />
      <span
        class="logo-text"
        style="font-size:0.95rem;font-weight:600;letter-spacing:-0.01em;color:var(--text)"
      >
        blab bun<span style="color:var(--accent)">.</span>
      </span>
    </a>

    <!-- Nav links (desktop) -->
    <nav style="gap:18px;align-items:center;flex:1" class="hidden md:flex">
      {#each links as link}
        <a
          href={link.href}
          class="nav-link {link.active ? 'nav-link--active' : ''}"
          style="
            background:none;border:none;font-size:0.74rem;
            font-family:inherit;cursor:pointer;letter-spacing:0.03em;
            text-decoration:none;
            color:{link.active ? 'var(--accent)' : 'var(--muted)'};
            transition:color 0.15s;
          "
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <!-- Right: search + saved + theme (desktop) -->
    <div
      style="align-items:center;gap:10px;flex-shrink:0"
      class="hidden md:flex"
    >
      <!-- Inline search bar -->
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input
          value={search}
          oninput={handleDesktopSearch}
          onkeydown={handleDesktopSearchKey}
          placeholder="search..."
          type="search"
          aria-label="Search posts"
          class="search-input"
        />
        {#if !search}
          <span class="kbd-hint">/</span>
        {/if}
      </div>

      <!-- Saved / bookmarks -->
      <a href="/saved" title="saved posts" class="saved-btn">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style="flex-shrink:0"
        >
          <path
            d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {#if bookmarkCount > 0}
          <span
            style="font-size:0.55rem;background:var(--accent);color:#fff;border-radius:8px;padding:0 4px;line-height:1.7;margin-left:1px"
          >
            {bookmarkCount}
          </span>
        {/if}
      </a>

      <!-- Theme toggle -->
      <button
        onclick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        class="theme-btn"
      >
        {isDark ? "☀ light mode" : "◑ dark mode"}
      </button>
    </div>

    <!-- Mobile right: theme + hamburger -->
    <div
      style="align-items:center;gap:8px;flex-shrink:0;margin-left:auto"
      class="flex md:hidden"
    >
      <button
        onclick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        class="theme-btn"
        style="font-size:0.82rem"
      >
        {isDark ? "☀" : "◑"}
      </button>
      <button
        onclick={handleMobileMenu}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        style="
          background:none;border:1px solid var(--border);border-radius:3px;
          padding:5px 9px;font-size:0.8rem;color:var(--muted);cursor:pointer;
          font-family:inherit;line-height:1;
        "
      >
        {mobileOpen ? "✕" : "☰"}
      </button>
    </div>
  </div>

  <!-- Mobile dropdown -->
  {#if mobileOpen}
    <div
      style="border-top:1px solid var(--divider);background:var(--bg)"
      class="md:hidden"
    >
      <div
        style="display:flex;flex-direction:column;gap:2px;padding:8px 24px 14px"
      >
        <!-- Mobile search -->
        <div style="padding:6px 0 2px">
          <div style="position:relative">
            <span
              style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:0.85rem;pointer-events:none"
              >⌕</span
            >
            <input
              value={mobileQuery}
              oninput={handleMobileSearch}
              placeholder="search posts..."
              type="search"
              aria-label="Search posts"
              style="
                width:100%;background:var(--input-bg);
                border:1px solid var(--border);border-radius:4px;
                padding:9px 12px 9px 30px;font-size:0.82rem;
                font-family:inherit;color:var(--text);outline:none;
              "
            />
          </div>
          <!-- Inline results -->
          {#if mobileFiltered.length > 0}
            <div
              style="margin-top:6px;border:1px solid var(--border);border-radius:4px;overflow:hidden"
            >
              {#each mobileFiltered as post}
                <a
                  href={post.href}
                  onclick={() => {
                    mobileOpen = false;
                    mobileQuery = "";
                  }}
                  style="
                    display:block;padding:10px 12px;
                    text-decoration:none;
                    border-bottom:1px solid var(--divider);
                    background:var(--bg);
                  "
                >
                  <p
                    style="font-size:0.82rem;font-weight:500;color:var(--text);line-height:1.35"
                  >
                    {post.title}
                  </p>
                  {#if post.description}
                    <p
                      style="font-size:0.7rem;color:var(--muted);margin-top:2px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden"
                    >
                      {post.description}
                    </p>
                  {/if}
                </a>
              {/each}
            </div>
          {:else if mobileQuery.length > 0}
            <p style="font-size:0.72rem;color:var(--muted);padding:8px 2px">
              no results for "{mobileQuery}"
            </p>
          {/if}
        </div>
        {#each links as link}
          <a
            href={link.href}
            onclick={() => (mobileOpen = false)}
            style="
              font-size:0.82rem;padding:9px 6px;
              text-decoration:none;transition:color 0.1s;
              color:{link.active ? 'var(--accent)' : 'var(--muted)'};
              font-family:inherit;border-bottom:1px solid var(--divider);
            "
          >
            {link.label}
          </a>
        {/each}
        <a
          href="/saved"
          onclick={() => (mobileOpen = false)}
          style="font-size:0.82rem;padding:9px 6px;text-decoration:none;color:var(--muted);font-family:inherit"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style="flex-shrink:0;display:inline-block;vertical-align:middle;margin-right:4px"
          >
            <path
              d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>saved
          {#if bookmarkCount > 0}
            <span
              style="font-size:0.55rem;background:var(--accent);color:#fff;border-radius:8px;padding:0 4px;line-height:1.7;margin-left:4px"
            >
              {bookmarkCount}
            </span>
          {/if}
        </a>
      </div>
    </div>
  {/if}
</header>

<style>
  /* ── Logo ── */
  .logo-link .logo-img {
    transition: transform 0.2s ease;
    transform-origin: center bottom;
  }
  .logo-link:hover .logo-img {
    transform: rotate(8deg) scale(1.08);
  }
  .logo-link .logo-text {
    transition: color 0.15s;
  }
  .logo-link:hover .logo-text {
    color: var(--accent);
  }

  /* ── Nav links ── */
  .nav-link {
    position: relative;
    padding-bottom: 3px;
  }
  .nav-link::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 6px;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6' preserveAspectRatio='none'><path d='M0 4 Q 12 1, 25 4 T 50 4 T 75 4 T 100 4' stroke='%23C4832A' stroke-width='2' fill='none' stroke-linecap='round'/></svg>")
      no-repeat;
    background-size: 100% 100%;
    opacity: 0;
    transform: scaleX(0.6);
    transform-origin: left;
    transition:
      opacity 0.2s ease,
      transform 0.22s ease;
  }
  .nav-link:hover::after,
  .nav-link.nav-link--active::after {
    opacity: 1;
    transform: scaleX(1);
  }
  /* dark mode — warmer amber stroke */
  :global(body.dark) .nav-link::after {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6' preserveAspectRatio='none'><path d='M0 4 Q 12 1, 25 4 T 50 4 T 75 4 T 100 4' stroke='%23D4A040' stroke-width='2' fill='none' stroke-linecap='round'/></svg>");
  }

  /* ── Search ── */
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-wrap .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 0.85rem;
    pointer-events: none;
    transition: color 0.15s;
  }
  .search-wrap:focus-within .search-icon {
    color: var(--accent);
  }
  .search-input {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 28px 5px 28px;
    font-size: 0.74rem;
    font-family: inherit;
    color: var(--text);
    width: 160px;
    outline: none;
    transition:
      width 0.25s ease,
      border-color 0.15s,
      box-shadow 0.15s;
  }
  .search-input:focus {
    width: 220px;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .search-input::placeholder {
    color: var(--muted2);
  }
  .kbd-hint {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.58rem;
    color: var(--muted2);
    pointer-events: none;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0 4px;
    line-height: 1.6;
    transition: opacity 0.15s;
  }
  .search-wrap:focus-within .kbd-hint {
    opacity: 0;
  }

  /* ── Saved button ── */
  .saved-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 0.68rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    white-space: nowrap;
    font-family: inherit;
    transition:
      border-color 0.15s,
      color 0.15s;
  }
  .saved-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  /* ── Theme toggle ── */
  .theme-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 12px;
    font-family: "Caveat", cursive;
    font-size: 0.92rem;
    color: var(--muted);
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.02em;
    transition:
      border-color 0.15s,
      color 0.15s;
  }
  .theme-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
