<!--

Button that will redirect users to their previous position

-->

<script lang="ts">
  interface Props {
    href?: string;
    label?: string;
  }

  const { href = "/", label = "← back" }: Props = $props();
</script>

<a
  {href}
  class="inline-block text-sm text-gray-400 transition-colors hover:text-gray-900"
>
  {label}
</a>
