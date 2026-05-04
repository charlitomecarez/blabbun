<script lang="ts">
  import { tagClass } from "@blabbun/utils";

  interface Props {
    title: string;
    description?: string;
    tag?: string;
    readTime?: string;
    pubDate: Date;
    author?: string;
    backHref?: string;
  }

  const {
    title,
    tag = "EDITORIAL",
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
  <!-- ← back [esc] -->
  <a
    href={backHref}
    class="back-link"
    style="
      color:var(--accent);font-size:0.76rem;font-family:inherit;
      padding:0;
      display:inline-flex;align-items:center;gap:12px;
      text-decoration:none;
    "
  >
    ← back
    <span style="font-size:0.62rem;color:var(--muted2);font-weight:400"
      >[esc]</span
    >
  </a>

  <!-- Date + tag + readtime row -->
  <div
    style="display:flex;gap:10px;align-items:center;margin-bottom:10px;flex-wrap:wrap"
  >
    <span style="font-size:0.68rem;color:var(--muted)">{formattedDate}</span>
    <span class="post-badge {tagClass(tag)}">{tag}</span>
    <span style="font-size:0.68rem;color:var(--muted2)">{readTime}</span>
  </div>

  <!-- Title -->
  <h1
    class="post-title"
    style="
      font-size:1.28rem;font-weight:600;line-height:1.4;
      text-wrap:pretty;max-width:560px;
      color:var(--text);
    "
  >
    {title}
  </h1>
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
    margin-bottom: 28px;
  }

  .post-title {
    margin-bottom: 30px;
  }

  @media (max-width: 640px) {
    .back-link {
      margin-bottom: 16px;
    }
    .post-title {
      font-size: 1.1rem;
      margin-bottom: 18px;
    }
  }
</style>
