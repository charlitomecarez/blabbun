<script lang="ts">
  import { onMount } from "svelte";
  import type { Comment } from "./types";
  import CommentItem from "./CommentItem.svelte";

  interface Props {
    postSlug: string;
  }

  const { postSlug }: Props = $props();

  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const COMMENTS_PER_PAGE = 5;
  let visibleCount = $state(COMMENTS_PER_PAGE);

  const visibleComments = $derived(comments.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < comments.length);

  let activeReplyId = $state<string | null>(null);
  let newCommentBody = $state("");
  let submitting = $state(false);

  onMount(async () => {
    try {
      const res = await fetch(`/api/comments/${postSlug}`);
      if (!res.ok) throw new Error("Failed to load comments");
      comments = await res.json();
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      loading = false;
    }
  });

  async function addComment() {
    if (!newCommentBody.trim() || submitting) return;
    submitting = true;
    try {
      const res = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newCommentBody.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const created = await res.json();
      comments = [{ ...created, replies: [] }, ...comments];
      newCommentBody = "";
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      submitting = false;
    }
  }

  async function addReply(commentId: string, body: string) {
    try {
      const res = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parent_id: commentId }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      const created = await res.json();
      comments = comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, created] } : c
      );
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
    }
    activeReplyId = null;
  }

  function handleReplyToggle(id: string | null) {
    activeReplyId = id;
  }

  function loadMore() {
    visibleCount += COMMENTS_PER_PAGE;
  }
</script>

<div
  class="mx-auto max-w-[760px] border-t-2 border-[#c5f7d0] px-4 pt-10 pb-12 md:px-8"
>
  <p
    class="font-manrope mb-6 text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase"
  >
    {#if loading}
      Loading comments…
    {:else}
      {comments.length} Comment{comments.length === 1 ? "" : "s"}
    {/if}
  </p>

  {#if error}
    <p class="font-manrope mb-4 text-[14px] text-red-500">{error}</p>
  {/if}

  {#if !loading && comments.length > 0}
    <div class="space-y-6">
      {#each visibleComments as comment, i (comment.id)}
        <div>
          <CommentItem
            {comment}
            {activeReplyId}
            onReplyToggle={handleReplyToggle}
            onReplySubmit={addReply}
          />
          {#if i < visibleComments.length - 1}
            <div class="mt-6 border-t border-[rgba(197,247,208,0.4)]"></div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if hasMore}
    <div class="mt-6 flex justify-center">
      <button
        type="button"
        onclick={loadMore}
        class="font-manrope cursor-pointer rounded-full border border-[#c5f7d0] bg-transparent px-5 py-2 text-[13px] font-bold text-[#386547] transition-colors hover:bg-[#ebf3ed]"
      >
        Load more ({comments.length - visibleCount} remaining)
      </button>
    </div>
  {/if}

  <!-- Leave a comment form -->
  <div class="mt-8 border-t border-[rgba(197,247,208,0.4)] pt-6">
    <p
      class="font-manrope mb-3 text-[11px] font-bold tracking-[0.12em] text-[rgba(41,48,45,0.5)] uppercase"
    >
      Leave a comment
    </p>
    <textarea
      bind:value={newCommentBody}
      placeholder="What's on your mind?"
      aria-label="Comment text"
      rows="4"
      class="font-manrope w-full resize-none rounded-[8px] border-[1.5px] border-[rgba(197,247,208,0.8)] bg-white px-3.5 py-3 text-[15px] text-[#29302d] placeholder-[rgba(41,48,45,0.35)] outline-none focus:border-[#386547]"
    ></textarea>
    <div class="mt-2.5">
      <button
        type="button"
        onclick={addComment}
        disabled={!newCommentBody.trim() || submitting}
        class="font-manrope cursor-pointer rounded-full bg-[#386547] px-5 py-2 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Posting…" : "Post comment"}
      </button>
    </div>
  </div>
</div>
