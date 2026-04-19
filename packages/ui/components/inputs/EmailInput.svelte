<script lang="ts">
  interface Props {
    /** Two-way bindable — use `bind:value` from the parent */
    value: string;
    placeholder?: string;
    required?: boolean;
    /** Additional classes forwarded to the <input> element */
    class?: string;
  }

  // `let` (not `const`) is required for $bindable() to allow two-way binding
  let {
    value = $bindable(""),
    placeholder = "EMAIL ADDRESS",
    required = false,
    class: extraClass = "",
  }: Props = $props();
</script>

<!--
  Standalone email input following the openblobs design system.
  Pairs with a submit button inside a shared bottom-border container —
  see NewsletterBar for the full HorizontalBorder pattern.
-->
<input
  type="email"
  bind:value
  {placeholder}
  {required}
  class="font-inter flex-1 bg-transparent px-3 py-[17px]
         text-sm tracking-[0.1em] text-[#2d3435] uppercase
         placeholder:text-[#6b7280] focus:outline-none {extraClass}"
/>
