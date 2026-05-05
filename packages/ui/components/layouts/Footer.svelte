<script lang="ts">
  export let wordCount: number = 0;
</script>

<footer
  style="max-width:680px;width:100%;margin:auto auto 0;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--divider);padding:22px 32px"
>
  <!-- left -->
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

  <!-- right links -->
  <div style="display:flex;gap:16px;align-items:center">
    <a
      href="/about"
      style="font-size:0.68rem;color:var(--muted);text-decoration:underline;text-decoration-color:var(--border)"
      >about</a
    >
    <a
      href="/now"
      style="font-size:0.68rem;color:var(--muted);text-decoration:underline;text-decoration-color:var(--border)"
      >/now</a
    >
    <a
      href="/terms"
      style="font-size:0.68rem;color:var(--muted);text-decoration:underline;text-decoration-color:var(--border)"
      >terms</a
    >
    <a
      href="/rss.xml"
      style="font-size:0.64rem;color:var(--accent);text-decoration:none;border:1px solid var(--accent);border-radius:2px;padding:1px 6px;letter-spacing:0.04em"
      >RSS</a
    >
  </div>
</footer>
