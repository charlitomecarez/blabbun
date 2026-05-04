<script lang="ts">
  const MAX_IMAGES = 3;
  const MAX_BYTES = 5 * 1024 * 1024;

  interface Preview {
    file: File;
    url: string;
  }

  let title = $state("");
  let description = $state("");
  let pageUrl = $state("");
  let reporterEmail = $state("");
  let previews = $state<Preview[]>([]);
  let status = $state<"idle" | "loading" | "success" | "error">("idle");
  let errorMsg = $state("");

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const incoming = Array.from(input.files ?? []);
    const remaining = MAX_IMAGES - previews.length;
    const toAdd = incoming.slice(0, remaining);

    for (const file of toAdd) {
      if (file.size > MAX_BYTES) {
        errorMsg = `"${file.name}" is over 5 MB — please compress it first.`;
        input.value = "";
        return;
      }
      previews = [...previews, { file, url: URL.createObjectURL(file) }];
    }
    input.value = "";
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index].url);
    previews = previews.filter((_, i) => i !== index);
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (status === "loading") return;

    errorMsg = "";
    status = "loading";

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    if (pageUrl.trim()) fd.append("url", pageUrl.trim());
    if (reporterEmail.trim()) fd.append("reporter_email", reporterEmail.trim());
    previews.forEach((p) => fd.append("images", p.file));

    try {
      const res = await fetch("/api/report", { method: "POST", body: fd });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        errorMsg = json.error ?? "something went wrong.";
        status = "error";
      } else {
        status = "success";
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        previews = [];
        title = "";
        description = "";
        pageUrl = "";
        reporterEmail = "";
      }
    } catch {
      errorMsg = "network error — check your connection and try again.";
      status = "error";
    }
  }
</script>

{#if status === "success"}
  <div class="success-box">
    <p class="success-title">report received.</p>
    <p class="success-sub">thanks for flagging this — i'll take a look.</p>
    <button class="link-btn" onclick={() => (status = "idle")}
      >send another</button
    >
  </div>
{:else}
  <form onsubmit={submit} class="form">
    <!-- Title -->
    <div class="field">
      <label class="label" for="issue-title"
        >what's the issue? <span class="req">*</span></label
      >
      <input
        id="issue-title"
        class="input"
        type="text"
        bind:value={title}
        placeholder="brief summary"
        maxlength="150"
        required
        disabled={status === "loading"}
      />
    </div>

    <!-- Description -->
    <div class="field">
      <label class="label" for="issue-desc"
        >describe it <span class="req">*</span></label
      >
      <textarea
        id="issue-desc"
        class="input textarea"
        bind:value={description}
        placeholder="steps to reproduce, what you expected vs. what happened, anything useful…"
        rows="5"
        maxlength="5000"
        required
        disabled={status === "loading"}
      ></textarea>
    </div>

    <!-- Page URL -->
    <div class="field">
      <label class="label" for="issue-url"
        >page it happened on <span class="optional">(optional)</span></label
      >
      <input
        id="issue-url"
        class="input"
        type="url"
        bind:value={pageUrl}
        placeholder="https://blabbun.com/…"
        disabled={status === "loading"}
      />
    </div>

    <!-- Reporter email -->
    <div class="field">
      <label class="label" for="issue-email"
        >your email <span class="optional">(optional — for follow-up)</span
        ></label
      >
      <input
        id="issue-email"
        class="input"
        type="email"
        bind:value={reporterEmail}
        placeholder="you@example.com"
        disabled={status === "loading"}
      />
    </div>

    <!-- Image upload -->
    <div class="field">
      <span class="label"
        >screenshots <span class="optional"
          >(up to {MAX_IMAGES}, 5 MB each)</span
        ></span
      >

      {#if previews.length > 0}
        <div class="previews">
          {#each previews as p, i}
            <div class="preview-item">
              <img src={p.url} alt={p.file.name} class="preview-img" />
              <button
                type="button"
                class="remove-btn"
                onclick={() => removeImage(i)}
                aria-label="Remove image"
                disabled={status === "loading"}>✕</button
              >
            </div>
          {/each}
        </div>
      {/if}

      {#if previews.length < MAX_IMAGES}
        <label class="upload-label" class:disabled={status === "loading"}>
          <span>+ add image</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onchange={onFileChange}
            disabled={status === "loading"}
            class="sr-only"
          />
        </label>
      {/if}
    </div>

    {#if status === "error" && errorMsg}
      <p class="error-msg">{errorMsg}</p>
    {/if}

    <button
      type="submit"
      class="submit-btn"
      disabled={status === "loading" || !title.trim() || !description.trim()}
    >
      {status === "loading" ? "sending…" : "send report"}
    </button>
  </form>
{/if}

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 540px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .req {
    color: var(--accent);
  }

  .optional {
    text-transform: none;
    letter-spacing: 0;
    color: var(--muted2);
    font-size: 0.68rem;
  }

  .input {
    background: var(--input-bg, var(--bg2));
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 8px 10px;
    font-size: 0.82rem;
    font-family: inherit;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    box-sizing: border-box;
  }

  .input:focus {
    border-color: var(--accent);
  }

  .input:disabled {
    opacity: 0.5;
  }

  .textarea {
    resize: vertical;
    min-height: 110px;
    line-height: 1.7;
  }

  /* Image previews */
  .previews {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 6px;
  }

  .preview-item {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(0, 0, 0, 0.55);
    border: none;
    color: #fff;
    font-size: 0.6rem;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
  }

  .upload-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 0.74rem;
    color: var(--accent);
    border: 1px dashed var(--border);
    border-radius: 3px;
    padding: 7px 14px;
    transition: border-color 0.15s;
    width: fit-content;
  }

  .upload-label:hover {
    border-color: var(--accent);
  }

  .upload-label.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .error-msg {
    font-size: 0.76rem;
    color: #c0392b;
    margin: 0;
  }

  .submit-btn {
    align-self: flex-start;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 9px 22px;
    font-size: 0.78rem;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: opacity 0.15s;
  }

  .submit-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }

  /* Success state */
  .success-box {
    padding: 28px 0;
    border-top: 1px solid var(--divider);
  }

  .success-title {
    font-size: 0.93rem;
    font-weight: 500;
    color: var(--text);
    margin: 0 0 6px;
  }

  .success-sub {
    font-size: 0.8rem;
    color: var(--muted);
    margin: 0 0 16px;
    line-height: 1.7;
  }

  .link-btn {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.76rem;
    font-family: inherit;
    cursor: pointer;
    padding: 0;
  }
</style>
