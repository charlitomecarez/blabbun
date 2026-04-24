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

  const inputStyle =
    "background:var(--input-bg);border:1px solid var(--border);border-radius:3px;padding:8px 10px;font-size:0.78rem;color:var(--text);width:100%;outline:none;resize:none;font-family:inherit;line-height:1.6";
</script>

<div style="padding:14px 0;border-bottom:1px solid var(--divider)">
  <!-- Header -->
  <div
    style="font-size:0.7rem;font-weight:500;color:var(--accent);margin-bottom:6px"
  >
    {comment.anon_name ?? "anonymous"}
    <span style="color:var(--muted2);font-weight:400;margin-left:8px"
      >{relativeTime(comment.created_at)}</span
    >
  </div>

  <!-- Body -->
  <p
    style="font-size:0.84rem;line-height:1.65;color:var(--text);margin-bottom:8px"
  >
    {comment.body}
  </p>

  <!-- Reply toggle -->
  <button
    type="button"
    onclick={() => onReplyToggle(isReplying ? null : comment.id)}
    style="background:none;border:none;font-family:inherit;font-size:0.7rem;color:var(--muted);cursor:pointer;padding:0;letter-spacing:0.02em"
  >
    {isReplying ? "↩ cancel" : "↩ reply"}
  </button>

  <!-- Replies -->
  {#if comment.replies.length > 0 || isReplying}
    <div
      style="margin-top:10px;margin-left:14px;padding-left:12px;border-left:2px solid var(--accent-soft)"
    >
      {#each comment.replies as reply (reply.id)}
        <div style="padding:8px 0;border-bottom:1px solid var(--divider)">
          <div
            style="font-size:0.68rem;font-weight:500;color:var(--accent);margin-bottom:4px"
          >
            {reply.anon_name ?? "anonymous"}
            <span style="color:var(--muted2);font-weight:400;margin-left:6px"
              >{relativeTime(reply.created_at)}</span
            >
          </div>
          <p style="font-size:0.8rem;line-height:1.6;color:var(--text)">
            {reply.body}
          </p>
        </div>
      {/each}

      {#if isReplying}
        <div style="padding-top:10px">
          <textarea
            bind:value={replyBody}
            placeholder="write a reply…"
            rows={2}
            aria-label="Reply text"
            style={inputStyle}
          ></textarea>
          <div style="margin-top:6px;display:flex;gap:8px">
            <button
              type="button"
              onclick={handleReplySubmit}
              disabled={!replyBody.trim()}
              style="background:var(--accent);border:none;border-radius:3px;padding:7px 16px;font-size:0.72rem;font-family:inherit;color:#fff;cursor:pointer;opacity:{replyBody.trim()
                ? '1'
                : '0.4'}">post</button
            >
            <button
              type="button"
              onclick={() => {
                replyBody = "";
                onReplyToggle(null);
              }}
              style="background:none;border:none;font-family:inherit;font-size:0.72rem;color:var(--muted);cursor:pointer"
              >cancel</button
            >
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
