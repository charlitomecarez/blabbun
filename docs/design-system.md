# Blab Bun — Design System

A warm-toned editorial system built on a three-font hierarchy — IBM Plex Mono for body and UI, Fraunces serif for display headings, and Caveat for handwritten accents — over a parchment-and-amber palette.

---

## Typography

### Font Stack

| Font              | Role                                           | How to use                                             |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------ |
| **IBM Plex Mono** | Body text, UI chrome, code                     | Default — applies to all elements                      |
| **Fraunces**      | Display headings, post titles, page h1s        | `font-family:'Fraunces',serif` or `.serif` class       |
| **Caveat**        | Handwritten accents, dates, labels, back links | `font-family:'Caveat',cursive` or `.handwritten` class |

**CSS utility classes** (defined in `global.css`):

```css
.handwritten {
  font-family: "Caveat", cursive;
}
.serif {
  font-family: "Fraunces", serif;
}
```

**Loading:**

- IBM Plex Mono — self-hosted woff2 (400, 500, 600, 400-italic) in `apps/client/public/fonts/`, preloaded in `Layout.astro`
- Fraunces + Caveat — Google Fonts, loaded in both client and admin `Layout.astro`

**Weights (IBM Plex Mono):**

| Weight     | Value    | Usage                             |
| ---------- | -------- | --------------------------------- |
| 400        | Regular  | Body text, captions, UI labels    |
| 500        | Medium   | Card headings, nav links          |
| 600        | Semibold | Section headers, utility page h1s |
| 400 italic | Italic   | Available for prose               |

**Weights (Fraunces):**

| Weight | Usage                                           |
| ------ | ----------------------------------------------- |
| 500    | Display subtitles, version numbers in changelog |
| 600    | Page h1s, post titles                           |

---

### Base Size

`html { font-size: 16px }` — all `rem` values are relative to this.

### Type Scale

| Token     | rem | px (at 16px base) | Usage                                                  |
| --------- | --- | ----------------- | ------------------------------------------------------ |
| `0.62rem` | —   | ~10px             | Micro labels, captions, badge text (changelog)         |
| `0.65rem` | —   | ~10px             | Stats, timestamps, archive dates (mobile)              |
| `0.68rem` | —   | ~11px             | Form labels, tag badges, metadata rows                 |
| `0.70rem` | —   | ~11px             | Controls, selects, comment labels                      |
| `0.72rem` | —   | ~12px             | Section headings (uppercase), load-more                |
| `0.74rem` | —   | ~12px             | Search input, nav links, submit buttons                |
| `0.75rem` | —   | ~12px             | Admin form inputs                                      |
| `0.78rem` | —   | ~12.5px           | Page subtitles, reply textarea                         |
| `0.80rem` | —   | ~13px             | Descriptions, comment body (mobile)                    |
| `0.82rem` | —   | ~13px             | Mobile nav links, search results                       |
| `0.84rem` | —   | ~13.5px           | Comment body, archive title (mobile), sticky card body |
| `0.88rem` | —   | ~14px             | Change descriptions (changelog), related post titles   |
| `0.94rem` | —   | ~15px             | **Post prose body** (paragraphs + list items)          |
| `0.95rem` | —   | ~15px             | Navbar logo text, Caveat dates in PostHero             |
| `1.00rem` | —   | 16px              | Changelog footer, handwritten badges                   |
| `1.05rem` | —   | ~17px             | Utility page h1s (archive, saved, topics, 404)         |
| `1.10rem` | —   | ~18px             | Caveat back links, email heading                       |
| `1.30rem` | —   | ~21px             | Inline subtitles (h1 row companions)                   |
| `1.40rem` | —   | ~22px             | Fraunces version numbers, card section headers         |
| `1.60rem` | —   | ~26px             | Homepage "fresh out the oven" badge                    |
| `2.00rem` | —   | 32px              | Fraunces h1 — changelog page (mobile)                  |
| `2.10rem` | —   | ~34px             | Fraunces h1 — homepage hero                            |
| `2.20rem` | —   | ~35px             | Fraunces h1 — about page                               |
| `2.40rem` | —   | ~38px             | Fraunces h1 — post titles (`PostHero`)                 |
| `2.60rem` | —   | ~42px             | Fraunces h1 — now, changelog, about large variant      |

