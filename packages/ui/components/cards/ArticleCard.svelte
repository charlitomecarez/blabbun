<script lang="ts">
  interface Props {
    tag: string;
    readTime: string;
    title: string;
    excerpt: string;
    /** Displayed at the bottom bar, e.g. "ENTRY #102" */
    entryNumber: string;
    /** Picsum or any image URL — use ?grayscale for the editorial look */
    imageUrl: string;
    href: string;
  }

  const { tag, readTime, title, excerpt, entryNumber, imageUrl, href }: Props =
    $props();
</script>

<!--
  Reusable editorial article card.
  Designed for a 3-column grid but works in any flex/grid context.
  Hover: image desaturation lifts + scales, arrow turns green.
  No client: directive needed — hover effects are pure CSS.
-->
<a {href} class="group flex flex-col items-start">
  <!-- Image — grayscale lifts on hover -->
  <div class="w-full pb-8">
    <div class="overflow-hidden bg-[#e7e5e4]">
      <img
        src={imageUrl}
        alt={title}
        class="h-[440px] w-full scale-100 object-cover grayscale
               transition-all duration-500
               group-hover:scale-105 group-hover:grayscale-0"
      />
    </div>
  </div>

  <!-- Tag + read-time row -->
  <div class="mb-[14px] flex w-full items-center justify-between">
    <span
      class="font-space-grotesk text-[9px] font-bold
             tracking-[0.1em] text-[#2d5a3d] uppercase"
    >
      {tag}
    </span>
    <span
      class="font-space-grotesk text-[9px]
             tracking-[0.1em] text-[#a8a29e] uppercase"
    >
      {readTime}
    </span>
  </div>

  <!-- Heading -->
  <h3
    class="font-space-grotesk mb-[14px] w-full text-2xl
           leading-8 font-bold tracking-[-0.025em] text-[#2d3435] uppercase"
  >
    {title}
  </h3>

  <!-- Excerpt -->
  <p class="font-inter mb-6 w-full grow text-sm leading-[1.625] text-[#5a6061]">
    {excerpt}
  </p>

  <!-- Bottom rule: entry number + directional arrow -->
  <div
    class="flex w-full items-center justify-between
           border-t border-[rgba(173,179,180,0.15)] pt-6"
  >
    <span
      class="font-inter text-[10px] font-bold
             tracking-[0.1em] text-[#2d3435] uppercase"
    >
      {entryNumber}
    </span>

    <!-- Arrow turns green on hover via group -->
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      class="text-[#2d3435] transition-colors group-hover:text-[#2d5a3d]"
    >
      <path
        d="M1 7h12M7 1l6 6-6 6"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</a>
