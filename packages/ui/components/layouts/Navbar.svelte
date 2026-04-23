<script lang="ts">
  interface NavLink {
    label: string;
    href: string;
    active?: boolean;
  }

  interface Props {
    brandName?: string;
    brandHref?: string;
    links?: NavLink[];
    subscribeHref?: string | null;
    showSearch?: boolean;
  }

  const {
    brandName = "Blab Bun",
    brandHref = "/",
    links = [
      { label: "Archive", href: "/archive" },
      { label: "Topics", href: "/topics" },
      { label: "About", href: "/about" },
    ],
    subscribeHref = "/subscribe",
    showSearch = true,
  }: Props = $props();

  let mobileOpen = $state(false);
</script>

<nav
  class="fixed top-0 right-0 left-0 z-50
         border-b border-[rgba(197,247,208,0.2)]
         bg-[rgba(241,248,243,0.85)] backdrop-blur-[12px]"
>
  <div
    class="mx-auto flex max-w-[1200px] items-center
           justify-between px-4 py-4 md:px-8"
  >
    <!-- Brand -->
    <a
      href={brandHref}
      class="font-space-grotesk text-[20px] font-bold tracking-[-0.04em]
             text-[#386547] md:text-[22px]"
    >
      {brandName}<span class="text-[#ccf05f]">.</span>
    </a>

    <!-- Desktop nav links -->
    <div class="hidden items-center gap-8 md:flex">
      {#each links as link}
        <a
          href={link.href}
          class={[
            "font-manrope text-[14px] font-medium transition-colors",
            link.active
              ? "text-[#386547]"
              : "text-[rgba(41,48,45,0.6)] hover:text-[#29302d]",
          ].join(" ")}
        >
          {link.label}
        </a>
      {/each}
    </div>

    <!-- Desktop right: search + write + subscribe -->
    <div class="hidden items-center gap-4 md:flex">
      {#if showSearch}
        <button
          aria-label="Search"
          onclick={() =>
            window.dispatchEvent(
              new CustomEvent("search:toggle", { bubbles: true })
            )}
          class="text-[rgba(41,48,45,0.5)] transition-colors hover:text-[#386547]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6.5"
              stroke="currentColor"
              stroke-width="1.4"
            />
            <path
              d="M13 13l4 4"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
          </svg>
        </button>
      {/if}

      {#if subscribeHref}
        <a
          href={subscribeHref}
          class="font-manrope rounded-full bg-[#386547] px-5 py-2
                 text-[13px] font-bold text-[#ccffd8]
                 transition-colors hover:bg-[#2d5a3d]"
        >
          Subscribe
        </a>
      {/if}
    </div>

    <!-- Mobile right: search + subscribe pill + hamburger -->
    <div class="flex items-center gap-3 md:hidden">
      {#if showSearch}
        <button
          aria-label="Search"
          onclick={() =>
            window.dispatchEvent(
              new CustomEvent("search:toggle", { bubbles: true })
            )}
          class="text-[rgba(41,48,45,0.5)] transition-colors hover:text-[#386547]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6.5"
              stroke="currentColor"
              stroke-width="1.4"
            />
            <path
              d="M13 13l4 4"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
          </svg>
        </button>
      {/if}
      {#if subscribeHref}
        <a
          href={subscribeHref}
          class="font-manrope rounded-full bg-[#386547] px-4 py-1.5
                 text-[12px] font-bold text-[#ccffd8]
                 transition-colors hover:bg-[#2d5a3d]"
        >
          Subscribe
        </a>
      {/if}

      <button
        onclick={() => (mobileOpen = !mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        class="text-[rgba(41,48,45,0.6)] transition-colors hover:text-[#386547]"
      >
        {#if mobileOpen}
          <!-- X icon -->
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 5l12 12M17 5L5 17"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        {:else}
          <!-- Hamburger icon -->
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 6h16M3 11h16M3 16h16"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile dropdown menu -->
  {#if mobileOpen}
    <div
      class="border-t border-[rgba(197,247,208,0.3)] bg-[rgba(241,248,243,0.97)] md:hidden"
    >
      <div class="flex flex-col gap-1 px-4 py-4">
        {#each links as link}
          <a
            href={link.href}
            onclick={() => (mobileOpen = false)}
            class={[
              "font-manrope rounded-lg px-2 py-3 text-[15px] font-medium transition-colors",
              link.active
                ? "bg-[rgba(197,247,208,0.2)] text-[#386547]"
                : "text-[rgba(41,48,45,0.7)] hover:bg-[rgba(197,247,208,0.15)] hover:text-[#29302d]",
            ].join(" ")}
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</nav>
