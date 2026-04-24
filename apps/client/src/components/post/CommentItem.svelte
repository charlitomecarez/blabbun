<script lang="ts">
  import { relativeTime } from "@blabbun/utils";

  import type { Comment } from "./types";

  interface Props {
    comment: Comment;
    activeReplyId: string | null;
    onReplyToggle: (id: string | null) => void;
    onReplySubmit: (commentId: string, body: string) => Promise<void>;
  }

  const { comment, activeReplyId, onReplyToggle, onReplySubmit }: Props =
    $props();

  let replyBody = $state("");
  const isReplying = $derived(activeReplyId === comment.id);

  function handleReplySubmit() {
    if (!replyBody.trim()) return;
    onReplySubmit(comment.id, replyBody.trim());
    replyBody = "";
  }
</script>

<div class="comment-item">
  <!-- Author + timestamp -->
  <div class="comment-header">
    <span class="comment-author">{comment.anon_name ?? "anonymous"}</span>
    <span class="comment-time">{relativeTime(comment.created_at)}</span>
  </div>

  <!-- Body -->
  <p class="comment-body">{comment.body}</p>

  <!-- Reply toggle -->
  <button
    type="button"
    class="reply-toggle"
    onclick={() => onReplyToggle(isReplying ? null : comment.id)}
  >
    {isReplying ? "↩ cancel" : "↩ reply"}
  </button>

  <!-- Nested replies + inline reply form -->
  {#if comment.replies.length > 0 || isReplying}
    <div class="replies-thread">
      {#each comment.replies as reply (reply.id)}
        <div class="reply-item">
          <div class="comment-header">
            <span class="comment-author">{reply.anon_name ?? "anonymous"}</span>
            <span class="comment-time">{relativeTime(reply.created_at)}</span>
          </div>
          <p class="comment-body reply-body">{reply.body}</p>
        </div>
      {/each}

      {#if isReplying}
        <div class="reply-form">
          <textarea
            bind:value={replyBody}
            class="reply-textarea"
            placeholder="write a reply…"
            rows={2}
            aria-label="Reply text"
          ></textarea>
          <div class="reply-actions">
            <button
              type="button"
              class="reply-submit"
              onclick={handleReplySubmit}
              disabled={!replyBody.trim()}
              style="opacity: {replyBody.trim() ? '1' : '0.4'}"
            >
              post
            </button>
            <button
              type="button"
              class="reply-cancel"
              onclick={() => {
                replyBody = "";
                onReplyToggle(null);
              }}
            >
              cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .comment-item {
    padding: 14px 0;
    border-bottom: 1px solid var(--divider);
  }

  /* ─── Header ──────────────────────────────────────────────── */
  .comment-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
  }

  .comment-author {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--accent);
  }

  .comment-time {
    font-size: 0.65rem;
    color: var(--muted2);
    font-weight: 400;
  }

  /* ─── Body ────────────────────────────────────────────────── */
  .comment-body {
    font-size: 0.84rem;
    line-height: 1.65;
    color: var(--text);
    margin-bottom: 8px;
  }

  .reply-body {
    font-size: 0.8rem;
  }

  /* ─── Reply toggle ────────────────────────────────────────── */
  .reply-toggle {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.7rem;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    letter-spacing: 0.02em;
    transition: color 0.12s;
  }
  .reply-toggle:hover {
    color: var(--accent);
  }

  /* ─── Nested thread ───────────────────────────────────────── */
  .replies-thread {
    margin-top: 10px;
    margin-left: 14px;
    padding-left: 12px;
    border-left: 2px solid var(--accent-soft);
  }

  .reply-item {
    padding: 8px 0;
    border-bottom: 1px solid var(--divider);
  }

  /* ─── Inline reply form ───────────────────────────────────── */
  .reply-form {
    padding-top: 10px;
  }

  .reply-textarea {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 8px 10px;
    font-size: 0.78rem;
    color: var(--text);
    width: 100%;
    outline: none;
    resize: none;
    font-family: inherit;
    line-height: 1.6;
    display: block;
  }

  .reply-actions {
    margin-top: 6px;
    display: flex;
    gap: 8px;
  }

  .reply-submit {
    background: var(--accent);
    border: none;
    border-radius: 3px;
    padding: 7px 16px;
    font-size: 0.72rem;
    font-family: inherit;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .reply-cancel {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.72rem;
    color: var(--muted);
    cursor: pointer;
  }
  .reply-cancel:hover {
    color: var(--accent);
  }
</style>
