<script lang="ts">
  interface Props {
    href?: string;
    label?: string;
  }

  const { href = "/", label = "← back" }: Props = $props();
</script>

<a {href} class="inline-block text-sm text-gray-400 hover:text-gray-900 transition-colors">
  {label}
</a>
