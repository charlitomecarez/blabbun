<script lang="ts">
  export let wordCount: number = 0;
</script>

<div style="max-width:680px;width:100%;margin:0 auto">
  <!-- Hand-drawn SVG wave replaces the straight border-top -->
  <svg
    width="100%"
    height="12"
    viewBox="0 0 680 12"
    preserveAspectRatio="none"
    aria-hidden="true"
    style="display:block"
  >
    <path
      d="M0 7 Q 50 2, 100 7 T 200 7 T 300 7 T 400 7 T 500 7 T 600 7 T 680 7"
      stroke="var(--divider)"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
    />
  </svg>

  <footer class="footer-inner">
    <!-- left -->
    <div>
      <span class="footer-tagline">thoughts, unfiltered.</span>
      {#if wordCount > 0}
        <div style="font-size:0.62rem;color:var(--muted2);margin-top:3px">
          {wordCount.toLocaleString()} words blabbed so far
        </div>
      {/if}
    </div>

    <!-- right links -->
    <div style="display:flex;gap:16px;align-items:center">
      <a href="/about" class="footer-link">about</a>
      <a href="/now" class="footer-link">/now</a>
      <a href="/terms" class="footer-link">terms</a>
      <a
        href="/rss.xml"
        style="font-size:0.64rem;color:var(--accent);text-decoration:none;border:1px solid var(--accent);border-radius:2px;padding:1px 6px;letter-spacing:0.04em;transition:background 0.15s"
        class="footer-rss">RSS</a
      >
    </div>
  </footer>
</div>

<style>
  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 32px 22px;
  }

  .footer-tagline {
    font-family: "Caveat", cursive;
    font-size: 1.15rem;
    color: var(--accent);
    letter-spacing: 0.01em;
    display: inline-block;
    transform: rotate(-0.5deg);
  }

  .footer-link {
    font-size: 0.68rem;
    color: var(--muted);
    text-decoration: none;
    position: relative;
    padding-bottom: 2px;
    transition: color 0.15s;
  }
  .footer-link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.18s ease;
  }
  .footer-link:hover {
    color: var(--accent);
  }
  .footer-link:hover::after {
    transform: scaleX(1);
  }

  .footer-rss:hover {
    background: var(--accent-soft);
  }
</style>
