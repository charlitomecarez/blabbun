<script lang="ts">
  import { EmailInput } from "@thelunan/ui/components/inputs";

  let email = $state("");
  let submitted = $state(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (email.trim()) submitted = true;
  }
</script>

<section class="border-y border-[rgba(197,247,208,0.4)] bg-[#ebf3ed]">
  <div
    class="mx-auto grid max-w-[1200px] grid-cols-1 gap-10
           px-4 py-14 md:grid-cols-2 md:gap-16 md:px-8 md:py-16"
  >
    <!-- Col 1: description -->
    <div class="flex flex-col justify-center gap-4">
      <span
        class="font-manrope text-[11px] font-bold tracking-[0.2em]
               text-[rgba(41,48,45,0.4)] uppercase"
      >
        Newsletter
      </span>
      <h2
        class="font-space-grotesk text-[26px] leading-[1.15] font-bold
               tracking-[-0.04em] text-[#29302d] sm:text-[30px] md:text-[34px]"
      >
        Stay in the room.
      </h2>
      <p
        class="font-manrope max-w-[400px] text-[15px] leading-[1.7]
               text-[rgba(41,48,45,0.6)]"
      >
        No strict structure, no fixed niche — just whatever's currently
        occupying space in the head, straight to your inbox.
      </p>
    </div>

    <!-- Col 2: form or confirmation -->
    <div class="flex flex-col justify-center">
      {#if submitted}
        <div class="flex flex-col gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center
                   rounded-full bg-[#c5f7d0]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 9l4.5 4.5L15 5"
                stroke="#386547"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p
            class="font-space-grotesk text-[18px] font-bold
                   tracking-[-0.03em] text-[#29302d]"
          >
            You're in.
          </p>
          <p class="font-manrope text-[14px] text-[rgba(41,48,45,0.55)]">
            Thoughts will find their way to you when there's something worth
            saying.
          </p>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="flex flex-col gap-4">
          <label
            for="newsletter-email"
            class="font-manrope text-[13px] font-medium text-[rgba(41,48,45,0.55)]"
          >
            Your email address
          </label>

          <div
            class="flex items-stretch overflow-hidden rounded-[10px]
                   border border-[rgba(56,101,71,0.2)] bg-white
                   transition-all focus-within:border-[#386547]
                   focus-within:ring-2 focus-within:ring-[rgba(197,247,208,0.5)]"
          >
            <div class="flex-1 px-1">
              <EmailInput
                bind:value={email}
                placeholder="you@example.com"
                required
                class="w-full px-3 py-3 text-[15px] tracking-normal
                       normal-case placeholder:tracking-normal
                       placeholder:text-[rgba(41,48,45,0.35)] placeholder:normal-case"
              />
            </div>
            <button
              type="submit"
              class="font-manrope m-1.5 shrink-0 rounded-[7px] bg-[#386547] px-5
                     py-2.5 text-[13px] font-bold text-[#ccffd8]
                     transition-colors hover:bg-[#2d5a3d]"
            >
              Subscribe
            </button>
          </div>

          <p class="font-manrope text-[12px] text-[rgba(41,48,45,0.4)]">
            No spam. Unsubscribe any time.
          </p>
        </form>
      {/if}
    </div>
  </div>
</section>
