<script lang="ts">
  interface Props {
    size?: number;
  }
  const { size = 34 }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 40 40"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="flex-shrink:0"
  aria-hidden="true"
>
  <!-- shadow -->
  <ellipse cx="20" cy="35" rx="11" ry="3" fill="rgba(0,0,0,0.12)" />
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
  <ellipse
    cx="22"
    cy="17"
    rx="1.8"
    ry="0.8"
    fill="rgba(255,255,255,0.25)"
    transform="rotate(25 22 17)"
  />
</svg>
