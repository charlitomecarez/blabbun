<script lang="ts">
  interface Props {
    label?: string;
  }
  const { label }: Props = $props();
</script>

<div class="scribble-div">
  <svg width="80" height="12" viewBox="0 0 80 12" aria-hidden="true">
    <path
      d="M2 6 Q 12 2, 22 6 T 42 6 T 62 6 T 78 6"
      stroke="var(--accent)"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
    />
  </svg>
  {#if label}
    <span class="label handwritten">{label}</span>
  {/if}
  <svg
    width="80"
    height="12"
    viewBox="0 0 80 12"
    style="flex:1"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M2 6 Q 12 2, 22 6 T 42 6 T 62 6 T 78 6"
      stroke="var(--accent)"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
    />
  </svg>
</div>

<style>
  .scribble-div {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 32px 0 20px;
  }

  .label {
    font-size: 1rem;
    color: var(--muted);
    white-space: nowrap;
  }
</style>
