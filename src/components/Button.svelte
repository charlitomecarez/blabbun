<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    href?: string;
    onclick?: () => void;
    variant?: "primary" | "ghost";
    children: Snippet;
  }

  const { href, onclick, variant = "primary", children }: Props = $props();

  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-700",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  };

  // svelte-ignore state_referenced_locally
    const classes = `${base} ${variants[variant]}`;
</script>

{#if href}
  <a {href} class={classes}>{@render children()}</a>
{:else}
  <button {onclick} class={classes}>{@render children()}</button>
{/if}
