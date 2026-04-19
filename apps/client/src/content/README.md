# content/

This is where all blog posts live. Each file in `posts/` becomes a page on the site.

## Adding a post

Create a new `.mdx` file inside `posts/`:

```
src/content/posts/your-post-slug.mdx
```

Every post needs a frontmatter block at the top:

```mdx
---
title: "Your Post Title"
description: "A short summary shown in previews."
pubDate: 2026-04-17
tags: ["tag-one", "tag-two"]
---

Your content goes here.
```

### Frontmatter fields

| Field         | Required | Description                             |
| ------------- | -------- | --------------------------------------- |
| `title`       | yes      | Post title                              |
| `description` | yes      | Short summary used in meta and previews |
| `pubDate`     | yes      | Publish date in `YYYY-MM-DD` format     |
| `tags`        | no       | Array of topic tags                     |

## File naming

Use lowercase kebab-case for the filename — it becomes the URL slug.

```
hello-world.mdx        → /posts/hello-world
my-second-post.mdx     → /posts/my-second-post
```

## Writing

Posts support standard Markdown and JSX components (`.mdx`). You can import and use Svelte or Astro components directly inside a post if needed.
