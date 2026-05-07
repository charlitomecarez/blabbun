<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    slug: string;
    title: string;
  }

  const { slug, title }: Props = $props();

  interface SavedQuote {
    text: string;
    slug: string;
    title: string;
    savedAt: string;
  }

  const MIN_CHARS = 10;
  const MAX_CHARS = 280;
  const MAX_QUOTES = 50;

  let visible = $state(false);
  let popoverX = $state(0);
  let popoverY = $state(0); // viewport-relative (used with position:fixed)
  let selectedText = $state("");
  let saveLabel = $state("💬 save quote");
  let shareLabel = $state("✦ share");

  let popoverEl: HTMLDivElement | undefined = $state();

  onMount(() => {
    function onSelectionChange() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        visible = false;
        return;
      }

      const text = selection.toString().trim();
      if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
        visible = false;
        return;
      }

      const range = selection.getRangeAt(0);
      const postContent = document.querySelector(".post-content");
      if (!postContent?.contains(range.commonAncestorContainer)) {
        visible = false;
        return;
      }

      const rect = range.getBoundingClientRect();
      popoverX = rect.left + rect.width / 2;
      popoverY = rect.top - 8; // viewport-relative — works with position:fixed
      selectedText = text;
      visible = true;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && visible) {
        e.stopPropagation(); // prevent history.back() in [slug].astro
        visible = false;
        window.getSelection()?.removeAllRanges();
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (popoverEl && !popoverEl.contains(e.target as Node)) {
        visible = false;
      }
    }

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  });

  function saveQuote() {
    const raw = localStorage.getItem("bb-quotes");
    let quotes: SavedQuote[] = [];
    if (raw) {
      try {
        quotes = JSON.parse(raw) as SavedQuote[];
      } catch {
        quotes = [];
      }
    }
    quotes.push({
      text: selectedText,
      slug,
      title,
      savedAt: new Date().toISOString(),
    });
    if (quotes.length > MAX_QUOTES)
      quotes.splice(0, quotes.length - MAX_QUOTES);
    localStorage.setItem("bb-quotes", JSON.stringify(quotes));
    saveLabel = "✓ saved!";
    setTimeout(() => (saveLabel = "💬 save quote"), 1500);
    visible = false;
    window.getSelection()?.removeAllRanges();
  }

  async function shareQuote() {
    const shareText = `"${selectedText}"\n— blabbun.com/${slug}`;
    try {
      await navigator.clipboard.writeText(shareText);
      shareLabel = "✓ copied!";
      setTimeout(() => (shareLabel = "✦ share"), 1500);
      visible = false;
      window.getSelection()?.removeAllRanges();
    } catch {
      // Clipboard API not available — silently skip
    }
  }
</script>

{#if visible}
  <div
    bind:this={popoverEl}
    class="quote-popover"
    style="left:{popoverX}px;top:{popoverY}px"
    role="toolbar"
    aria-label="Quote actions"
    data-testid="quote-popover"
  >
    <button type="button" class="qp-btn" onclick={saveQuote}>{saveLabel}</button
    >
    <span class="qp-sep" aria-hidden="true">|</span>
    <button type="button" class="qp-btn" onclick={shareQuote}
      >{shareLabel}</button
    >
    <div class="qp-arrow" aria-hidden="true"></div>
  </div>
{/if}

<style>
  .quote-popover {
    position: fixed;
    transform: translate(-50%, -100%);
    background: var(--text);
    color: var(--bg);
    border-radius: 4px;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.68rem;
    white-space: nowrap;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 200;
    animation: qp-in 0.15s ease;
    pointer-events: auto;
  }

  @keyframes qp-in {
    from {
      opacity: 0;
      transform: translate(-50%, calc(-100% + 6px));
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%);
    }
  }

  .qp-btn {
    background: none;
    border: none;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.12s;
  }

  .qp-btn:hover {
    opacity: 0.7;
  }

  .qp-sep {
    opacity: 0.3;
  }

  .qp-arrow {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: var(--text);
  }

  @media (prefers-reduced-motion: reduce) {
    .quote-popover {
      animation: none;
    }
  }
</style>
