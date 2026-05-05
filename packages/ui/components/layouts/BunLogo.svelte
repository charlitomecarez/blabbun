<script lang="ts">
  interface Props {
    size?: number;
    interactive?: boolean;
  }
  const { size = 34, interactive = true }: Props = $props();

  let svgEl = $state<SVGSVGElement | null>(null);
  let pupilX = $state(0);
  let pupilY = $state(0);
  let blinking = $state(false);
  let bouncing = $state(false);

  $effect(() => {
    if (!interactive) return;
    function track(e: MouseEvent) {
      if (!svgEl) return;
      const r = svgEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = 1.1;
      pupilX = dist ? (dx / dist) * Math.min(max, dist / 80) : 0;
      pupilY = dist ? (dy / dist) * Math.min(max, dist / 80) : 0;
    }
    window.addEventListener("mousemove", track);
    return () => window.removeEventListener("mousemove", track);
  });

  $effect(() => {
    if (!interactive) return;
    let t: ReturnType<typeof setTimeout>;
    function loop() {
      blinking = true;
      setTimeout(() => (blinking = false), 140);
      t = setTimeout(loop, 2500 + Math.random() * 4000);
    }
    t = setTimeout(loop, 2000);
    return () => clearTimeout(t);
  });

  function poke() {
    bouncing = true;
    setTimeout(() => (bouncing = false), 400);
  }
</script>

<svg
  bind:this={svgEl}
  width={size}
  height={size}
  viewBox="0 0 40 40"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="flex-shrink:0; cursor:{interactive
    ? 'pointer'
    : 'default'}; transition: transform 0.15s; transform: {bouncing
    ? 'translateY(-4px) scale(1.08)'
    : 'none'};"
  aria-hidden="true"
  onclick={poke}
  role={interactive ? "img" : undefined}
>
  <!-- shadow -->
  <ellipse cx="20" cy="35" rx="11" ry="3" fill="rgba(0,0,0,0.1)" />
  <!-- bun bottom -->
  <ellipse cx="20" cy="27" rx="14" ry="6" fill="#A86520" />
  <!-- bun dome -->
  <ellipse cx="20" cy="19" rx="14" ry="13" fill="#D4952A" />
  <!-- highlight -->
  <ellipse cx="14" cy="13" rx="5" ry="3.5" fill="rgba(255,255,255,0.22)" />
  <!-- sesame seeds -->
  <ellipse
    cx="20"
    cy="10"
    rx="2"
    ry="0.9"
    fill="rgba(255,255,255,0.35)"
    transform="rotate(-20 20 10)"
  />
  <ellipse
    cx="25"
    cy="13"
    rx="2"
    ry="0.9"
    fill="rgba(255,255,255,0.3)"
    transform="rotate(15 25 13)"
  />
  <ellipse
    cx="15"
    cy="14"
    rx="2"
    ry="0.9"
    fill="rgba(255,255,255,0.28)"
    transform="rotate(-10 15 14)"
  />
  <!-- eye whites -->
  <ellipse
    cx="15.5"
    cy="20"
    rx="2.4"
    ry="2.4"
    fill="#fff"
    style="transform-origin: 15.5px 20px; transform: scaleY({blinking
      ? 0.1
      : 1}); transition: transform 0.07s;"
  />
  <ellipse
    cx="24.5"
    cy="20"
    rx="2.4"
    ry="2.4"
    fill="#fff"
    style="transform-origin: 24.5px 20px; transform: scaleY({blinking
      ? 0.1
      : 1}); transition: transform 0.07s;"
  />
  <!-- pupils -->
  {#if !blinking}
    <circle cx={15.5 + pupilX} cy={20 + pupilY} r="1.4" fill="#3a1a08" />
    <circle cx={24.5 + pupilX} cy={20 + pupilY} r="1.4" fill="#3a1a08" />
    <!-- pupil highlights -->
    <circle
      cx={15.5 + pupilX + 0.4}
      cy={20 + pupilY - 0.4}
      r="0.5"
      fill="rgba(255,255,255,0.8)"
    />
    <circle
      cx={24.5 + pupilX + 0.4}
      cy={20 + pupilY - 0.4}
      r="0.5"
      fill="rgba(255,255,255,0.8)"
    />
  {/if}
  <!-- blush -->
  <ellipse cx="12" cy="23" rx="2.8" ry="1.6" fill="rgba(210,90,70,0.28)" />
  <ellipse cx="28" cy="23" rx="2.8" ry="1.6" fill="rgba(210,90,70,0.28)" />
  <!-- smile -->
  <path
    d="M14.5 24.5 Q20 28.5 25.5 24.5"
    stroke="#5C3010"
    stroke-width="1.6"
    fill="none"
    stroke-linecap="round"
  />
  <!-- speech bubble -->
  <rect x="26" y="4" width="12" height="8" rx="3" fill="#D4952A" />
  <!-- bubble tail -->
  <path d="M28 12 L26 15 L31 12" fill="#D4952A" />
  <!-- dots in bubble -->
  <circle cx="29" cy="8" r="1" fill="white" />
  <circle cx="32" cy="8" r="1" fill="white" />
  <circle cx="35" cy="8" r="1" fill="white" />
</svg>
