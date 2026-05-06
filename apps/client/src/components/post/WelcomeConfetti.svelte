<script lang="ts">
  import confetti from "canvas-confetti";

  $effect(() => {
    // Small delay so the page is visible before confetti fires
    const t = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#f97316", "#fb923c", "#fdba74", "#fff7ed", "#c2410c"],
        scalar: 0.9,
      });

      // Second burst offset slightly
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { x: 0.2, y: 0.6 },
          colors: ["#f97316", "#fb923c", "#fdba74"],
          scalar: 0.8,
          angle: 60,
        });
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { x: 0.8, y: 0.6 },
          colors: ["#f97316", "#fb923c", "#fdba74"],
          scalar: 0.8,
          angle: 120,
        });
      }, 350);
    }, 600);

    return () => clearTimeout(t);
  });
</script>
