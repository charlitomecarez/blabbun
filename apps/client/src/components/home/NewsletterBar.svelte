<script lang="ts">
  import { EmailInput } from "@openblobs/ui/components/inputs";

  // Simple local state — wire to a real API endpoint when ready
  let email = $state("");
  let submitted = $state(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (email.trim()) submitted = true;
  }
</script>

<!--
  Full-width newsletter signup bar.
  Sits between Hero and Featured Post on the homepage.
-->
<section
  class="flex
         flex-wrap items-center justify-center
         gap-12 border-t
         border-b border-[rgba(173,179,180,0.1)] bg-[#f2f4f4] px-12 py-12"
>
  <!-- Left: heading + description -->
  <div class="max-w-[407px]">
    <h2
      class="font-space-grotesk mb-2 text-2xl
             font-bold tracking-[-0.05em] text-[#2d3435] uppercase"
    >
      TECHNICAL DISPATCHES
    </h2>
    <p
      class="font-inter text-sm
             leading-5 tracking-[0.1em] text-[#78716c] uppercase"
    >
      RECEIVE ARCHITECTURAL BLUEPRINTS AND DEEP-DIVES DIRECTLY TO YOUR TERMINAL.
    </p>
  </div>

  <!-- Right: email form or confirmation -->
  {#if submitted}
    <p
      class="font-space-grotesk text-sm font-bold
             tracking-[0.1em] text-[#2d5a3d] uppercase"
    >
      YOU'RE IN — DISPATCHES INCOMING.
    </p>
  {:else}
    <!--
      Email input + JOIN button share a single bottom border (green),
      mimicking the Figma HorizontalBorder pattern.
    -->
    <form
      onsubmit={handleSubmit}
      class="flex w-full
             max-w-[448px] items-stretch
             border-b border-[#2d5a3d]"
    >
      <!-- Shared EmailInput from @openblobs/ui -->
      <EmailInput bind:value={email} required />
      <button
        type="submit"
        class="font-space-grotesk px-6
               py-[18px] text-[12px]
               font-bold tracking-[0.2em] text-[#2d3435] uppercase
               transition-colors hover:text-[#2d5a3d]"
      >
        JOIN
      </button>
    </form>
  {/if}
</section>
