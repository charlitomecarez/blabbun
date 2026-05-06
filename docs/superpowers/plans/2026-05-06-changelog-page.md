# Changelog Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/changelog` page that lists all app versions and their changes, driven by a TypeScript data file, with an entry-point sticky card added to the `/about` page.

**Architecture:** Three files total — a data file (`changelog.ts`) that owns all version content, a new Astro page (`changelog.astro`) that renders it using the same sticky-note card aesthetic as `/now` and `/about`, and a one-card addition to `about.astro` that links to the new page. No new dependencies.

**Tech Stack:** Astro 6, Tailwind CSS 4, CSS custom properties, IBM Plex Mono / Fraunces / Caveat fonts (already loaded globally).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/client/src/data/changelog.ts` | **Create** | Types + all version data, newest-first |
| `apps/client/src/pages/changelog.astro` | **Create** | Renders entries as sticky-note cards |
| `apps/client/src/pages/about.astro` | **Modify** | Add fifth card linking to `/changelog` |

---

### Task 1: Create the changelog data file

**Files:**
- Create: `apps/client/src/data/changelog.ts`

- [ ] **Step 1: Create the file with types and all four version entries**

```ts
// apps/client/src/data/changelog.ts

export type ChangeType = "feat" | "fix" | "improvement";

export interface ChangelogChange {
  type: ChangeType;
  description: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  label?: string;
  changes: ChangelogChange[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "v1.2.0",
    date: "May 2026",
    label: "Design Overhaul",
    changes: [
      { type: "improvement", description: "Enforced design consistency across all pages — unified h1 sizes, container padding, and Tailwind class patterns" },
      { type: "fix", description: "Raised base font-size from 15px to 16px and bumped post body text to 0.94rem for better reading comfort" },
      { type: "improvement", description: "Added initial-scale=1 to viewport meta" },
      { type: "feat", description: "Matched admin post preview layout to the client — Fraunces title, Caveat date, tag badges, read time, scribble underline, and prose-styled body" },
      { type: "fix", description: "Admin preview now shows accurate spacing for standalone <br/> tags between paragraphs, preventing writers from over-adding breaks" },
      { type: "fix", description: "Replaced emoji icons (🔖 bookmark, 👏 clap, 💬 comment) with SVG icons in Navbar and PostCard" },
      { type: "fix", description: "Fixed topics/[tag].astro postItems type: tag (string) → tags (array) to match ArchiveList expectation" },
      { type: "feat", description: "Loaded Fraunces and Caveat fonts in admin layout — they were missing, causing preview font fallbacks" },
    ],
  },
  {
    version: "v1.1.0",
    date: "Apr 2026",
    changes: [
      { type: "feat", description: "Search dropdown with live filtering across all posts" },
      { type: "feat", description: "Infinite scroll on the home feed" },
      { type: "feat", description: "Floating newsletter card on post pages" },
      { type: "feat", description: "Comments system with nested replies" },
      { type: "feat", description: "Clap reactions with per-IP deduplication" },
      { type: "feat", description: "Admin authentication" },
      { type: "feat", description: "Zine quote card injected into home feed" },
      { type: "improvement", description: "Dark mode as default theme" },
      { type: "improvement", description: "Email templates migrated to dark mode palette with Fraunces typography" },
      { type: "improvement", description: "Search dropdown UX and styling refined" },
    ],
  },
  {
    version: "v1.0.1",
    date: "Apr 2026",
    changes: [
      { type: "feat", description: "Saved posts feed with bookmark persistence" },
      { type: "feat", description: "Admin post editor: image snippet generator and real-time word count" },
      { type: "feat", description: "Mobile-responsive admin sidebar and post editor" },
      { type: "improvement", description: "BIMI logo support and updated email header branding" },
      { type: "improvement", description: "List-unsubscribe headers added to notification emails" },
      { type: "fix", description: "Related post ranking logic improved" },
    ],
  },
  {
    version: "v1.0.0",
    date: "Apr 2026",
    label: "Initial Launch",
    changes: [
      { type: "feat", description: "Public blog with MDX posts, tag system, and archive" },
      { type: "feat", description: "Admin dashboard for managing posts, comments, claps, and subscribers" },
      { type: "feat", description: "Supabase integration for comments, claps, and newsletter subscribers" },
      { type: "feat", description: "RSS feed, sitemap, and OG image support" },
      { type: "feat", description: "Light/dark theme with paper grain texture" },
      { type: "feat", description: "Deployed to Vercel with Cloudflare Workers adapter" },
    ],
  },
];
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun/apps/client && pnpm lint 2>&1 | grep -v "cloudflare:workers"
```

Expected: no new errors beyond the pre-existing `cloudflare:workers` module warning.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/data/changelog.ts
git commit -m "feat: add changelog data file with v1.0.0–v1.2.0 entries"
```

