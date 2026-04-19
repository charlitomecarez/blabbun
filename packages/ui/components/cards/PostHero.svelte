<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    tag?: string;
    readTime?: string;
    pubDate: Date;
    author?: string;
    backHref?: string;
  }

  const {
    title,
    description = "",
    tag = "EDITORIAL",
    readTime = "5 min read",
    pubDate,
    author = "openblobs",
    backHref = "/",
  }: Props = $props();

  const formattedDate = pubDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function initials(name: string): string {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
</script>

<!--
  Post detail hero — sits at the top of every article page.
  Contains back link, tag/read-time bar, title, description, and author row.
-->
<header
  class="border-b border-[rgba(197,247,208,0.3)] bg-[#f1f8f3] px-4 pt-14 pb-10 md:px-8 md:pt-20 md:pb-14"
>
  <div class="mx-auto max-w-[760px]">
    <!-- Back link -->
    <a
      href={backHref}
      class="font-manrope group mb-8 inline-flex items-center
             gap-1.5 text-[13px] font-medium
             text-[rgba(41,48,45,0.5)] transition-colors hover:text-[#386547] md:mb-10"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        class="transition-transform group-hover:-translate-x-0.5"
      >
        <path
          d="M13 7H1M6 2L1 7l5 5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Archive
    </a>

    <!-- Tag + read time row -->
    <div class="mb-5 flex items-center justify-between">
      <span
        class="font-manrope rounded-full bg-[rgba(197,247,208,0.5)] px-3 py-1
               text-[11px] font-bold tracking-[0.08em] text-[#386547] uppercase"
      >
        {tag}
      </span>
      <span
        class="font-manrope text-[11px] font-bold tracking-[0.12em]
               text-[rgba(41,48,45,0.4)] uppercase"
      >
        {readTime}
      </span>
    </div>

    <!-- Title -->
    <h1
      class="font-space-grotesk mb-5 text-[32px] leading-[1.08]
             font-bold tracking-[-0.04em] text-[#29302d] sm:text-[42px] md:text-[52px]"
    >
      {title}
    </h1>

    <!-- Description -->
    {#if description}
      <p
        class="font-manrope mb-8 text-[16px] leading-[1.7]
               text-[rgba(41,48,45,0.6)] md:text-[18px]"
      >
        {description}
      </p>
    {/if}

    <!-- Author row -->
    <div class="flex items-center gap-3">
      <div
        class="font-space-grotesk flex h-9 w-9 shrink-0 items-center justify-center
               rounded-full bg-[#c5f7d0] text-[12px] font-bold text-[#386547]"
      >
        {initials(author)}
      </div>
      <span
        class="font-manrope text-[14px] font-semibold text-[rgba(41,48,45,0.8)]"
      >
        {author}
      </span>
      <span class="text-[rgba(41,48,45,0.25)]">·</span>
      <time
        datetime={pubDate.toISOString()}
        class="font-manrope text-[13px] text-[rgba(41,48,45,0.45)]"
      >
        {formattedDate}
      </time>
    </div>
  </div>
</header>
