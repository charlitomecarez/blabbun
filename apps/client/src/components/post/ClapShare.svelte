<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    postSlug: string;
    postUrl: string;
    postTitle: string;
  }

  const { postSlug, postUrl, postTitle }: Props = $props();

  const SEED = 12;
  // svelte-ignore state_referenced_locally
  const storageKey = `clap_${postSlug}`;

  let count = $state(SEED);
  let clapped = $state(false);
  let animating = $state(false);
  let copied = $state(false);
  let clapTimer: ReturnType<typeof setTimeout> | undefined;
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { count: number; clapped: boolean };
        count = parsed.count;
        clapped = parsed.clapped;
      }
    } catch {
      // localStorage unavailable — use defaults
    }
    return () => {
      clearTimeout(clapTimer);
      clearTimeout(copyTimer);
    };
  });

  function saveToStorage() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ count, clapped }));
    } catch {
      // ignore
    }
  }

  function handleClap() {
    const nowClapped = !clapped;
    clapped = nowClapped;
    count = nowClapped ? count + 1 : count - 1;
    animating = true;
    saveToStorage();
    clearTimeout(clapTimer);
    clapTimer = setTimeout(() => (animating = false), 200);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = false), 2000);
    } catch {
      // clipboard not available
    }
  }

  const fbUrl = $derived(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
  );
  const xUrl = $derived(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`
  );
</script>

<div
  class="mx-auto max-w-[760px] border-t-2 border-[#c5f7d0] px-4 pt-10 pb-12 text-center md:px-8"
>
  <!-- Clap button -->
  <button
    type="button"
    onclick={handleClap}
    aria-pressed={clapped}
    aria-label={clapped ? "Remove clap" : "Clap for this post"}
    class="font-manrope mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-6 py-3 text-[15px] font-bold text-[#386547] transition-transform duration-150"
    class:bg-[#c5f7d0]={clapped}
    class:bg-[#ebf3ed]={!clapped}
    class:scale-[1.15]={animating}
    class:scale-100={!animating}
  >
    <span style="font-size:20px;" aria-hidden="true">👏</span>
    <span>Clap · {count}</span>
  </button>

  <!-- Share label -->
  <p
    class="font-manrope mb-3 text-[11px] font-bold tracking-[0.12em] text-[rgba(41,48,45,0.4)] uppercase"
  >
    Share this post
  </p>

  <!-- Share icons -->
  <div class="flex items-center justify-center gap-3">
    <!-- Facebook -->
    <a
      href={fbUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on Facebook"
      class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#ebf3ed] text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
        />
      </svg>
    </a>

    <!-- X / Twitter -->
    <a
      href={xUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on X"
      class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#ebf3ed] text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    </a>

    <!-- Copy Link -->
    <button
      type="button"
      onclick={copyLink}
      aria-label="Copy link"
      class="font-manrope flex h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-full border-none bg-[#ebf3ed] px-4 text-[12px] font-bold text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      {#if copied}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg
        >
        Copied!
      {:else}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
          ><path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          /><path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          /></svg
        >
        Copy link
      {/if}
    </button>
  </div>
</div>