### Line Heights

| Context                       | Value       |
| ----------------------------- | ----------- |
| Post prose paragraphs + lists | `1.9`       |
| Sticky card body text         | `1.5–1.6`   |
| Feed excerpts                 | `1.7`       |
| Fraunces display headings     | `1.05–1.08` |
| Captions / metadata           | `1.5–1.7`   |
| UI labels                     | `1`         |

---

## Color Tokens

All colors are CSS custom properties on `body.light` / `body.dark`. Use token names in components — never hardcode hex values (except in email templates).

### Light Mode

| Token           | Hex       | Usage                                                      |
| --------------- | --------- | ---------------------------------------------------------- |
| `--bg`          | `#fdf9f4` | Page background                                            |
| `--bg2`         | `#f5ede0` | Card surfaces, sticky notes, form panels                   |
| `--bg3`         | `#ede0ce` | Deeper surfaces, hover states                              |
| `--text`        | `#6b4a35` | Primary text                                               |
| `--muted`       | `#9c8b78` | Secondary text, labels, placeholders                       |
| `--muted2`      | `#c5b8a8` | Tertiary text, timestamps, captions                        |
| `--accent`      | `#c4832a` | Links, CTAs, active states, scribble strokes               |
| `--accent-soft` | `#faebd7` | Accent tint — reply thread border, badge bg                |
| `--accent2`     | `#c0463a` | Destructive/error accent (e.g. "fresh out the oven" badge) |
| `--accent3`     | `#3a7a5e` | Success/green accent                                       |
| `--border`      | `#e0d4c0` | Component borders                                          |
| `--divider`     | `#ece0ce` | Row separators (lighter than border)                       |
| `--card-bg`     | `#f5f0e8` | Alternate card background                                  |
| `--input-bg`    | `#f0e8d8` | Input and textarea background                              |

### Dark Mode

| Token           | Hex       | Usage                           |
| --------------- | --------- | ------------------------------- |
| `--bg`          | `#16120e` | Page background                 |
| `--bg2`         | `#1f1a14` | Card surfaces, sticky notes     |
| `--bg3`         | `#261f17` | Deeper surfaces                 |
| `--text`        | `#f0e0c8` | Primary text                    |
| `--muted`       | `#7a6e60` | Secondary text                  |
| `--muted2`      | `#4a4038` | Tertiary text                   |
| `--accent`      | `#d4a040` | Links, CTAs (warmer than light) |
| `--accent-soft` | `#2a1e0a` | Accent tint                     |
| `--accent2`     | `#d96a5a` | Destructive/error accent        |
| `--accent3`     | `#5fa888` | Success/green accent            |
| `--border`      | `#2c241c` | Component borders               |
| `--divider`     | `#261f17` | Row separators                  |
| `--card-bg`     | `#1c1710` | Alternate card background       |
| `--input-bg`    | `#1f1a14` | Input background                |

### Fixed Colors (not tokenized)

| Value     | Usage                                                |
| --------- | ---------------------------------------------------- |
| `#fff`    | Button text on accent background, current badge text |
| `#3a8c5a` | Form success state                                   |
| `#c0392b` | Form error state (admin)                             |
| `#e05c5c` | Delete button hover (admin)                          |

---

## Tag Badges

