<script lang="ts">
  interface Props {
    /** The commenter's generated anonymous display name (shown as a hint). */
    yourName: string;
    /** Called by the parent orchestrator with the trimmed comment body. Throws on failure. */
    onSubmit: (body: string) => Promise<void>;
  }

  const { yourName, onSubmit }: Props = $props();

  let text = $state("");
  let err = $state("");
  let posted = $state(false);
  let submitting = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!text.trim()) {
      err = "say something first";
      return;
    }
    submitting = true;
    err = "";
    try {
      await onSubmit(text.trim());
      text = "";
      posted = true;
      setTimeout(() => (posted = false), 2000);
    } catch {
      err = "couldn't post, try again";
    } finally {
      submitting = false;
    }
  }
</script>

<form class="form-wrap" onsubmit={handleSubmit}>
  <div class="form-label">
    leave a comment — you'll be anonymous
    <span class="form-name">({yourName})</span>
  </div>

  {#if err}
    <div class="form-error">! {err}</div>
  {/if}
  {#if posted}
    <div class="form-success">posted!</div>
  {/if}

  <textarea
    bind:value={text}
    class="form-textarea"
    placeholder="what do you think..."
    rows={3}
    aria-label="Comment text"
  ></textarea>

  <button type="submit" class="submit-btn" disabled={submitting}>
    {submitting ? "posting…" : "post anonymously"}
  </button>
</form>
