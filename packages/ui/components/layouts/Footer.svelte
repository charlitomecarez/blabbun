<script lang="ts">
  interface FooterLink {
    label: string;
    href: string;
  }

  interface Props {
    brandName?: string;
    copyright?: string;
    links?: FooterLink[];
  }

  const {
    brandName = "openblobs",
    copyright = `© ${new Date().getFullYear()} openblobs`,
    links = [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Help", href: "/help" },
      { label: "RSS", href: "/rss.xml" },
    ],
  }: Props = $props();
</script>

<!--
  Minimal single-row footer with green tint background.
  Brand + copyright left; utility links right.
-->
<footer class="border-t border-[rgba(197,247,208,0.3)] bg-[#ebf3ed]">
  <div
    class="mx-auto flex max-w-[1200px] flex-col items-center justify-between
           gap-4 px-4 py-5 md:flex-row md:px-8"
  >
    <!-- Left: brand + copyright -->
    <div class="flex items-center gap-4">
      <span
        class="font-space-grotesk text-[18px] font-bold
               tracking-[-0.03em] text-[#386547]"
      >
        {brandName}
      </span>
      <span
        class="font-manrope text-[13px]
               text-[rgba(41,48,45,0.5)]"
      >
        {copyright}
      </span>
    </div>

    <!-- Right: utility links -->
    <nav class="flex items-center gap-6" aria-label="Footer links">
      {#each links as link}
        <a
          href={link.href}
          class="font-manrope text-[13px] text-[rgba(41,48,45,0.5)]
                 transition-colors hover:text-[#386547]"
        >
          {link.label}
        </a>
      {/each}
    </nav>
  </div>
</footer>
