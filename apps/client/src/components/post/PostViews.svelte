<script lang="ts">
  import { onMount } from "svelte";

  const { slug }: { slug: string } = $props();

  let count = $state<number | null>(null);

  onMount(async () => {
    try {
      const res = await fetch(`/api/views/${slug}`, { method: "POST" });
      const data = (await res.json()) as { count?: number };
      count = data.count ?? null;
    } catch {
      // silently fail — views are non-critical
    }
  });
</script>

{#if count !== null}
  <span class="views-badge" aria-label="{count} views">
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style="display:inline-block;vertical-align:middle;margin-right:3px;margin-top:-1px"
    >
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
    </svg>{count.toLocaleString()} views
  </span>
{/if}

<style>
  .views-badge {
    font-size: 0.65rem;
    color: var(--muted2);
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
  }
</style>
