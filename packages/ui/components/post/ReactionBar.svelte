<script lang="ts">
  interface Props {
    slug: string;
  }
  const { slug }: Props = $props();

  const REACTIONS = [
    { emoji: "🔥", label: "fire" },
    { emoji: "💭", label: "thinking" },
    { emoji: "👀", label: "eyes" },
    { emoji: "💯", label: "100" },
    { emoji: "😭", label: "crying" },
  ];

  function storageKey(label: string) {
    return `bb-reaction-${slug}-${label}`;
  }

  let counts = $state<Record<string, number>>({});
  let mine = $state<string | null>(null);
  let mounted = $state(false);

  $effect(() => {
    const c: Record<string, number> = {};
    for (const r of REACTIONS) {
      const raw = localStorage.getItem(storageKey(r.label));
      c[r.label] = raw ? parseInt(raw, 10) : 0;
    }
    counts = c;
    mine = localStorage.getItem(`bb-reaction-mine-${slug}`);
    mounted = true;
  });

  function react(label: string) {
    if (!mounted) return;
    const prev = mine;
    if (prev === label) {
      const n = Math.max(0, (counts[label] ?? 1) - 1);
      localStorage.setItem(storageKey(label), String(n));
      localStorage.removeItem(`bb-reaction-mine-${slug}`);
      counts = { ...counts, [label]: n };
      mine = null;
    } else {
      if (prev) {
        const n = Math.max(0, (counts[prev] ?? 1) - 1);
        localStorage.setItem(storageKey(prev), String(n));
        counts = { ...counts, [prev]: n };
      }
      const n = (counts[label] ?? 0) + 1;
      localStorage.setItem(storageKey(label), String(n));
      localStorage.setItem(`bb-reaction-mine-${slug}`, label);
      counts = { ...counts, [label]: n };
      mine = label;
    }
  }
</script>

{#if mounted}
  <div
    style="display:flex;gap:8px;flex-wrap:wrap;padding:16px 0;border-top:1px solid var(--divider);border-bottom:1px solid var(--divider);margin:28px 0"
  >
    {#each REACTIONS as r}
      {@const active = mine === r.label}
      <button
        type="button"
        onclick={() => react(r.label)}
        aria-label={`React with ${r.label}`}
        style="
          display:inline-flex;align-items:center;gap:5px;
          padding:5px 10px;border-radius:20px;font-family:inherit;font-size:0.78rem;
          cursor:pointer;transition:all 0.15s;
          background:{active ? 'var(--accent-soft)' : 'var(--bg2)'};
          border:1px solid {active ? 'var(--accent)' : 'var(--border)'};
          color:{active ? 'var(--accent)' : 'var(--muted)'};
        "
      >
        <span>{r.emoji}</span>
        {#if counts[r.label] > 0}
          <span style="font-size:0.7rem">{counts[r.label]}</span>
        {/if}
      </button>
    {/each}
  </div>
{/if}
