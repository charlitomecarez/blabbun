<script lang="ts">
  import { onMount } from "svelte";

  const MESSAGES = [
    "✶ still here? respect. ✶",
    "✶ you're still going, love that. ✶",
    "✶ halfway through the blab. ✶",
    "✶ getting to the good part → ✶",
    "✶ almost there. keep going. ✶",
  ];

  onMount(() => {
    const h2s = Array.from(
      document.querySelectorAll(".post-content h2")
    ) as HTMLElement[];
    if (!h2s.length) return;

    const injected: HTMLElement[] = [];

    h2s.forEach((h2, i) => {
      const div = document.createElement("div");
      div.className = "checkpoint-divider";
      div.setAttribute("aria-hidden", "true");
      div.setAttribute("data-testid", "checkpoint-divider");

      const msg = document.createElement("span");
      msg.className = "checkpoint-message";
      msg.textContent = MESSAGES[i % MESSAGES.length];
      div.appendChild(msg);

      h2.parentElement?.insertBefore(div, h2);
      injected.push(div);
    });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      injected.forEach((el) => el.classList.add("visible"));
      return () => injected.forEach((el) => el.remove());
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 }
    );

    injected.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      injected.forEach((el) => el.remove());
    };
  });
</script>

<style>
  :global(.checkpoint-divider) {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 28px 0 10px;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
  }

  :global(.checkpoint-divider.visible) {
    opacity: 1;
    transform: translateY(0);
  }

  :global(.checkpoint-divider::before),
  :global(.checkpoint-divider::after) {
    content: "";
    flex: 1;
    height: 1px;
  }

  :global(.checkpoint-divider::before) {
    background: linear-gradient(
      to right,
      transparent,
      color-mix(in srgb, var(--accent) 35%, transparent)
    );
  }

  :global(.checkpoint-divider::after) {
    background: linear-gradient(
      to left,
      transparent,
      color-mix(in srgb, var(--accent) 35%, transparent)
    );
  }

  :global(.checkpoint-message) {
    font-family: "Caveat", cursive;
    font-size: 0.8rem;
    color: var(--muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
