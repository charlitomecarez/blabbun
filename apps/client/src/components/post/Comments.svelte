<script lang="ts">
  import { onMount } from "svelte";

  import { ANON_NAME_POOL_SIZE, anonName } from "@blabbun/utils";

  import type { Comment } from "./types";
  import CommentForm from "./CommentForm.svelte";
  import CommentList from "./CommentList.svelte";

  interface Props {
    postSlug: string;
  }

  const { postSlug }: Props = $props();

  const STORAGE_KEY = "blabbun-anon-name";

  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let yourName = $state("");
  let activeReplyId = $state<string | null>(null);

  onMount(async () => {
    // Restore or generate an anonymous name that persists across sessions.
    const saved = localStorage.getItem(STORAGE_KEY);
    yourName =
      saved ?? anonName(((Date.now() / 10000) | 0) % ANON_NAME_POOL_SIZE);
    if (!saved) localStorage.setItem(STORAGE_KEY, yourName);

    try {
      const res = await fetch(`/api/comments/${postSlug}`);
      if (!res.ok) throw new Error();
      comments = await res.json();
    } catch {
      /* silent — a failed fetch shouldn't break the page */
    } finally {
      loading = false;
    }
  });

  /** Submits a new top-level comment and prepends it to the list optimistically. */
  async function submitComment(body: string): Promise<void> {
    const res = await fetch(`/api/comments/${postSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, anon_name: yourName }),
    });
    if (!res.ok) throw new Error();
    const created = await res.json();
    comments = [{ ...created, replies: [] }, ...comments];
  }

  /** Submits a reply to an existing comment and appends it to that comment's reply list. */
  async function addReply(commentId: string, body: string): Promise<void> {
    const res = await fetch(`/api/comments/${postSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, parent_id: commentId, anon_name: yourName }),
    });
    if (!res.ok) throw new Error();
    const created = await res.json();
    comments = comments.map((c) =>
      c.id === commentId
        ? { ...c, replies: [...(c.replies ?? []), created] }
        : c
    );
    activeReplyId = null;
  }
</script>

<section class="comments-section">
  {#if loading}
    <div class="skeleton">
      {#each [1, 2] as n (n)}
        <div class="skeleton-item">
          <div class="skeleton-name"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      {/each}
    </div>
  {:else}
    <CommentList
      {comments}
      {activeReplyId}
      onReplyToggle={(id) => (activeReplyId = id)}
      onReplySubmit={addReply}
    />
  {/if}

  <CommentForm {yourName} onSubmit={submitComment} />
</section>

<style>
  .comments-section {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--divider);
  }

  .skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeIn 0.5s ease;
  }

  .skeleton-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .skeleton-name {
    height: 9px;
    width: 60px;
    border-radius: 2px;
    background: var(--bg3);
    margin-bottom: 2px;
  }

  .skeleton-line {
    height: 11px;
    width: 90%;
    border-radius: 2px;
    background: var(--bg3);
  }

  .skeleton-line.short {
    width: 70%;
  }
</style>
