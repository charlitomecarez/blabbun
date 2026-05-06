# Changelog Page — Design Spec

**Goal:** A `/changelog` page that lists all app versions and their changes, with an entry point from `/about`. Content is managed via a TypeScript data file so new versions can be added without touching the page template.

---

## Data Layer

**File:** `apps/client/src/data/changelog.ts`

```ts
export type ChangeType = "feat" | "fix" | "improvement";

export interface ChangelogChange {
  type: ChangeType;
  description: string;
}

export interface ChangelogEntry {
  version: string;    // e.g. "v1.2.0"
  date: string;       // e.g. "May 2026"
  label?: string;     // optional codename e.g. "Design Overhaul"
  changes: ChangelogChange[];
}

export const changelog: ChangelogEntry[] = [ /* entries, newest first */ ];
```

Entries are ordered newest-first. The first entry in the array is always treated as the current version. Pre-populated entries:

| Version | Date | Label | Notes |
|---|---|---|---|
| v1.2.0 | May 2026 | Design Overhaul | Everything from this session: design consistency, font fixes, admin preview rewrite, `<br/>` fix |
| v1.1.0 | Apr 2026 | — | Matches git tag `1.1.0` — search, infinite scroll, floating newsletter, comments, claps, admin auth |
| v1.0.1 | Apr 2026 | — | Matches git tag `1.0.1` — bug fixes |
| v1.0.0 | Apr 2026 | — | Initial launch |

---

## Page

**Route:** `/changelog` (`apps/client/src/pages/changelog.astro`)

**Layout:** Uses the shared `Layout.astro` wrapper (Navbar, Footer, theme).

### Structure (top to bottom)

1. **Back link** — Caveat cursive `← back to the blabs`, `color: var(--accent)`, same pattern as `/about` and `/now`

2. **Header row** — Fraunces serif h1 `/changelog` at `2.6rem / font-weight:600 / letter-spacing:-0.03em`, inline Caveat subtitle `"what changed & when"` at `1.3rem / color:var(--accent) / rotate(-3deg)` — same layout as `/now` header

3. **Subtitle line** — `font-size:0.78rem; color:var(--muted)` — `"a living record of what broke, what got fixed, and what actually shipped."`

4. **Version cards** — one sticky-note card per `ChangelogEntry`, rendered newest-first:
   - Container: `background:var(--bg2); border:1.5px solid var(--text); padding:22px 26px; transform:rotate(Xdeg); box-shadow:4px 4px 0 var(--text); position:relative` — alternating small rotations (-0.6, 0.8, -0.4, 0.5 deg), same as `/now`
   - Tape strip at top: `.tape` div, same as other pages
   - **Current badge** (first entry only): Caveat `✦ current` — `background:var(--accent); color:#fff; font-size:1rem; padding:3px 12px; border-radius:12px; transform:rotate(4deg); box-shadow:2px 2px 0 var(--text)` — positioned `top:-12px; right:20px`
   - **Version + date row**: Fraunces italic `font-size:1.4rem / font-weight:500 / color:var(--text)` for version number; Caveat `font-size:1rem / color:var(--muted)` for date; optional label in Caveat `color:var(--accent)`
   - **Scribble SVG divider** between header and change list (same inline SVG pattern used elsewhere)
   - **Change list**: grouped by type. Each change is a row: type badge + description text
     - `feat` badge → `tag-lifestuff` class (green)
     - `fix` badge → `tag-rants` class (red)
     - `improvement` badge → `tag-halfbaked` class (amber)
     - Badge style: same `.tag-badge` sizing as PostCard (`font-size:0.68rem; padding:2px 8px; border-radius:2px; letter-spacing:0.04em; font-weight:500`)
     - Description: `font-size:0.88rem; color:var(--text); line-height:1.6`

5. **Footer note** — Caveat `"more history lives in the git log ✶"` with a link to the GitHub repo commits, `color:var(--muted); font-size:1rem`

### Container

```astro
<main class="mx-auto min-h-[60vh] w-full max-w-[680px] flex-1 px-4 py-6 sm:px-8 sm:py-10">
```

Matches `/now` and `/about` exactly.

---

## Entry Point on `/about`

Add a fifth sticky-note card to the existing 4-card row at the bottom of `about.astro`. Same style as the other cards (min-width:200px, flex:1, bg2, border, box-shadow, tape strip). Content:

```
changelog →        ← Caveat, color:var(--accent), 0.95rem
v1.2.0 · May 2026  ← IBM Plex Mono, color:var(--text), 0.84rem
```

The entire card is wrapped in an `<a href="/changelog">` stretched link so the full card is clickable. Rotation: `rotate(1.0deg)` to vary from the others.

---

## What Is Not Included

- No navbar link — changelog is discoverable via about, not a primary destination
- No search or filtering within the page — there are only a handful of versions
- No pagination — all versions on one page
- No RSS feed for changelog
- No admin UI for managing changelog — it's a code file, edited with a deploy

---

## Files Touched

| File | Change |
|---|---|
| `apps/client/src/data/changelog.ts` | **Create** — data file with all entries |
| `apps/client/src/pages/changelog.astro` | **Create** — new page |
| `apps/client/src/pages/about.astro` | **Modify** — add fifth sticky card linking to /changelog |
