<script lang="ts">
  interface Props {
    href?: string;
    label?: string;
  }

  const { href = "/", label = "Archive" }: Props = $props();
</script>

<a
  {href}
  class="font-manrope group inline-flex items-center gap-1.5
         text-[13px] font-medium text-[rgba(41,48,45,0.5)]
         transition-colors hover:text-[#386547]"
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    class="transition-transform group-hover:-translate-x-0.5"
  >
    <path
      d="M13 7H1M6 2L1 7l5 5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  {label}
</a>
