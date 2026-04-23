<script lang="ts">
  interface Props {
    value: string;
    placeholder?: string;
    required?: boolean;
    class?: string;
  }

  let {
    value = $bindable(""),
    placeholder = "your@email.com",
    required = false,
    class: extraClass = "",
  }: Props = $props();
</script>

<input
  type="email"
  bind:value
  {placeholder}
  {required}
  style="
    flex:1;background:transparent;border:none;outline:none;
    font-family:inherit;font-size:0.82rem;
    color:var(--text);
  "
  class={extraClass}
/>
