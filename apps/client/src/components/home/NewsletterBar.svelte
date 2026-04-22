<script lang="ts">
  import { EmailInput } from "@thelunan/ui/components/inputs";

  let email = $state("");
  let status = $state<"idle" | "loading" | "success" | "error">("idle");
  let errorMsg = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    status = "loading";
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        errorMsg = data.error ?? "Something went wrong.";
        status = "error";
      } else {
        status = "success";
      }
    } catch {
      errorMsg = "Could not connect. Try again.";
      status = "error";
    }
  }
</script>

<section class="relative overflow-hidden bg-[#1a2e22]">
  <!-- decorative circles -->
  <div
    class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[rgba(197,247,208,0.06)]"
  ></div>
  <div
    class="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[rgba(204,240,95,0.05)]"
  ></div>

  <div
    class="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 md:gap-20 md:px-8 md:py-16"
  >
    <!-- Col 1: copy -->
    <div class="flex flex-col justify-center gap-4">
      <span
        class="font-manrope inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(197,247,208,0.15)] px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[rgba(197,247,208,0.5)] uppercase"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[#ccf05f]"></span>
        Newsletter
      </span>
      <h2
        class="font-space-grotesk text-[28px] leading-[1.1] font-bold tracking-[-0.04em] text-white sm:text-[34px] md:text-[38px]"
      >
        Stay in the room.
      </h2>
      <p
        class="font-manrope max-w-[380px] text-[15px] leading-[1.7] text-[rgba(197,247,208,0.55)]"
      >
        No strict structure, no fixed niche — just whatever's currently
        occupying space in the head, straight to your inbox.
      </p>
    </div>

    <!-- Col 2: form / states -->
    <div class="flex flex-col justify-center">
      {#if status === "success"}
        <div class="flex flex-col gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-[#ccf05f]"
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
                stroke="#1a2e22"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p
            class="font-space-grotesk text-[20px] font-bold tracking-[-0.03em] text-white"
          >
            You're in.
          </p>
          <p class="font-manrope text-[14px] text-[rgba(197,247,208,0.55)]">
            Thoughts will find their way to you when there's something worth
            saying.
          </p>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="flex flex-col gap-4">
          <label
            for="newsletter-email"
            class="font-manrope text-[13px] font-medium text-[rgba(197,247,208,0.5)]"
          >
            Your email address
          </label>

          <div
            class="flex items-stretch overflow-hidden rounded-[10px] border border-[rgba(197,247,208,0.12)] bg-[rgba(197,247,208,0.06)] transition-all focus-within:border-[rgba(197,247,208,0.3)] focus-within:bg-[rgba(197,247,208,0.09)]"
          >
            <div class="flex-1 px-1">
              <EmailInput
                bind:value={email}
                placeholder="you@example.com"
                required
                class="w-full bg-transparent px-3 py-3 text-[15px] tracking-normal text-white normal-case placeholder:tracking-normal placeholder:text-[rgba(197,247,208,0.3)] placeholder:normal-case"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              class="font-manrope m-1.5 shrink-0 rounded-[7px] bg-[#ccf05f] px-5 py-2.5 text-[13px] font-bold text-[#1a2e22] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "…" : "Subscribe"}
            </button>
          </div>

          {#if status === "error"}
            <p class="font-manrope text-[12px] text-red-400">{errorMsg}</p>
          {:else}
            <p class="font-manrope text-[12px] text-[rgba(197,247,208,0.3)]">
              No spam. Unsubscribe any time.
            </p>
          {/if}
        </form>
      {/if}
    </div>
  </div>
</section>