---

### Task 2: Create the changelog page

**Files:**
- Create: `apps/client/src/pages/changelog.astro`

The page mirrors `/now` — sticky-note cards with tape, slight rotations, box-shadow. Each `ChangelogEntry` becomes one card. The first entry (newest) gets a `✦ current` badge.

Change type badges reuse the global tag CSS classes from `packages/ui/styles/global.css`:
- `feat` → `tag-lifestuff` (green)
- `fix` → `tag-rants` (red)
- `improvement` → `tag-halfbaked` (amber)

- [ ] **Step 1: Create the page file**

```astro
---
// apps/client/src/pages/changelog.astro
import { changelog } from "@/data/changelog";
import Layout from "@/layouts/Layout.astro";

const rotations = [-0.6, 0.8, -0.4, 0.5, -0.7, 0.6, -0.3, 0.9];

function badgeClass(type: string): string {
  if (type === "feat") return "tag-lifestuff";
  if (type === "fix") return "tag-rants";
  return "tag-halfbaked";
}
---

<Layout
  title="Changelog"
  description="A living record of what changed in Blab Bun — versions, fixes, and new features."
>
  <main
    class="mx-auto min-h-[60vh] w-full max-w-[680px] flex-1 px-4 py-6 sm:px-8 sm:py-10"
  >
    <div style="animation:fadeIn 0.2s ease">
      <!-- back -->
      <a
        href="/"
        style="color:var(--accent);font-family:'Caveat',cursive;font-size:1.1rem;
               text-decoration:none;padding:0;display:inline-block;margin-bottom:24px"
      >
        ← back to the blabs
      </a>

      <!-- header row -->
      <div
        style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:8px"
      >
        <h1
          style="font-family:'Fraunces',serif;font-size:2.6rem;font-weight:600;letter-spacing:-0.03em"
        >
          /changelog
        </h1>
        <span
          style="font-family:'Caveat',cursive;font-size:1.3rem;color:var(--accent);
                     transform:rotate(-3deg);display:inline-block"
        >
          what changed &amp; when
        </span>
      </div>

      <!-- subtitle -->
      <div
        style="font-size:0.78rem;color:var(--muted);margin-bottom:36px;line-height:1.7"
      >
        a living record of what broke, what got fixed, and what actually shipped.
      </div>

      <!-- version cards -->
      <div style="display:flex;flex-direction:column;gap:28px;max-width:620px">
        {
          changelog.map((entry, i) => (
            <div
              style={`background:var(--bg2);border:1.5px solid var(--text);
                       padding:22px 26px;transform:rotate(${rotations[i % rotations.length]}deg);
                       box-shadow:4px 4px 0 var(--text);position:relative`}
            >
              <div
                class="tape"
                style="top:-10px;left:30px;transform:rotate(-4deg)"
              />

              {i === 0 && (
                <span
                  class="handwritten"
                  style="position:absolute;top:-12px;right:20px;
                             background:var(--accent);color:#fff;font-size:1rem;
                             padding:3px 12px;border-radius:12px;transform:rotate(4deg);
                             box-shadow:2px 2px 0 var(--text);white-space:nowrap"
                >
                  ✦ current
                </span>
              )}

              <!-- version + date + label -->
              <div
                style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:14px"
              >
                <span
                  style="font-family:'Fraunces',serif;font-style:italic;font-size:1.4rem;
                             font-weight:500;color:var(--text)"
                >
                  {entry.version}
                </span>
                <span
                  style="font-family:'Caveat',cursive;font-size:1rem;color:var(--muted)"
                >
                  {entry.date}
                </span>
                {entry.label && (
                  <span
                    style="font-family:'Caveat',cursive;font-size:1rem;color:var(--accent)"
                  >
                    — {entry.label}
                  </span>
                )}
              </div>

              <!-- scribble divider -->
              <svg
                width="100%"
                height="10"
                viewBox="0 0 300 10"
                preserveAspectRatio="none"
                style="margin-bottom:14px;display:block"
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

              <!-- change list -->
              <div style="display:flex;flex-direction:column;gap:8px">
                {entry.changes.map((change) => (
                  <div style="display:flex;gap:10px;align-items:flex-start">
                    <span
                      class={badgeClass(change.type)}
                      style="font-size:0.62rem;padding:2px 7px;border-radius:2px;
                                 letter-spacing:0.04em;font-weight:500;white-space:nowrap;
                                 flex-shrink:0;margin-top:2px"
                    >
                      {change.type}
                    </span>
                    <span
                      style="font-size:0.88rem;color:var(--text);line-height:1.6"
                    >
                      {change.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>

      <!-- footer note -->
      <div
        style="margin-top:48px;padding-top:24px;border-top:1px dashed var(--border);
                  font-family:'Caveat',cursive;font-size:1.05rem;color:var(--muted)"
      >
        more history lives in the{" "}
        <a
          href="https://github.com/charlitomecarez/blabbun/commits/main"
          target="_blank"
          rel="noopener noreferrer"
          style="color:var(--accent);text-decoration:none"
        >
          git log
        </a>{" "}
        ✶
      </div>
    </div>
  </main>

  <style>
    @media (max-width: 640px) {
      h1 {
        font-size: 1.9rem !important;
      }
    }
  </style>
</Layout>
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun/apps/client && pnpm lint 2>&1 | grep -v "cloudflare:workers"
```

