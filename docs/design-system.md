# Blab Bun — Design System

A single-font, warm-toned editorial system built on IBM Plex Mono with a parchment-and-amber palette. Everything — text, UI chrome, code — uses the same monospace typeface for a consistent, intentional texture.

---

## Typography

**Font:** IBM Plex Mono — all weights, all elements, no exceptions.

| Weight     | Value    | Usage                               |
| ---------- | -------- | ----------------------------------- |
| 400        | Regular  | Body text, captions, UI labels      |
| 500        | Medium   | Titles, card headings, nav links    |
| 600        | Semibold | Post titles (`h1`), section headers |
| 400 italic | Italic   | Rarely used; available for prose    |

**Base size:** `15px` on `<html>` (Tailwind's `rem` scale is relative to this).

### Type Scale

All values in `rem` relative to the 15px base.

| Token     | rem | px      | Usage                                      |
| --------- | --- | ------- | ------------------------------------------ |
| `0.62rem` | —   | ~9px    | Micro labels, entry numbers, BIMI captions |
| `0.65rem` | —   | ~10px   | Stats, timestamps, archive dates (mobile)  |
| `0.68rem` | —   | ~10px   | Form labels, tag badges, metadata rows     |
| `0.70rem` | —   | ~10.5px | Controls, selects, comment labels          |
| `0.72rem` | —   | ~11px   | Section headings (uppercase), load-more    |
| `0.74rem` | —   | ~11px   | Search input, submit buttons               |
| `0.75rem` | —   | ~11px   | Admin form inputs                          |
| `0.78rem` | —   | ~12px   | Nav links, reply textarea                  |
| `0.80rem` | —   | ~12px   | Descriptions, comment body (mobile)        |
| `0.82rem` | —   | ~12px   | Mobile nav links, search results           |
| `0.84rem` | —   | ~13px   | Comment body, archive title (mobile)       |
| `0.86rem` | —   | ~13px   | Archive row title                          |
| `0.88rem` | —   | ~13px   | Post prose body                            |
| `0.93rem` | —   | ~14px   | Feed item title                            |
| `0.95rem` | —   | ~14px   | Navbar logo text, email header brand       |
| `1.00rem` | —   | 15px    | Post title (mobile)                        |
| `1.05rem` | —   | ~16px   | Archive page heading                       |
| `1.10rem` | —   | ~17px   | Welcome email heading                      |
| `1.20rem` | —   | ~18px   | Email post title                           |
| `1.28rem` | —   | ~19px   | Post title (desktop, `PostHero`)           |

### Line Heights

| Context               | Value      |
| --------------------- | ---------- |
| Post prose paragraphs | `1.9`      |
| Feed excerpts         | `1.65`     |
| Titles                | `1.4–1.45` |
| Captions / metadata   | `1.5–1.7`  |
| UI labels             | `1`        |

---

## Color Tokens

All colors are CSS custom properties set on `body.light` / `body.dark`. Use the token names in components — never hardcode hex values except in email templates.

### Light Mode

| Token           | Hex       | Usage                                                 |
| --------------- | --------- | ----------------------------------------------------- |
| `--bg`          | `#fdf9f4` | Page background                                       |
| `--bg2`         | `#f5ede0` | Card surfaces, form panels, email body                |
| `--bg3`         | `#ede0ce` | Deeper surfaces, hover states                         |
| `--text`        | `#231e17` | Primary text                                          |
| `--muted`       | `#9c8b78` | Secondary text, labels, placeholders                  |
| `--muted2`      | `#c5b8a8` | Tertiary text, timestamps, captions                   |
| `--accent`      | `#c4832a` | Links, CTAs, active states, tag text                  |
| `--accent-soft` | `#faebd7` | Accent tint (reply thread border, editorial badge bg) |
| `--border`      | `#e0d4c0` | Component borders, dividers                           |
| `--divider`     | `#ece0ce` | Row separators (lighter than border)                  |
| `--card-bg`     | `#f5f0e8` | Alternate card background                             |
| `--input-bg`    | `#f0e8d8` | Input and textarea background                         |

### Dark Mode

| Token           | Hex       | Usage                                    |
| --------------- | --------- | ---------------------------------------- |
| `--bg`          | `#16120e` | Page background                          |
| `--bg2`         | `#1f1a14` | Card surfaces                            |
| `--bg3`         | `#261f17` | Deeper surfaces                          |
| `--text`        | `#e6ddd1` | Primary text                             |
| `--muted`       | `#7a6e60` | Secondary text                           |
| `--muted2`      | `#4a4038` | Tertiary text                            |
| `--accent`      | `#d4a040` | Links, CTAs (slightly warmer than light) |
| `--accent-soft` | `#2a1e0a` | Accent tint                              |
| `--border`      | `#2c241c` | Component borders                        |
| `--divider`     | `#261f17` | Row separators                           |
| `--card-bg`     | `#1c1710` | Alternate card background                |
| `--input-bg`    | `#1f1a14` | Input background                         |

### Fixed Colors (not tokenized)

| Value     | Usage                            |
| --------- | -------------------------------- |
| `#fff`    | Button text on accent background |
| `#3a8c5a` | Form success state               |
| `#c0392b` | Form error state (admin)         |
| `#e05c5c` | Delete button hover (admin)      |

---

## Tag Badges

Tags are rendered as small pill badges. The CSS class is resolved via `tagClass(tag)` from `@blabbun/utils`. Rules live in `global.css` as unscoped classes (required because Svelte won't hash dynamically-constructed class names).

| Tag              | Class            | Light bg  | Light text | Dark bg   | Dark text |
| ---------------- | ---------------- | --------- | ---------- | --------- | --------- |
| RANTS            | `.tag-rants`     | `#fce8e8` | `#9b2121`  | `#2a1414` | `#d47070` |
| TAKES            | `.tag-takes`     | `#e8f0fc` | `#1a3a8c`  | `#111a2a` | `#6a96d4` |
| HALF-BAKED IDEAS | `.tag-halfbaked` | `#fef3e2` | `#8a5a00`  | `#241a08` | `#c49040` |
| LIFE STUFF       | `.tag-lifestuff` | `#e8f8ee` | `#1a6b3a`  | `#0e2218` | `#5aab78` |
| CULTURE          | `.tag-culture`   | `#f3e8fc` | `#6a1a8c`  | `#1e1228` | `#a870d4` |
| EDITORIAL        | `.tag-editorial` | `#faebd7` | `#8a5a00`  | `#241a08` | `#c49040` |
| TECHNICAL        | `.tag-technical` | `#e8f0fc` | `#1a3a8c`  | `#111a2a` | `#6a96d4` |
| _(unknown)_      | `.tag-default`   | `#f0ede8` | `#6b5e4e`  | `#1e1a14` | `#a09080` |

**Badge anatomy:**

```css
font-size: 0.68rem;
padding: 2px 8px;
border-radius: 2px;
letter-spacing: 0.04em;
font-weight: 500;
white-space: nowrap;
```

---

## Layout

### Container

All content is constrained to a single centered column.

| Property                     | Value                             |
| ---------------------------- | --------------------------------- |
| Max width                    | `680px`                           |
| Horizontal padding (mobile)  | `1rem` (`px-4`)                   |
| Horizontal padding (desktop) | `2rem` (`px-8`)                   |
| Vertical padding (mobile)    | `pt-10 pb-6` (post/archive pages) |
| Vertical padding (desktop)   | `py-8`                            |

### Breakpoints

| Name | Width    | Notes                                          |
| ---- | -------- | ---------------------------------------------- |
| `sm` | `≥640px` | Padding switches to px-8, image heights expand |
| `md` | `≥768px` | Desktop navbar (nav links, search bar visible) |

### Z-index

| Layer                          | Value      | Element                                    |
| ------------------------------ | ---------- | ------------------------------------------ |
| Sticky navbar                  | `100`      | `<header>`                                 |
| Stretched link overlay         | `2`        | `.archive-link`, `.feed-title-link::after` |
| Relative content above overlay | `1`        | `.archive-title`, `.feed-meta-bottom`      |
| Reading progress bar           | _(inline)_ | Fixed to top                               |

---

## Spacing Scale

Common spacing values used throughout (not a strict token system — these recur enough to be considered conventions).

| Value  | px  | Usage                                        |
| ------ | --- | -------------------------------------------- |
| `4px`  | 4   | Tight gaps, badge padding                    |
| `6px`  | 6   | Small gaps between metadata items            |
| `8px`  | 8   | Standard inline gaps                         |
| `10px` | 10  | Tag filter row gaps, control gaps            |
| `12px` | 12  | Compact section gaps                         |
| `14px` | 14  | Action bar gaps, comment padding             |
| `16px` | 16  | Standard mobile container padding            |
| `20px` | 20  | Archive list gutter, control bottom margin   |
| `24px` | 24  | Standard section gaps                        |
| `28px` | 28  | Back link bottom margin, action bar top      |
| `30px` | 30  | Post title bottom margin                     |
| `32px` | 32  | Standard desktop padding                     |
| `48px` | 48  | Related posts top margin, email body padding |

---

## Animations

Defined in `global.css`, used via `animation:` inline or Tailwind `animate-[]`.

### `fadeIn`

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

Usage: Archive list root, homepage subtitle bar. Duration: `0.2s ease`.

### `fadeSlideIn`

```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Usage: Post header (`PostHero`). Duration: `0.25s ease`.

### Hover transitions

| Property            | Duration    | Elements                                        |
| ------------------- | ----------- | ----------------------------------------------- |
| `color`             | `0.15s`     | Feed titles, archive titles, nav links, tags    |
| `color`             | `0.12s`     | Reply toggles, tag buttons                      |
| `background`        | `0.15s`     | Feed card rows                                  |
| `opacity`           | `0.15s`     | Submit buttons (disabled state), clap button    |
| `transform scale`   | `0.4s ease` | Feed item image (scale 1.02 on hover)           |
| `grayscale + scale` | `0.5s`      | ArticleCard image (lifts grayscale, 1.05 scale) |

---

## Component Library (`@blabbun/ui`)

All components are **Svelte 5** using runes syntax (`$props()`, `$state()`, `$derived()`). No `client:` directive needed for pure-CSS hover components.

### Cards

#### `FeedItem`

Home feed list item. Hover: title turns accent, image scales 1.02, gutter arrow appears.

| Prop           | Type     | Default       | Description                         |
| -------------- | -------- | ------------- | ----------------------------------- |
| `title`        | `string` | required      | Post title                          |
| `excerpt`      | `string` | `""`          | Post description                    |
| `tag`          | `string` | `"EDITORIAL"` | Tag key (resolved via `tagClass()`) |
| `readTime`     | `string` | `""`          | e.g. `"4 min read"`                 |
| `date`         | `string` | `""`          | Formatted publish date              |
| `imageUrl`     | `string` | `""`          | Optional hero image                 |
| `href`         | `string` | `"#"`         | Link destination                    |
| `claps`        | `number` | undefined     | Clap count                          |
| `commentCount` | `number` | undefined     | Comment count                       |

#### `ArticleCard`

Editorial grid card. Full-bleed image, grayscale lifts on hover.

| Prop          | Type     | Description         |
| ------------- | -------- | ------------------- |
| `title`       | `string` | Post title          |
| `excerpt`     | `string` | Post description    |
| `tag`         | `string` | Tag key             |
| `readTime`    | `string` | e.g. `"4 min read"` |
| `entryNumber` | `string` | e.g. `"ENTRY #03"`  |
| `imageUrl`    | `string` | Hero image URL      |
| `href`        | `string` | Link destination    |

#### `PostHero`

Post page header — back link, date/tag/readtime row, title.

| Prop       | Type     | Default        | Description           |
| ---------- | -------- | -------------- | --------------------- |
| `title`    | `string` | required       | Post title            |
| `tag`      | `string` | `"EDITORIAL"`  | Tag key               |
| `readTime` | `string` | `"5 min read"` | Reading time estimate |
| `pubDate`  | `Date`   | required       | Publish date          |
| `backHref` | `string` | `"/"`          | Back link destination |

Title font sizes: `1.28rem` desktop → `1rem` mobile.

---

### Layout

#### `Navbar`

Sticky header (`z-index: 100`). Desktop: logo + nav links + search bar + saved badge + theme toggle. Mobile: logo + theme toggle + hamburger → dropdown with search + nav links + saved.

| Prop    | Type        | Description                         |
| ------- | ----------- | ----------------------------------- |
| `links` | `NavLink[]` | Array of `{ label, href, active? }` |

Theme is persisted to `localStorage` as `bb-theme` (`"light"` or `"dark"`). Bookmark count is read from `localStorage` keys prefixed `bb-bookmark-`.

#### `Footer`

Displays total word count across all published posts.

| Prop        | Type     | Description                  |
| ----------- | -------- | ---------------------------- |
| `wordCount` | `number` | Total words across all posts |

#### `BunLogo`

Standalone logo mark — the bun SVG/image. No props.

---

### Post

#### `BookmarkButton`

Saves/removes a post from localStorage. Updates navbar badge count via `storage` event.

| Prop   | Type     | Description                             |
| ------ | -------- | --------------------------------------- |
| `slug` | `string` | Post slug — key is `bb-bookmark-{slug}` |

#### `ReactionBar`

Emoji reaction strip below post body. Fetches and submits reactions via `/api/claps/[slug]`.

| Prop       | Type     | Description |
| ---------- | -------- | ----------- |
| `postSlug` | `string` | Post slug   |

#### `ReadingProgress`

Fixed thin bar at the top of the viewport tracking scroll position through the post. No props.

---

### Inputs

#### `EmailInput`

Newsletter subscription input. Submits to `/api/newsletter`.

| Prop          | Type     | Description            |
| ------------- | -------- | ---------------------- |
| `placeholder` | `string` | Input placeholder text |

#### `Button`

Generic styled button.

| Prop      | Type                   | Description      |
| --------- | ---------------------- | ---------------- |
| `variant` | `"primary" \| "ghost"` | Visual style     |
| `type`    | `string`               | HTML button type |

#### `BackButton`

Styled back navigation link.

| Prop   | Type     | Description      |
| ------ | -------- | ---------------- |
| `href` | `string` | Back destination |

---

## Scrollbar

Custom thin scrollbar applied globally.

```css
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: var(--bg);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
```

---

## Focus & Accessibility

```css
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

Text selection uses accent color with white text:

```css
::selection {
  background: var(--accent);
  color: #fff;
}
```

Stretched links (full-card click targets) use `position: absolute; inset: 0; z-index: 2` with content sitting at `z-index: 1` above the overlay.

---

## Post Body Prose

Post content is wrapped in a Tailwind Typography (`prose`) block with heavy customization. Key overrides:

| Element      | Style                                                             |
| ------------ | ----------------------------------------------------------------- |
| `p`          | `0.88rem`, `1.9` line-height, `var(--muted)`, `text-wrap: pretty` |
| `h2`         | `1.1rem`, `mt-10 mb-4`                                            |
| `h3`         | `0.95rem`, `mt-7 mb-3`                                            |
| `a`          | `var(--accent)`, no underline, underline on hover                 |
| `code`       | `var(--bg2)` background, `0.82em`, `px-1 py-0.5 rounded`          |
| `blockquote` | `2px` left border in `var(--accent)`, `var(--bg2)` background     |
| `figcaption` | `0.7rem`, centered, `var(--muted2)`                               |
| `figure`     | `my-8`                                                            |

### In-body Images

Images inside post content are full-width and break out of container padding on mobile:

```css
/* Mobile: full-bleed */
.post-content img {
  margin-left: -2rem;
  margin-right: -2rem;
  width: calc(100% + 4rem);
  border-radius: 0;
}
```

### Image Snippet (for content authors)

When inserting images inside post MDX, use the `<figure>` pattern:

```html
<figure>
  <img src="image-url" alt="description" />
  <figcaption>photo by <a href="source-url">Source Name</a></figcaption>
</figure>
```

---

## Utilities (`@blabbun/utils`)

| Export         | Signature                  | Description                                                               |
| -------------- | -------------------------- | ------------------------------------------------------------------------- |
| `readTime`     | `(text: string) => string` | Estimates reading time at 200 wpm. Returns `"N min read"`, minimum 1 min. |
| `tagClass`     | `(tag: string) => string`  | Maps uppercase tag key to CSS badge class. Falls back to `"tag-default"`. |
| `tagToLabel`   | `(tag: string) => string`  | Title-cases a tag slug for display.                                       |
| `relativeTime` | `(date: Date) => string`   | Returns human-relative time string.                                       |
| `anonName`     | `(seed: string) => string` | Generates a deterministic anonymous display name for commenters.          |

---

## Email Design

Emails follow the same warm palette as the site but use inline styles (no CSS classes) for mail client compatibility.

| Token           | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Background      | `#fdf9f4`                                                 |
| Card background | `#f5ede0`                                                 |
| Card border     | `#e0d4c0`                                                 |
| Primary text    | `#231e17`                                                 |
| Muted text      | `#9c8b78`                                                 |
| Caption text    | `#c5b8a8`                                                 |
| Accent          | `#c4832a`                                                 |
| CTA button      | `background: #c4832a; color: #fff`                        |
| Font            | IBM Plex Mono loaded via Google Fonts, monospace fallback |
| Max width       | `560px`                                                   |
| Border radius   | `4px` (card), `3px` (button)                              |

### Email Templates

| Template     | Function                 | Description                                  |
| ------------ | ------------------------ | -------------------------------------------- |
| Welcome      | `welcomeEmailHtml()`     | Sent on newsletter subscribe                 |
| New post     | `newPostEmailHtml()`     | Sent to all subscribers on publish           |
| Issue report | `issueReportEmailHtml()` | Internal; sent to admin on report submission |

All bulk sends include:

- `text` plain-text body (fallback for mail clients)
- `List-Unsubscribe` header (personalized one-click URL)
- `List-Unsubscribe-Post: List-Unsubscribe=One-Click`

---

## SEO & Meta

Managed in `Layout.astro`. All pages get:

- `<title>` — `{pageTitle} · Blab Bun` or just `Blab Bun`
- `og:type` — `"website"` (default) or `"article"` (post pages)
- `og:image` — post's hero image if present; Twitter card switches to `summary_large_image`
- `og:image:width/height` — `1200 × 630`
- Canonical URL
- JSON-LD `WebSite` schema (all pages) + `BlogPosting` schema (post pages)
- RSS autodiscovery `<link>` pointing to `/rss.xml`
- `theme-color` meta — `#fdf9f4` light, `#16120e` dark

---

## File Structure

```
packages/
  ui/
    components/
      buttons/    BackButton, Button
      cards/      ArticleCard, FeedItem, PostHero
      inputs/     EmailInput
      layouts/    BunLogo, Footer, Navbar
      post/       BookmarkButton, ReactionBar, ReadingProgress
    styles/
      global.css  Token definitions, tag badge rules, prose overrides
  utils/
    src/
      readTime.ts
      tags.ts
      date.ts
      anonName.ts
  types/
    src/
      post.ts     Post interface (frontmatter contract)
  db/
    src/
      client.ts   createClient() wrapper
      types.ts    CommentRow, PostClapRow, ClapVoteRow, SubscriberRow
```
