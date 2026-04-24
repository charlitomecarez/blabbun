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
  let text = $state("");
  let err = $state("");
  let posted = $state(false);
  let submitting = $state(false);
  let activeReplyId = $state<string | null>(null);

  const COMMENTS_PER_PAGE = 10;
  let visibleCount = $state(COMMENTS_PER_PAGE);
  const visibleComments = $derived(comments.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < comments.length);
  const total = $derived(
    comments.reduce((a, c) => a + 1 + (c.replies?.length ?? 0), 0)
  );

  onMount(async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      yourName = saved;
    } else {
      yourName = anonName(((Date.now() / 10000) | 0) % 120);
      localStorage.setItem(STORAGE_KEY, yourName);
    }

    try {
      const res = await fetch(`/api/comments/${postSlug}`);
      if (!res.ok) throw new Error();
      comments = await res.json();
    } catch {
      /* silent */
    } finally {
      loading = false;
    }
  });

  async function submitComment(e: Event) {
    e.preventDefault();
    if (!text.trim()) {
      err = "say something first";
      return;
    }
    submitting = true;
    err = "";
    try {
      const res = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim(), anon_name: yourName }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      comments = [{ ...created, replies: [] }, ...comments];
      text = "";
      posted = true;
      setTimeout(() => (posted = false), 2000);
    } catch {
      err = "couldn't post, try again";
    } finally {
      submitting = false;
    }
  }

  async function addReply(commentId: string, body: string) {
    try {
      const res = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          parent_id: commentId,
          anon_name: yourName,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      comments = comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, created] } : c
      );
    } catch {
      /* silent */
    }
    activeReplyId = null;
  }

  const BUN_ADJS = [
    "sleepy",
    "cozy",
    "golden",
    "toasty",
    "fluffy",
    "crusty",
    "warm",
    "soft",
    "crispy",
    "doughy",
    "puffy",
    "sesame",
  ];
  const BUN_NOUNS = [
    "loaf",
    "bun",
    "roll",
    "crumb",
    "muffin",
    "scone",
    "pretzel",
    "bagel",
    "biscuit",
    "brioche",
  ];
  function anonName(seed: number) {
    return (
      BUN_ADJS[seed % BUN_ADJS.length] +
      "-" +
      BUN_NOUNS[Math.floor(seed / BUN_ADJS.length) % BUN_NOUNS.length]
    );
  }
  const STORAGE_KEY = "blabbun-anon-name";
  let yourName = $state("");

  const inputStyle =
    "background:var(--input-bg);border:1px solid var(--border);border-radius:3px;padding:10px 12px;font-size:0.8rem;color:var(--text);width:100%;outline:none;resize:vertical;font-family:inherit;line-height:1.6";
</script>

<div
  style="margin-top:48px;padding-top:32px;border-top:1px solid var(--divider)"
>
  <!-- Comment count -->
  <div
    style="font-size:0.72rem;color:var(--muted);letter-spacing:0.06em;margin-bottom:24px;text-transform:uppercase"
  >
    {#if !loading}
      {total} comment{total !== 1 ? "s" : ""}
    {/if}
  </div>

  <!-- Loading skeleton -->
  {#if loading}
    <div style="display:flex;flex-direction:column;gap:12px">
      {#each [1, 2] as n (n)}
        <div style="animation:fadeIn 0.5s ease">
          <div
            style="height:9px;width:60px;border-radius:2px;background:var(--bg3);margin-bottom:7px"
          ></div>
          <div
            style="height:11px;width:90%;border-radius:2px;background:var(--bg3)"
          ></div>
          <div
            style="height:11px;width:70%;border-radius:2px;background:var(--bg3);margin-top:5px"
          ></div>
        </div>
      {/each}
    </div>
  {:else if comments.length === 0}
    <!-- Empty state — don't show anything prominent, just subtle -->
  {:else}
    <div style="display:flex;flex-direction:column;gap:0">
      {#each visibleComments as comment (comment.id)}
        <CommentItem
          {comment}
          {activeReplyId}
          onReplyToggle={(id) => (activeReplyId = id)}
          onReplySubmit={addReply}
        />
      {/each}
    </div>
  {/if}

  {#if hasMore}
    <button
      type="button"
      onclick={() => (visibleCount += COMMENTS_PER_PAGE)}
      style="background:none;border:none;font-family:inherit;font-size:0.74rem;color:var(--accent);cursor:pointer;margin-top:12px;padding:0"
    >
      load more ({comments.length - visibleCount} remaining)
    </button>
  {/if}

  <!-- New comment form -->
  <form
    onsubmit={submitComment}
    style="margin-top:28px;padding-top:20px;border-top:1px solid var(--divider)"
  >
    <div
      style="font-size:0.7rem;color:var(--muted);margin-bottom:12px;letter-spacing:0.04em"
    >
      leave a comment — you'll be anonymous <span style="color:var(--accent)"
        >({yourName})</span
      >
    </div>
    {#if err}
      <div style="font-size:0.7rem;color:var(--accent);margin-bottom:8px">
        ! {err}
      </div>
    {/if}
    {#if posted}
      <div style="font-size:0.7rem;color:#3a8c5a;margin-bottom:8px">
        posted!
      </div>
    {/if}
    <textarea
      bind:value={text}
      placeholder="what do you think..."
      rows={3}
      aria-label="Comment text"
      style="{inputStyle};margin-bottom:10px;"
    ></textarea>
    <button
      type="submit"
      disabled={submitting}
      style="
        background:var(--accent);border:none;border-radius:3px;
        padding:9px 20px;font-size:0.74rem;font-family:inherit;
        color:#fff;cursor:pointer;letter-spacing:0.04em;
        opacity:{submitting ? '0.6' : '1'};
      "
    >
      {submitting ? "posting…" : "post anonymously"}
    </button>
  </form>
</div>
