<script lang="ts">
  import BunLogo from "./BunLogo.svelte";

  interface NavLink {
    label: string;
    href: string;
    active?: boolean;
  }

  interface Props {
    links?: NavLink[];
  }

  const {
    links = [
      { label: "archive", href: "/archive" },
      { label: "topics", href: "/topics" },
      { label: "about", href: "/about" },
    ],
  }: Props = $props();

  let isDark = $state(
    typeof document !== "undefined"
      ? document.body.classList.contains("dark")
      : false
  );
  let search = $state("");
  let mobileOpen = $state(false);

  function toggleTheme() {
    isDark = !isDark;
    const t = isDark ? "dark" : "light";
    document.body.className = t;
    localStorage.setItem("bb-theme", t);
  }

  function handleSearch(e: Event) {
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

  function handleSearchKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      search = "";
      window.dispatchEvent(new CustomEvent("search:close", { bubbles: true }));
      (e.target as HTMLInputElement).blur();
    }
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
      padding:12px 32px;
      display:flex;align-items:center;gap:20px;
    "
  >
    <!-- Logo -->
    <a
      href="/"
      style="
        background:none;border:none;cursor:pointer;padding:0;
        font-family:inherit;
        display:flex;align-items:center;gap:9px;flex-shrink:0;
        text-decoration:none;
      "
    >
      <BunLogo size={30} />
      <span
        style="font-size:0.95rem;font-weight:600;letter-spacing:-0.01em;color:var(--text)"
      >
        blab bun<span style="color:var(--accent)">.</span>
      </span>
    </a>

    <!-- Nav links (desktop) -->
    <nav
      style="display:flex;gap:16px;align-items:center;flex:1"
      class="hidden md:flex"
    >
      {#each links as link}
        <a
          href={link.href}
          style="
            background:none;border:none;font-size:0.7rem;
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

    <!-- Right: search + saved + theme -->
    <div
      style="display:flex;align-items:center;gap:10px;flex-shrink:0"
      class="hidden md:flex"
    >
      <!-- Inline search bar -->
      <div style="position:relative;flex:1;max-width:200px">
        <span
          style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:0.85rem;pointer-events:none"
          >⌕</span
        >
        <input
          value={search}
          oninput={handleSearch}
          onkeydown={handleSearchKey}
          placeholder="search..."
          type="search"
          aria-label="Search posts"
          style="
            width:100%;background:var(--input-bg);
            border:1px solid var(--border);border-radius:3px;
            padding:6px 24px 6px 26px;font-size:0.74rem;
            font-family:inherit;color:var(--text);outline:none;
          "
        />
        {#if !search}
          <span
            style="position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:0.6rem;color:var(--muted2);pointer-events:none"
            >/</span
          >
        {/if}
      </div>

      <!-- Saved / bookmarks -->
      <a
        href="/saved"
        title="saved posts"
        style="
          background:none;border:1px solid var(--border);border-radius:3px;
          padding:5px 8px;font-size:0.72rem;cursor:pointer;
          color:var(--muted);
          display:flex;align-items:center;gap:4px;
          text-decoration:none;white-space:nowrap;position:relative;
          font-family:inherit;
        "
      >
        🔖
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
        style="
          background:none;border:1px solid var(--border);border-radius:3px;
          padding:5px 10px;font-size:0.68rem;color:var(--muted);cursor:pointer;
          font-family:inherit;letter-spacing:0.04em;white-space:nowrap;
        "
      >
        {isDark ? "☀" : "◑"}
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
        {#each links as link}
          <a
            href={link.href}
            onclick={() => (mobileOpen = false)}
            style="
              font-size:0.82rem;padding:9px 6px;
              text-decoration:none;transition:color 0.1s;
              color:{link.active ? 'var(--accent)' : 'var(--muted)'};
              font-family:inherit;
            "
          >
            {link.label}
          </a>
        {/each}
        <a
          href="/saved"
          style="font-size:0.82rem;padding:9px 6px;text-decoration:none;color:var(--muted)"
          >🔖 saved</a
        >
      </div>
    </div>
  {/if}
</header>
