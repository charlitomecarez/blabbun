<script lang="ts">
  interface Props {
    wordCount?: number;
  }
  const { wordCount = 0 }: Props = $props();
</script>

<!-- Exact match to design Footer component -->
<footer
  style="
    border-top:1px solid var(--divider);
    padding:22px 32px;
    max-width:680px;width:100%;margin:auto auto 0;
    display:flex;justify-content:space-between;align-items:center;
    flex-wrap:wrap;gap:12px;
  "
>
  <div>
    <span style="font-size:0.68rem;color:var(--muted)"
      >blab bun — writings since whenever</span
    >
    {#if wordCount > 0}
      <div style="font-size:0.62rem;color:var(--muted2);margin-top:2px">
        {wordCount.toLocaleString()} words blabbed so far
      </div>
    {/if}
  </div>

  <div style="display:flex;gap:16px;align-items:center">
    <a
      href="/about"
      style="background:none;border:none;font-size:0.68rem;color:var(--muted);cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-decoration-color:var(--border)"
    >
      about
    </a>
    <a
      href="/now"
      style="background:none;border:none;font-size:0.68rem;color:var(--muted);cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-decoration-color:var(--border)"
    >
      /now
    </a>
    <a
      href="/terms"
      style="background:none;border:none;font-size:0.68rem;color:var(--muted);cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-decoration-color:var(--border)"
    >
      terms
    </a>
    <a
      href="/rss.xml"
      style="font-size:0.64rem;color:var(--accent);text-decoration:none;border:1px solid var(--accent);border-radius:2px;padding:1px 6px;letter-spacing:0.04em"
    >
      RSS
    </a>
  </div>
</footer>
