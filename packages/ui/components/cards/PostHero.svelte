<script lang="ts">
  import { tagClass } from "@blabbun/utils";

  interface Props {
    title: string;
    description?: string;
    tags?: string[];
    readTime?: string;
    pubDate: Date;
    author?: string;
    backHref?: string;
  }

  const {
    title,
    tags = ["EDITORIAL"],
    readTime = "5 min read",
    pubDate,
    backHref = "/",
  }: Props = $props();

  const formattedDate = pubDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
</script>

<!-- PostDetailView header — exact design match -->
<div style="animation:fadeSlideIn 0.25s ease;margin-bottom:0">
  <!-- ← back to the blabs [esc] -->
  <a
    href={backHref}
    class="back-link"
    style="
      color:var(--accent);
      font-family:'Caveat',cursive;
      font-size:1.1rem;
      padding:0;
      display:inline-flex;align-items:center;gap:12px;
      text-decoration:none;
    "
  >
    ← back to the blabs
    <span
      style="font-size:0.62rem;color:var(--muted2);font-weight:400;font-family:'IBM Plex Mono',monospace"
      >[esc]</span
    >
  </a>

  <!-- Date + tag + readtime row -->
  <div
    style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap"
  >
    <span
      style="font-size:0.95rem;font-family:'Caveat',cursive;color:var(--muted)"
      >{formattedDate}</span
    >
    {#each tags as t}
      <span class="post-badge {tagClass(t)}">{t}</span>
    {/each}
    <span style="font-size:0.68rem;color:var(--muted2)">{readTime}</span>
    <span
      style="font-family:'Caveat',cursive;font-size:0.95rem;color:var(--accent);margin-left:4px"
    >
      ✶ tip: double-click any paragraph to highlight it
    </span>
  </div>

  <!-- Title (Fraunces serif) -->
  <h1
    class="post-title"
    style="
      font-family:'Fraunces',serif;
      font-size:2.4rem;font-weight:600;line-height:1.08;
      text-wrap:balance;max-width:620px;
      letter-spacing:-0.02em;
      color:var(--text);
    "
  >
    {title}
  </h1>

  <!-- Scribble underline SVG -->
  <svg
    width="220"
    height="14"
    viewBox="0 0 220 14"
    style="margin-bottom:30px;display:block"
  >
    <path
      d="M2 8 Q 40 2, 80 8 T 160 8 T 218 7"
      stroke="var(--accent)"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
    />
  </svg>
</div>

<style>
  .post-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 2px;
    letter-spacing: 0.04em;
    font-weight: 500;
    white-space: nowrap;
  }

  .back-link {
    margin-bottom: 24px;
    display: inline-flex;
  }

  .post-title {
    margin-bottom: 18px;
  }

  @media (max-width: 640px) {
    .back-link {
      margin-bottom: 16px;
    }
    .post-title {
      font-size: 1.7rem;
      margin-bottom: 14px;
    }
  }
</style>