Tags render as small pill badges. CSS class resolved via `tagClass(tag)` from `@blabbun/utils`. Rules live in `global.css` as unscoped classes (Svelte won't hash dynamically-constructed class names).

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

The changelog page uses the same classes for change-type badges (`feat` → `tag-lifestuff`, `fix` → `tag-rants`, `improvement` → `tag-halfbaked`) at `0.62rem`.

---

## Layout

### Container

All content is constrained to a single centered column:

```astro
<main
  class="mx-auto min-h-[60vh] w-full max-w-[680px] flex-1 px-4 py-6 sm:px-8 sm:py-8"
>
</main>
```

| Property                     | Value                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| Max width                    | `680px`                                                           |
| Horizontal padding (mobile)  | `1rem` (`px-4`)                                                   |
| Horizontal padding (desktop) | `2rem` (`px-8`, `sm:px-8`)                                        |
| Vertical padding             | `py-6 sm:py-8` (most pages) or `sm:py-10` (about, now, changelog) |

### Breakpoints

| Name | Width    | Notes                                                             |
| ---- | -------- | ----------------------------------------------------------------- |
| `sm` | `≥640px` | Padding switches to px-8, image heights expand, h1 size increases |
| `md` | `≥768px` | Desktop navbar (nav links, search bar, saved button visible)      |

### Z-index

| Layer                          | Value      | Element                                |
| ------------------------------ | ---------- | -------------------------------------- |
| Paper grain overlay            | `300`      | `body::before` pseudo-element          |
| Sticky navbar                  | `100`      | `<header>`                             |
| Search dropdown                | _(inline)_ | Positioned above content               |
| Stretched link overlay         | `0`        | `.title-link::after`, `.what-now-link` |
| Relative content above overlay | `10`       | `.meta-bottom`                         |

---

## Sticky-Note Card Pattern

Used on `/now`, `/about`, `/changelog`, and the "what now" card on post pages. Each card is slightly rotated, has a box-shadow offset, and optionally a tape strip at the top.

```html
<div
  style="
  background: var(--bg2);
  border: 1.5px solid var(--text);
  padding: 22px 26px;
  transform: rotate(-0.6deg);
  box-shadow: 4px 4px 0 var(--text);
  position: relative;
"
>
  <!-- tape strip -->
  <div class="tape" style="top:-10px; left:30px; transform:rotate(-4deg)"></div>

  <!-- content -->
</div>
```

**`.tape` class** (defined in `global.css`):

```css
.tape {
  position: absolute;
  width: 60px;
  height: 18px;
  background: rgba(212, 160, 64, 0.35);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

**Rotation convention:** Cards in a set alternate with small, varied angles (e.g. `-0.6, 0.8, -0.4, 0.5`) so they look naturally scattered. Hover states on interactive cards shift `translate(-2px, -2px)`.

---

## Scribble Underline

The `.scribble-underline` class adds a wavy SVG underline under inline text (used on hero headings). The stroke color automatically adapts to light/dark mode via `global.css`.

```css
.scribble-underline::after {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 0;
  right: 0;
  height: 8px;
  background: url("data:image/svg+xml;...") no-repeat;
  background-size: 100% 100%;
}
```

For inline dividers within cards, use an inline SVG path directly:

```html
<svg
  width="100%"
  height="10"
  viewBox="0 0 300 10"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  <path
    d="M0 5 Q 40 1, 80 5 T 160 5 T 240 5 T 300 5"
    stroke="var(--accent)"
    stroke-width="1.5"
    fill="none"
    stroke-linecap="round"
  />
</svg>
```

---

## Spacing Scale

Common recurring spacing values (conventions, not strict tokens):

| Value  | px  | Usage                                                |
| ------ | --- | ---------------------------------------------------- |
| `4px`  | 4   | Tight gaps, badge padding                            |
| `6px`  | 6   | Small gaps between metadata items                    |
| `8px`  | 8   | Standard inline gaps                                 |
| `10px` | 10  | Tag filter row gaps                                  |
| `12px` | 12  | Compact section gaps                                 |
| `14px` | 14  | Action bar gaps, comment padding                     |
| `16px` | 16  | Standard mobile container padding                    |
| `18px` | 18  | Sticky-note card gaps in flex rows                   |
| `20px` | 20  | Archive list gutter, margin-bottom on section labels |
| `22px` | 22  | Sticky-note card padding (compact variant)           |
| `24px` | 24  | Standard section gaps, back link margin              |
| `26px` | 26  | Sticky-note card padding (standard)                  |
| `28px` | 28  | Card flex gap (changelog, now)                       |
| `32px` | 32  | Standard desktop padding                             |
| `36px` | 36  | Page subtitle bottom margin                          |
| `48px` | 48  | Related posts / end-of-post top margin               |

---

## Animations

Defined in `global.css`, referenced via `animation:` inline or `animate-[]`.

| Name          | Definition                                         | Usage                                                        |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `fadeIn`      | `opacity: 0 → 1`                                   | Page entry — archive list, about, now, changelog (0.2s ease) |
| `fadeSlideIn` | `opacity 0 + translateY(8px) → visible`            | PostHero entry (0.25s ease)                                  |
| `float`       | `translateY(0 → -3px → 0)`                         | Decorative floating elements                                 |
| `wiggle`      | `rotate(-2deg → 2deg)`                             | "fresh out the oven" badge, first-post stamp (3–4s infinite) |
| `scroll-x`    | `translateX(0 → -50%)`                             | Ticker / marquee strip                                       |
| `pop-in`      | `scale(0) rotate(-10deg) → scale(1) rotate(-4deg)` | "this one →" hover callout on feed cards                     |

### Hover Transitions

| Property                 | Duration     | Elements                                          |
| ------------------------ | ------------ | ------------------------------------------------- |
| `color`                  | `0.15s`      | Feed titles, archive titles, nav links, tags      |
| `color`                  | `0.12s`      | Reply toggles, tag buttons                        |
| `background`             | `0.15s`      | Feed card rows                                    |
| `opacity`                | `0.15s`      | Submit buttons (disabled state), clap button      |
| `transform`              | `0.15s`      | Sticky-note card hover lift (translate -2px -2px) |
| `transform + background` | `0.18s ease` | PostCard tilt on hover                            |

---

## Icons

All UI icons are inline SVGs — no emoji, no icon font. Stroke-based, `currentColor`, typically `width/height: 13px`, `viewBox="0 0 24 24"`, `aria-hidden="true"`.

| Icon                                   | Used in                                   |
| -------------------------------------- | ----------------------------------------- |
| Bookmark (path: M5 3h14…)              | Navbar desktop saved button + mobile menu |
| Clap / hand (path: M7 11.5V6…)         | PostCard clap stat                        |
| Chat bubble (path: M21 15…)            | PostCard comment stat                     |
| Back arrow (path: M13 7H1M6 2L1 7l5 5) | topics/[tag].astro breadcrumb             |

---

## Paper Grain Texture

A subtle noise overlay is applied globally via `body::before`. It uses a generated SVG `feTurbulence` filter embedded as a data URI in the CSS custom property `--paper-grain`. Different values are set for light and dark mode.

- Light mode: `mix-blend-mode: multiply; opacity: 0.7`
- Dark mode: `mix-blend-mode: screen; opacity: 0.4`
- `z-index: 300` — sits above all content but `pointer-events: none`

---

## Component Library (`@blabbun/ui`)

All components are **Svelte 5** using runes (`$props()`, `$state()`, `$derived()`).

### Cards

#### `PostCard` _(client-only, `apps/client/src/components/home/`)_

Home feed card. Polaroid image with tape strips, tilt on hover, "this one →" pop-in callout. Stat row uses SVG icons (not emoji).

| Prop           | Type       | Default  | Description                              |
| -------------- | ---------- | -------- | ---------------------------------------- |
| `title`        | `string`   | required | Post title                               |
| `excerpt`      | `string`   | `""`     | Post description                         |
| `tags`         | `string[]` | required | Array of uppercase tag keys              |
| `readTime`     | `string`   | `""`     | e.g. `"4 min read"`                      |
| `date`         | `string`   | `""`     | Formatted publish date                   |
| `imageUrl`     | `string`   | `""`     | Optional hero image                      |
| `href`         | `string`   | required | Link destination                         |
| `claps`        | `number`   | `0`      | Clap count (shown with hand SVG icon)    |
| `commentCount` | `number`   | `0`      | Comment count (shown with chat SVG icon) |
| `index`        | `number`   | `0`      | Position in feed                         |

#### `PostHero`

Post page header — back link, date/tags/readtime row, Fraunces serif title, scribble SVG underline.

| Prop       | Type       | Default         | Description                 |
| ---------- | ---------- | --------------- | --------------------------- |
| `title`    | `string`   | required        | Post title                  |
| `tags`     | `string[]` | `["EDITORIAL"]` | Array of uppercase tag keys |
| `readTime` | `string`   | `"5 min read"`  | Reading time estimate       |
| `pubDate`  | `Date`     | required        | Publish date                |
| `backHref` | `string`   | `"/"`           | Back link destination       |

Title font: Fraunces serif, `2.4rem` desktop → `1.7rem` mobile.

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

---

### Layout

#### `Navbar`

Sticky header (`z-index: 100`). Desktop: logo + nav links + search bar + SVG bookmark button + theme toggle. Mobile: logo + theme toggle + hamburger → dropdown with search + nav links + saved.

| Prop        | Type        | Description                         |
| ----------- | ----------- | ----------------------------------- |
| `links`     | `NavLink[]` | Array of `{ label, href, active? }` |
| `postCount` | `number`    | Total post count shown next to logo |

Theme persisted to `localStorage` as `bb-theme`. Bookmark count read from `localStorage` keys prefixed `bb-bookmark-`.

#### `Footer`

| Prop        | Type     | Description                            |
| ----------- | -------- | -------------------------------------- |
| `wordCount` | `number` | Total words across all published posts |

#### `BunLogo`

Standalone logo mark. No props.

---

### Post

#### `BookmarkButton`

Saves/removes a post from `localStorage`. Updates navbar badge count via `storage` event.

| Prop   | Type     | Description                           |
| ------ | -------- | ------------------------------------- |
| `slug` | `string` | Post slug — key: `bb-bookmark-{slug}` |

#### `ReactionBar`

Clap reaction strip below post body. Fetches/submits via `/api/claps/[slug]`.

| Prop   | Type     | Description |
| ------ | -------- | ----------- |
| `slug` | `string` | Post slug   |

#### `ReadingProgress`

Fixed thin bar at top of viewport tracking scroll position. No props.

---

### Inputs

#### `EmailInput`

Newsletter subscription input. Submits to `/api/newsletter`.

| Prop          | Type     | Description            |
| ------------- | -------- | ---------------------- |
| `placeholder` | `string` | Input placeholder text |

#### `Button`

| Prop      | Type                   | Description      |
| --------- | ---------------------- | ---------------- |
| `variant` | `"primary" \| "ghost"` | Visual style     |
| `type`    | `string`               | HTML button type |

#### `BackButton`

| Prop   | Type     | Description      |
| ------ | -------- | ---------------- |
| `href` | `string` | Back destination |

---

## Pages

| Route           | File                 | Type   | Notes                                                            |
| --------------- | -------------------- | ------ | ---------------------------------------------------------------- |
| `/`             | `index.astro`        | SSR    | Home feed, hero, ticker, newsletter bar                          |
| `/[slug]`       | `[slug].astro`       | Static | Post detail — PostHero, prose body, reactions, comments, related |
| `/archive`      | `archive.astro`      | SSR    | All posts with search + tag filter                               |
| `/topics`       | `topics/index.astro` | Static | Tag index                                                        |
| `/topics/[tag]` | `topics/[tag].astro` | Static | Posts filtered by tag                                            |
| `/saved`        | `saved.astro`        | Static | Bookmarked posts (localStorage)                                  |
| `/about`        | `about.astro`        | Static | Author page with polaroid + sticky notes                         |
| `/now`          | `now.astro`          | Static | /now page — sticky-note cards                                    |
| `/changelog`    | `changelog.astro`    | Static | Version history — sticky-note cards                              |
| `/help`         | `help.astro`         | Static | Help page                                                        |
| `/privacy`      | `privacy.astro`      | Static | Privacy policy                                                   |
| `/terms`        | `terms.astro`        | Static | Terms of service                                                 |
| `/404`          | `404.astro`          | Static | Not found                                                        |

---

## Data Files

| File                                | Purpose                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `apps/client/src/data/changelog.ts` | Changelog entries — `ChangelogEntry[]`, newest-first. Edit here to add versions or entries. |
| `apps/client/src/content/posts/`    | MDX post files with frontmatter validated against `packages/types`                          |

---

## Scrollbar

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
::selection {
  background: var(--accent);
  color: #fff;
}
```

Stretched links (full-card click targets): `position: absolute; inset: 0; z-index: 0` with content at `z-index: 10` above.

Decorative SVGs always have `aria-hidden="true"`. Back links and icon-only buttons have visible text or `aria-label`.

---

## Post Body Prose

Post content is wrapped in a Tailwind Typography (`prose`) block. Key overrides in `[slug].astro`:

| Element      | Style                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| `p`          | `0.94rem`, `1.9` line-height, `var(--muted)`, `text-wrap: pretty`, `mb-5` |
| `li`         | `0.94rem`, `1.9` line-height, `var(--muted)`                              |
| `h2`         | `1.1rem`, semibold, `var(--text)`, `mt-10 mb-4`                           |
| `h3`         | `0.95rem`, semibold, `var(--text)`, `mt-7 mb-3`                           |
| `a`          | `var(--accent)`, no underline, underline on hover                         |
| `code`       | `var(--bg2)` background, `0.82em`, `px-1 py-0.5 rounded`                  |
| `pre`        | `var(--bg2)` background, `0.82em`, rounded, overflow scroll               |
| `blockquote` | `2px` left border `var(--accent)`, `var(--bg2)` background, not-italic    |
| `figcaption` | `0.7rem`, centered, `var(--muted2)`, `mt-[-20px]`                         |
| `hr`         | `var(--divider)`, `my-8`                                                  |

### In-body Images

Full-width, break out of container padding on mobile:

```css
@media (max-width: 640px) {
  .post-content img {
    margin-left: -2rem;
    margin-right: -2rem;
    width: calc(100% + 4rem);
    border-radius: 0;
  }
}
```

### Image Snippet Pattern

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
| `anonName`     | `(seed: string) => string` | Deterministic anonymous display name for commenters.                      |

---

## Email Design

Emails use inline styles (no CSS classes) for mail client compatibility. Same warm palette as the site.

| Token           | Value                                              |
| --------------- | -------------------------------------------------- |
| Background      | `#fdf9f4`                                          |
| Card background | `#f5ede0`                                          |
| Card border     | `#e0d4c0`                                          |
| Primary text    | `#231e17`                                          |
| Muted text      | `#9c8b78`                                          |
| Caption text    | `#c5b8a8`                                          |
| Accent          | `#c4832a`                                          |
| CTA button      | `background: #c4832a; color: #fff`                 |
| Font            | IBM Plex Mono via Google Fonts, monospace fallback |
| Max width       | `560px`                                            |
| Border radius   | `4px` (card), `3px` (button)                       |

| Template     | Function                 | Trigger                |
| ------------ | ------------------------ | ---------------------- |
| Welcome      | `welcomeEmailHtml()`     | Newsletter subscribe   |
| New post     | `newPostEmailHtml()`     | Post publish           |
| Issue report | `issueReportEmailHtml()` | Report form submission |

All bulk sends include `List-Unsubscribe` header and plain-text fallback.

---

## SEO & Meta

Managed in `apps/client/src/layouts/Layout.astro`:

- `<title>` — `{pageTitle} · Blab Bun` or just `Blab Bun`
- `viewport` — `width=device-width, initial-scale=1`
- `og:type` — `"website"` (default) or `"article"` (post pages)
- `og:image` — post hero image; Twitter card switches to `summary_large_image`
- `og:image:width/height` — `1200 × 630`
- Canonical URL
- JSON-LD `WebSite` schema (all pages) + `BlogPosting` schema (post pages)
- RSS autodiscovery → `/rss.xml`
- `theme-color` — `#fdf9f4` light / `#16120e` dark

---

## File Structure

```
apps/
  client/
    src/
      data/
        changelog.ts      Version history data — edit here to add entries
      pages/
        index.astro       Home feed
        [slug].astro      Post detail
        archive.astro     All posts
        saved.astro       Bookmarked posts
        about.astro       About page
        now.astro         /now page
        changelog.astro   /changelog page
        topics/
          index.astro
          [tag].astro
      layouts/
        Layout.astro      Shared HTML shell, fonts, SEO, theme flash prevention
      components/
        home/             HomeFeed, PostCard, NewsletterBar, ScribbleDivider, Ticker
        archive/          ArchiveList
        saved/            SavedFeed
        post/             Comments, ClapShare, FloatingNewsletter, WelcomeConfetti
        layouts/          ScrollToTop
        search/           SearchDropdown
  admin/
    src/
      pages/
        posts.astro       Post editor + live preview (mirrors client post layout)
        index.astro       Dashboard stats
        comments.astro    Comments CRUD
        claps.astro       Claps CRUD
        subscribers.astro Subscribers CRUD
        admin-users.astro Admin user management

packages/
  ui/
    components/
      buttons/    BackButton, Button
      cards/      ArticleCard, PostHero
      inputs/     EmailInput
      layouts/    BunLogo, Footer, Navbar
      post/       BookmarkButton, ReactionBar, ReadingProgress
    styles/
      global.css  Token definitions, tag badge rules, animations, utilities
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
