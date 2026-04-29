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
