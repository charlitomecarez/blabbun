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

  <button
    type="submit"
    class="submit-btn"
    disabled={submitting}
    style="opacity: {submitting ? '0.6' : '1'}"
  >
    {submitting ? "posting…" : "post anonymously"}
  </button>
</form>

<style>
  .form-wrap {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--divider);
  }

  .form-label {
    font-size: 0.7rem;
    color: var(--muted);
    margin-bottom: 12px;
    letter-spacing: 0.04em;
  }

  .form-name {
    color: var(--accent);
  }

  .form-error {
    font-size: 0.7rem;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .form-success {
    font-size: 0.7rem;
    color: #3a8c5a;
    margin-bottom: 8px;
  }

  .form-textarea {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 10px 12px;
    font-size: 0.8rem;
    color: var(--text);
    width: 100%;
    outline: none;
    resize: vertical;
    font-family: inherit;
    line-height: 1.6;
    margin-bottom: 10px;
    display: block;
  }

  .submit-btn {
    background: var(--accent);
    border: none;
    border-radius: 3px;
    padding: 9px 20px;
    font-size: 0.74rem;
    font-family: inherit;
    color: #fff;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: opacity 0.15s;
  }
</style>
