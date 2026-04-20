<script lang="ts">
  import type { Comment } from "./types";
  import CommentItem from "./CommentItem.svelte";

  interface Props {
    postSlug: string;
  }

  // postSlug will be the Supabase query key when backend is integrated
  const { postSlug: _postSlug }: Props = $props();

  let comments = $state<Comment[]>([
    {
      id: "c1",
      body: "This really resonated with me. The part about letting thoughts settle without forcing them to be complete — that's something I needed to read today.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      replies: [
        {
          id: "r1",
          body: "Same here. Bookmarked this one.",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      id: "c2",
      body: "Beautifully written. The Lunan always finds a way to put words to things I couldn't articulate.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      replies: [],
    },
    {
      id: "c3",
      body: "Found this through a friend. Glad I did.",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      replies: [],
    },
    {
      id: "c4",
      body: "The quiet honesty here is rare. Most writing online is performing — this isn't.",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      replies: [],
    },
    {
      id: "c5",
      body: "I've been coming back to this post all week. Something about it keeps pulling me in.",
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      replies: [],
    },
    {
      id: "c6",
      body: "Needed this today. Thank you for putting it into words.",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      replies: [],
    },
    {
      id: "c7",
      body: "Just discovered The Lunan. Already reading through the archive.",
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      replies: [],
    },
  ]);

  const COMMENTS_PER_PAGE = 5;
  let visibleCount = $state(COMMENTS_PER_PAGE);

  const visibleComments = $derived(comments.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < comments.length);

  let activeReplyId = $state<string | null>(null);
  let newCommentBody = $state("");

  function addComment() {
    if (!newCommentBody.trim()) return;
    comments = [
      {
        id: crypto.randomUUID(),
        body: newCommentBody.trim(),
        createdAt: new Date(),
        replies: [],
      },
      ...comments,
    ];
    newCommentBody = "";
  }

  function addReply(commentId: string, body: string) {
    comments = comments.map((c) =>
      c.id === commentId
        ? {
            ...c,
            replies: [
              ...c.replies,
              { id: crypto.randomUUID(), body, createdAt: new Date() },
            ],
          }
        : c
    );
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
  <!-- Section header -->
  <p
    class="font-manrope mb-6 text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase"
  >
    {comments.length} Comment{comments.length === 1 ? "" : "s"}
  </p>

  <!-- Comment list -->
  {#if comments.length > 0}
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
        disabled={!newCommentBody.trim()}
        class="font-manrope cursor-pointer rounded-full bg-[#386547] px-5 py-2 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Post comment
      </button>
    </div>
  </div>
</div>
