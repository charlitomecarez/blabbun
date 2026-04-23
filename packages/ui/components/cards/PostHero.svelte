<script lang="ts">
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

  function tagClass(t: string): string {
    const map: Record<string, string> = {
      RANTS: "tag-rants",
      TAKES: "tag-takes",
      "HALF-BAKED IDEAS": "tag-halfbaked",
      "LIFE STUFF": "tag-lifestuff",
      CULTURE: "tag-culture",
      EDITORIAL: "tag-editorial",
      TECHNICAL: "tag-technical",
    };
    return map[t.toUpperCase()] ?? "tag-default";
  }
</script>

<!-- PostDetailView header — exact design match -->
<div style="animation:fadeSlideIn 0.25s ease;margin-bottom:0">
  <!-- ← back [esc] -->
  <a
    href={backHref}
    style="
      color:var(--accent);font-size:0.76rem;font-family:inherit;
      padding:0;margin-bottom:28px;
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
    style="
      font-size:1.28rem;font-weight:600;line-height:1.4;
      margin-bottom:30px;text-wrap:pretty;max-width:560px;
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

  .tag-rants {
    background: #fce8e8;
    color: #9b2121;
  }
  .tag-takes {
    background: #e8f0fc;
    color: #1a3a8c;
  }
  .tag-halfbaked {
    background: #fef3e2;
    color: #8a5a00;
  }
  .tag-lifestuff {
    background: #e8f8ee;
    color: #1a6b3a;
  }
  .tag-culture {
    background: #f3e8fc;
    color: #6a1a8c;
  }
  .tag-editorial {
    background: #faebd7;
    color: #8a5a00;
  }
  .tag-technical {
    background: #e8f0fc;
    color: #1a3a8c;
  }
  .tag-default {
    background: #f0ede8;
    color: #6b5e4e;
  }

  :global(body.dark) .tag-rants {
    background: #2a1414;
    color: #d47070;
  }
  :global(body.dark) .tag-takes {
    background: #111a2a;
    color: #6a96d4;
  }
  :global(body.dark) .tag-halfbaked {
    background: #241a08;
    color: #c49040;
  }
  :global(body.dark) .tag-lifestuff {
    background: #0e2218;
    color: #5aab78;
  }
  :global(body.dark) .tag-culture {
    background: #1e1228;
    color: #a870d4;
  }
  :global(body.dark) .tag-editorial {
    background: #241a08;
    color: #c49040;
  }
  :global(body.dark) .tag-technical {
    background: #111a2a;
    color: #6a96d4;
  }
  :global(body.dark) .tag-default {
    background: #1e1a14;
    color: #a09080;
  }
</style>
