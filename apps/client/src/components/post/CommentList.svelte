<script lang="ts">
  import type { Comment } from "./types";

  import CommentItem from "./CommentItem.svelte";

  interface Props {
    comments: Comment[];
    activeReplyId: string | null;
    onReplyToggle: (id: string | null) => void;
    onReplySubmit: (commentId: string, body: string) => Promise<void>;
  }

  const { comments, activeReplyId, onReplyToggle, onReplySubmit }: Props =
    $props();

  const COMMENTS_PER_PAGE = 10;
  let visibleCount = $state(COMMENTS_PER_PAGE);

  const visibleComments = $derived(comments.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < comments.length);

  /** Total count including nested replies — shown in the section header. */
  const total = $derived(
    comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0)
  );
</script>

<div class="list-header">
  {total} comment{total !== 1 ? "s" : ""}
</div>

{#if comments.length > 0}
  <div class="comment-list">
    {#each visibleComments as comment (comment.id)}
      <CommentItem {comment} {activeReplyId} {onReplyToggle} {onReplySubmit} />
    {/each}
  </div>
{/if}

{#if hasMore}
  <button
    type="button"
    class="load-more"
    onclick={() => (visibleCount += COMMENTS_PER_PAGE)}
  >
    load more ({comments.length - visibleCount} remaining)
  </button>
{/if}
