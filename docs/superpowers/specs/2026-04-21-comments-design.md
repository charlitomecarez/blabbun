# Comments Section — Design Spec

**Date:** 2026-04-21
**Status:** Approved

## Overview

Add an anonymous comment section to every blog post detail page. Comments support one level of replies. Placement: below the Clap/Share bar, above Related Posts. All data is in-memory mock for now; Supabase integration comes later.

## Components

| File                                                 | Responsibility                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/client/src/components/post/Comments.svelte`    | Owns mock data, comment count header, full list, "Leave a comment" form |
| `apps/client/src/components/post/CommentItem.svelte` | Renders one comment, its replies, and inline reply form toggle          |

## Data Shapes

```ts
interface Reply {
  id: string;
  body: string;
  createdAt: Date;
}

interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  replies: Reply[];
}
```

## Mock Data

Three hardcoded comments in `Comments.svelte` with realistic relative dates and 0–2 replies each. Example:

```ts
const mockComments: Comment[] = [
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
    body: "Beautifully written. Blab Bun always finds a way to put words to things I couldn't articulate.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    replies: [],
  },
  {
    id: "c3",
    body: "Found this through a friend. Glad I did.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    replies: [],
  },
];
```

## Behavior

### Leave a Comment (top-level)

- Textarea + "Post comment" button at the bottom of the section
- Submit is disabled when textarea is empty or whitespace-only
- Submitting prepends a new `Comment` to the list (in-memory, resets on page refresh)
- Textarea clears after submit

### Reply to a Comment

- Each comment has a "↩ Reply" button
- Clicking toggles an inline reply form below that comment's replies
- Only one reply form open at a time — opening one closes any other
- Reply form: textarea + "Post reply" button + "Cancel" button
- "Post reply" disabled when textarea is empty; on submit appends a new `Reply` to that comment's replies (in-memory); closes form
- "Cancel" closes form without saving

### Dates

- Shown as relative strings computed at render time from `createdAt`
- Format: "just now", "X minutes ago", "X hours ago", "X days ago", "X weeks ago"
- Simple inline helper function — no external library

## Visual Design

Matches the blog's design system:

| Element             | Style                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| Section border      | `border-t-2 border-[#c5f7d0]`                                              |
| Comment count label | `11px`, `tracking-[0.2em]`, uppercase, muted `rgba(41,48,45,0.5)`          |
| Comment body        | `15px`, `leading-[1.65]`, `rgba(41,48,45,0.8)`                             |
| Date                | `11px`, `rgba(41,48,45,0.4)`                                               |
| Reply indent        | `ml-5 pl-4 border-l-2 border-[#c5f7d0]`                                    |
| Reply button        | `12px`, bold, `#386547`, no background                                     |
| Reply body (nested) | `14px`, `rgba(41,48,45,0.75)`                                              |
| Comment divider     | `border-t border-[rgba(197,247,208,0.4)]`                                  |
| Textarea            | `border-[1.5px] border-[rgba(197,247,208,0.8)]`, `rounded-[8px]`, white bg |
| Submit button       | `bg-[#386547]` pill, white text, bold                                      |
| Cancel button       | Plain text, muted color                                                    |
| Container           | `max-w-[760px]`, `px-4 md:px-8`                                            |

## Props

### `Comments.svelte`

| Prop       | Type     | Description                                   |
| ---------- | -------- | --------------------------------------------- |
| `postSlug` | `string` | Used as namespace for future Supabase queries |

### `CommentItem.svelte`

| Prop            | Type                                        | Description                                     |
| --------------- | ------------------------------------------- | ----------------------------------------------- |
| `comment`       | `Comment`                                   | The comment to render                           |
| `activeReplyId` | `string \| null`                            | Which comment currently has the reply form open |
| `onReplyToggle` | `(id: string \| null) => void`              | Called when reply button or cancel is clicked   |
| `onReplySubmit` | `(commentId: string, body: string) => void` | Called when reply is posted                     |

## Placement in `[slug].astro`

```astro
import Comments from "@/components/post/Comments.svelte";
```

Insert between `<ClapShare … />` and the Related Posts `<section>`:

```astro
<!-- ─── Comments ─────────────────────────────────────────────── -->
<Comments client:load postSlug={post.id} />

<!-- ─── Related Posts ───────────────────────────────────────── -->
```

## Supabase Swap Path

When integrating Supabase:

- Replace `mockComments` array in `Comments.svelte` with a Supabase fetch
- Replace in-memory `addComment` / `addReply` with Supabase inserts
- `CommentItem.svelte` requires zero changes

## Out of Scope

- Editing or deleting comments
- Nested replies (replies to replies)
- Pagination or infinite scroll
- Spam protection / moderation
- Usernames or avatars
