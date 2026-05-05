<script lang="ts">
  import { BunLogo } from "@blabbun/ui/components/layouts";

  const BLABS = [
    "did you sleep ok?",
    "i had a thought.",
    "okay but hear me out—",
    "no offense but,",
    "anyway.",
    "wait i wasn't done.",
    "this is half-baked.",
    "i'm just saying.",
    "fresh out of the oven.",
  ];

  let blobIndex = $state(0);
  let showBubble = $state(true);

  $effect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setTimeout>;

    function cycle() {
      showBubble = false;
      hideTimer = setTimeout(() => {
        blobIndex = (blobIndex + 1) % BLABS.length;
        showBubble = true;
        cycleTimer = setTimeout(cycle, 3500 + Math.random() * 2000);
      }, 500);
    }

    cycleTimer = setTimeout(cycle, 3500);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(cycleTimer);
    };
  });
</script>

<div class="mascot-wrap" aria-hidden="true">
  <div class="logo-float">
    <BunLogo size={64} interactive={true} />
  </div>
  <div class="bubble-wrap" aria-live="off">
    {#if showBubble}
      <div class="speech-bubble handwritten">
        {BLABS[blobIndex]}
      </div>
    {/if}
  </div>
</div>

<style>
  .mascot-wrap {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
  }

  .logo-float {
    animation: float 3.5s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bubble-wrap {
    position: absolute;
    top: -8px;
    left: 72px;
    width: 160px;
    pointer-events: none;
  }

  .speech-bubble {
    background: var(--bg2);
    border: 1.5px solid var(--text);
    border-radius: 14px;
    box-shadow: 2px 2px 0 var(--text);
    padding: 7px 14px;
    font-size: 1.05rem;
    color: var(--text);
    white-space: nowrap;
    transform: rotate(-2deg);
    animation: fadeSlideIn 0.25s ease;
    position: relative;
  }

  .speech-bubble::before {
    content: "";
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: var(--text);
  }

  .speech-bubble::after {
    content: "";
    position: absolute;
    left: -7px;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: var(--bg2);
  }
</style>
