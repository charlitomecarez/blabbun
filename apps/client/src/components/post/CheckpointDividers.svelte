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
    const container = document.querySelector(".post-content");
    if (!container) return;

    const h2s = Array.from(container.querySelectorAll("h2")) as HTMLElement[];
    const injected: HTMLElement[] = [];

    function makeDivider(i: number): HTMLElement {
      const div = document.createElement("div");
      div.className = "checkpoint-divider";
      div.setAttribute("aria-hidden", "true");
      div.setAttribute("data-testid", "checkpoint-divider");
      const msg = document.createElement("span");
      msg.className = "checkpoint-message";
      msg.textContent = MESSAGES[i % MESSAGES.length];
      div.appendChild(msg);
      return div;
    }

    if (h2s.length > 0) {
      // Inject before each h2 heading
      h2s.forEach((h2, i) => {
        const div = makeDivider(i);
        h2.parentElement?.insertBefore(div, h2);
        injected.push(div);
      });
    } else {
      // No headings: inject after every 4th paragraph
      const paras = Array.from(
        container.querySelectorAll("p")
      ) as HTMLElement[];
      paras.forEach((p, i) => {
        if ((i + 1) % 4 === 0) {
          const div = makeDivider(Math.floor(i / 4));
          p.parentElement?.insertBefore(div, p.nextSibling);
          injected.push(div);
        }
      });
    }

    if (!injected.length) return;

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

  @media (prefers-reduced-motion: reduce) {
    :global(.checkpoint-divider) {
      transition: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