Expected: no new errors.

- [ ] **Step 3: Spot-check in browser**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm dev:client
```

Navigate to `http://localhost:4321/changelog`. Verify:
- Four version cards visible, newest at top
- `✦ current` badge on v1.2.0 card only
- Each card has tape strip, slight rotation, box-shadow
- `feat` badges are green, `fix` badges are red, `improvement` badges are amber
- Footer git log link present
- Dark and light mode both look correct (toggle with the theme button)
- Mobile at 375px: cards stack, rotations visible, no horizontal scroll

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/pages/changelog.astro
git commit -m "feat: add /changelog page with sticky-note version cards"
```

---

### Task 3: Add changelog entry point to /about

**Files:**
- Modify: `apps/client/src/pages/about.astro:146-176`

Add a fifth sticky card to the existing four-card flex row. The card links to `/changelog` using a stretched `<a>` element so the entire card is clickable.

- [ ] **Step 1: Add the fifth card to about.astro**

In `apps/client/src/pages/about.astro`, find the four-card array (around line 146) and replace it with:

```astro
      <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:24px">
        {
          [
            [
              "currently reading",
              "whatever's been open in a tab too long",
              -1.5,
            ],
            ["currently thinking about", "why everything has a vibe now", 1.2],
            ["last updated", "Apr 2026", -0.8],
            ["favorite snack", "also bread (no comment)", 1.8],
          ].map(([k, v, r]) => (
            <div
              style={`min-width:200px;flex:1 1 200px;background:var(--bg2);
                       border:1.5px solid var(--text);padding:14px 16px;
                       transform:rotate(${r}deg);box-shadow:3px 3px 0 var(--text);position:relative`}
            >
              <div
                class="tape"
                style="top:-9px;left:20px;width:40px;height:14px;transform:rotate(-5deg);opacity:0.6"
              />
              <div style="font-family:'Caveat',cursive;font-size:0.95rem;color:var(--accent);margin-bottom:4px">
                {k} →
              </div>
              <div style="font-size:0.84rem;color:var(--text);line-height:1.5">
                {v}
              </div>
            </div>
          ))
        }

        <!-- changelog card -->
        <a
          href="/changelog"
          style="min-width:200px;flex:1 1 200px;background:var(--bg2);
                 border:1.5px solid var(--text);padding:14px 16px;
                 transform:rotate(1deg);box-shadow:3px 3px 0 var(--text);
                 position:relative;text-decoration:none;display:block;
                 transition:transform 0.15s;"
          onmouseenter="this.style.transform='rotate(1deg) translate(-2px,-2px)'"
          onmouseleave="this.style.transform='rotate(1deg)'"
        >
          <div
            class="tape"
            style="top:-9px;left:20px;width:40px;height:14px;transform:rotate(-5deg);opacity:0.6"
          />
          <div style="font-family:'Caveat',cursive;font-size:0.95rem;color:var(--accent);margin-bottom:4px">
            changelog →
          </div>
          <div style="font-size:0.84rem;color:var(--text);line-height:1.5">
            v1.2.0 · May 2026
          </div>
        </a>
      </div>
```

- [ ] **Step 2: Verify lint passes**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun/apps/client && pnpm lint 2>&1 | grep -v "cloudflare:workers"
```

Expected: no new errors.

- [ ] **Step 3: Spot-check the about page**

Navigate to `http://localhost:4321/about`. Verify:
- Five cards in the row (may wrap on smaller viewports — that's expected)
- Changelog card is clickable (entire card), hover lifts it slightly
- Clicking navigates to `/changelog`
- Card rotation, tape, and box-shadow match the other four cards

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/pages/about.astro
git commit -m "feat: add changelog entry-point card to /about page"
```

---

## Final Build Check

- [ ] **Run full client build**

```bash
cd /Users/charlitojrmecarez/Documents/GitHub/blabbun && pnpm build 2>&1 | tail -20
```

Expected: exits 0, `/changelog` appears in the build output as a static route.

- [ ] **Check sitemap picks up /changelog**

After build, confirm `apps/client/dist/sitemap-0.xml` includes `/changelog`.
