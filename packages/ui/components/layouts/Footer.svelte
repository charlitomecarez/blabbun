<script lang="ts">
  export let wordCount: number = 0;
</script>

<footer
  class="mx-auto mt-auto flex w-full max-w-[680px] flex-wrap items-center justify-between gap-3 border-t border-[var(--divider)] px-8 py-5"
>
  <!-- left -->
  <div>
    <span class="text-[0.68rem] text-[var(--muted)]">
      blab bun — writings since whenever
    </span>

    {#if wordCount > 0}
      <div class="mt-[2px] text-[0.62rem] text-[var(--muted2)]">
        {wordCount.toLocaleString()} words blabbed so far
      </div>
    {/if}
  </div>

  <!-- right links -->
  <div class="flex items-center gap-4">
    <a
      href="/about"
      class="text-[0.68rem] text-[var(--muted)] underline decoration-[var(--border)]"
    >
      about
    </a>

    <a
      href="/now"
      class="text-[0.68rem] text-[var(--muted)] underline decoration-[var(--border)]"
    >
      /now
    </a>

    <a
      href="/terms"
      class="text-[0.68rem] text-[var(--muted)] underline decoration-[var(--border)]"
    >
      terms
    </a>

    <a
      href="/rss.xml"
      class="rounded-[2px] border border-[var(--accent)] px-[6px] py-[1px] text-[0.64rem] tracking-[0.04em] text-[var(--accent)] no-underline"
    >
      RSS
    </a>
  </div>
</footer>
