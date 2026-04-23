<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    href?: string;
    onclick?: () => void;
    variant?: "primary" | "ghost";
    children: Snippet;
  }

  const { href, onclick, variant = "primary", children }: Props = $props();

  const baseStyle =
    "display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:3px;font-family:inherit;font-size:0.78rem;font-weight:600;cursor:pointer;transition:opacity 0.15s;border:none;text-decoration:none";
  const variantStyle =
    variant === "primary"
      ? "background:var(--accent);color:#fff"
      : "background:transparent;color:var(--text-muted);border:1px solid var(--border)";
</script>

{#if href}
  <a {href} style="{baseStyle};{variantStyle}">{@render children()}</a>
{:else}
  <button {onclick} style="{baseStyle};{variantStyle}"
    >{@render children()}</button
  >
{/if}
