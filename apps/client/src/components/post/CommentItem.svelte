<script lang="ts">
  import type { Comment } from "./types";

  interface Props {
    comment: Comment;
    activeReplyId: string | null;
    onReplyToggle: (id: string | null) => void;
    onReplySubmit: (commentId: string, body: string) => void;
  }

  const { comment, activeReplyId, onReplyToggle, onReplySubmit }: Props =
    $props();

  let replyBody = $state("");

  const isReplying = $derived(activeReplyId === comment.id);

  function relativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  function handleReplySubmit() {
    if (!replyBody.trim()) return;
    onReplySubmit(comment.id, replyBody.trim());
    replyBody = "";
  }

  function handleCancel() {
    replyBody = "";
    onReplyToggle(null);
  }
</script>

<div>
  <!-- Comment header -->
  <div class="mb-1.5 flex items-baseline gap-2">
    <span class="font-manrope text-[13px] font-bold text-[#29302d]"
      >Anonymous</span
    >
    <span class="font-manrope text-[11px] text-[rgba(41,48,45,0.4)]"
      >{relativeTime(comment.createdAt)}</span
    >
  </div>

  <!-- Comment body -->
  <p
    class="font-manrope mb-2 text-[15px] leading-[1.65] text-[rgba(41,48,45,0.8)]"
  >
    {comment.body}
  </p>

  <!-- Reply toggle button -->
  <button
    type="button"
    onclick={() => onReplyToggle(isReplying ? null : comment.id)}
    class="font-manrope cursor-pointer border-none bg-transparent p-0 text-[12px] font-bold tracking-[0.04em] text-[#386547]"
  >
    ↩ Reply
  </button>

  <!-- Replies + inline reply form -->
  {#if comment.replies.length > 0 || isReplying}
    <div class="mt-3 ml-5 space-y-3 border-l-2 border-[#c5f7d0] pl-4">
      {#each comment.replies as reply (reply.id)}
        <div>
          <div class="mb-1 flex items-baseline gap-2">
            <span class="font-manrope text-[13px] font-bold text-[#29302d]"
              >Anonymous</span
            >
            <span class="font-manrope text-[11px] text-[rgba(41,48,45,0.4)]"
              >{relativeTime(reply.createdAt)}</span
            >
          </div>
          <p
            class="font-manrope text-[14px] leading-[1.65] text-[rgba(41,48,45,0.75)]"
          >
            {reply.body}
          </p>
        </div>
      {/each}

      {#if isReplying}
        <div>
          <textarea
            bind:value={replyBody}
            placeholder="Write a reply…"
            rows="3"
            class="font-manrope w-full resize-none rounded-[8px] border-[1.5px] border-[rgba(197,247,208,0.8)] bg-white px-3 py-2.5 text-[14px] text-[#29302d] placeholder-[rgba(41,48,45,0.35)] outline-none focus:border-[#386547]"
          ></textarea>
          <div class="mt-2 flex gap-2">
            <button
              type="button"
              onclick={handleReplySubmit}
              disabled={!replyBody.trim()}
              class="font-manrope cursor-pointer rounded-full bg-[#386547] px-4 py-1.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Post reply
            </button>
            <button
              type="button"
              onclick={handleCancel}
              class="font-manrope cursor-pointer border-none bg-transparent text-[13px] font-bold text-[rgba(41,48,45,0.4)] hover:text-[rgba(41,48,45,0.7)]"
            >
              Cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
