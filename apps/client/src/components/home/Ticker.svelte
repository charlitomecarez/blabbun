<script lang="ts">
  const items = [
    "currently blabbing about → group chats dying",
    "recently realized → finishing things is overrated",
    'pet peeve of the week → "no offense but"',
    "unsolicited opinion → every website has a vibe now",
    "still mad about → sleep score discourse",
    "half-baked theory → ai writing is making people both worse and better",
    "open tabs count → 47 (down from 63)",
  ];

  // Double items for seamless loop
  const doubled = [...items, ...items];
</script>

<div class="ticker-outer" aria-hidden="true">
  <div class="ticker-inner">
    {#each doubled as item, i}
      <span class="ticker-item handwritten">
        {item}
      </span>
      <span class="ticker-sep" aria-hidden="true">✦</span>
    {/each}
  </div>
</div>

<style>
  .ticker-outer {
    border-top: 1.5px dashed var(--border);
    border-bottom: 1.5px dashed var(--border);
    background: var(--bg2);
    margin-left: -32px;
    margin-right: -32px;
    overflow: hidden;
    padding: 8px 0;
    margin-top: 16px;
    margin-bottom: 24px;
  }

  .ticker-inner {
    display: flex;
    gap: 48px;
    white-space: nowrap;
    animation: scroll-x 50s linear infinite;
    width: max-content;
    align-items: center;
  }

  .ticker-item {
    font-size: 1.15rem;
    color: var(--text);
    flex-shrink: 0;
  }

  .ticker-sep {
    color: var(--accent);
    font-size: 1.4rem;
    flex-shrink: 0;
    line-height: 1;
  }
</style>
