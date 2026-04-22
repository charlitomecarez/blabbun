<script lang="ts">
  let email = $state("");
  let submitting = $state(false);
  let submitted = $state(false);
  let error = $state<string | null>(null);
  let successTimer: ReturnType<typeof setTimeout> | undefined;

  async function handleSubmit() {
    if (!email.trim() || submitting) return;

    submitting = true;
    error = null;

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to subscribe");
      }

      submitted = true;
      email = "";
      clearTimeout(successTimer);
      successTimer = setTimeout(() => (submitted = false), 3000);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to subscribe";
    } finally {
      submitting = false;
    }
  }
</script>

<div
  class="mx-auto max-w-[760px] border-t-2 border-[#c5f7d0] px-4 pt-10 pb-12 md:px-8"
>
  <p
    class="font-manrope mb-4 text-[11px] font-bold tracking-[0.12em] text-[rgba(41,48,45,0.5)] uppercase"
  >
    Subscribe to our newsletter
  </p>

  {#if error}
    <p class="font-manrope mb-4 text-[14px] text-red-500">{error}</p>
  {/if}

  {#if submitted}
    <p class="font-manrope mb-4 text-[14px] text-green-600">
      ✓ Successfully subscribed! Check your email for updates.
    </p>
  {:else}
    <div class="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        bind:value={email}
        placeholder="Enter your email"
        aria-label="Email address"
        disabled={submitting}
        class="font-manrope flex-1 rounded-[8px] border-[1.5px] border-[rgba(197,247,208,0.8)] bg-white px-3.5 py-3 text-[14px] text-[#29302d] placeholder-[rgba(41,48,45,0.35)] outline-none focus:border-[#386547] disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="button"
        onclick={handleSubmit}
        disabled={!email.trim() || submitting}
        class="font-manrope cursor-pointer rounded-[8px] bg-[#386547] px-6 py-3 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Subscribing…" : "Subscribe"}
      </button>
    </div>
  {/if}
</div>
