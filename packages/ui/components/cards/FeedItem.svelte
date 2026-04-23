<script lang="ts">
  interface Props {
    author?: string;
    date?: string;
    title: string;
    excerpt?: string;
    tag?: string;
    readTime?: string;
    /** 192×128 thumbnail */
    imageUrl?: string;
    href?: string;
    claps?: number;
    commentCount?: number;
  }

  const {
    author = "Blab Bun",
    date = "",
    title,
    excerpt = "",
    tag = "TECHNICAL",
    readTime = "5 min read",
    imageUrl = "",
    href = "#",
    claps,
    commentCount,
  }: Props = $props();

  function initials(name: string): string {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function share() {
    const url = new URL(href, window.location.origin).href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 2000);
  }
</script>

<!--
  Stretched-link pattern: the title <a> gets after:absolute after:inset-0
  so the entire card is clickable. Bookmark/share buttons sit above via
  relative z-10 so they remain individually interactive.
-->
<article
  class="group relative -mx-2 flex items-start gap-4
         rounded-lg border-b border-[rgba(197,247,208,0.4)]
         px-2 py-6 transition-colors hover:bg-[rgba(197,247,208,0.06)] md:gap-6"
>
  <!-- Left: content -->
  <div class="flex min-w-0 flex-1 flex-col gap-3">
    <!-- Author row -->
    <div class="flex items-center gap-2">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center
               rounded-full bg-[#c5f7d0] text-[11px] font-bold
               tracking-wider text-[#386547]"
      >
        {initials(author)}
      </div>
      <span
        class="font-manrope text-[13px] font-medium text-[rgba(41,48,45,0.7)]"
      >
        {author}
      </span>
      {#if date}
        <span class="font-manrope text-[13px] text-[rgba(41,48,45,0.55)]"
          >·</span
        >
        <span class="font-manrope text-[13px] text-[rgba(41,48,45,0.55)]"
          >{date}</span
        >
      {/if}
    </div>

    <!-- Title — stretched link covers the whole card -->
    <a
      {href}
      class="block after:absolute after:inset-0 after:z-0 after:rounded-lg"
      aria-label={title}
    >
      <h3
        class="font-space-grotesk text-[22px] leading-[1.2] font-bold
               tracking-[-0.03em] text-[#29302d]
               transition-colors group-hover:text-[#386547]"
      >
        {title}
      </h3>
    </a>

    {#if excerpt}
      <p
        class="font-manrope line-clamp-2 text-[15px] leading-[1.6] text-[rgba(41,48,45,0.6)]"
      >
        {excerpt}
      </p>
    {/if}

    <!-- Meta row — buttons are relative z-10 to sit above the stretched link -->
    <div class="relative z-10 flex items-center gap-3 pt-1">
      <span
        class="font-manrope rounded-full bg-[#ebf3ed] px-3 py-1 text-[11px]
               font-bold tracking-[0.06em] text-[#386547] uppercase"
      >
        {tag}
      </span>
      <span class="font-manrope text-[12px] text-[rgba(41,48,45,0.55)]"
        >{readTime}</span
      >

      {#if claps !== undefined && claps > 0}
        <span
          class="font-manrope flex items-center gap-1 text-[12px] text-[rgba(41,48,45,0.45)]"
        >
          <span aria-hidden="true">👏</span>
          {claps}
        </span>
      {/if}

      {#if commentCount !== undefined && commentCount > 0}
        <span
          class="font-manrope flex items-center gap-1 text-[12px] text-[rgba(41,48,45,0.45)]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M14 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3l3 3 3-3h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
          </svg>
          {commentCount}
        </span>
      {/if}

      <div class="flex-1"></div>

      <button
        type="button"
        onclick={share}
        aria-label={copied ? "Copied!" : "Share"}
        class="cursor-pointer border-none bg-transparent transition-colors
               {copied
          ? 'text-[#386547]'
          : 'text-[rgba(41,48,45,0.35)] hover:text-[#386547]'}"
      >
        {#if copied}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {:else}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="3"
              r="1.5"
              stroke="currentColor"
              stroke-width="1.3"
            />
            <circle
              cx="4"
              cy="8"
              r="1.5"
              stroke="currentColor"
              stroke-width="1.3"
            />
            <circle
              cx="12"
              cy="13"
              r="1.5"
              stroke="currentColor"
              stroke-width="1.3"
            />
            <path
              d="M5.5 7l5-3M5.5 9l5 3"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Right: thumbnail — decorative, covered by stretched link -->
  {#if imageUrl}
    <div class="hidden shrink-0 sm:block" aria-hidden="true">
      <img
        src={imageUrl}
        alt=""
        width="192"
        height="128"
        loading="lazy"
        decoding="async"
        class="h-[96px] w-[140px] rounded-[8px] object-cover
               transition-opacity group-hover:opacity-80 md:h-[128px] md:w-[192px]"
      />
    </div>
  {/if}
</article>
