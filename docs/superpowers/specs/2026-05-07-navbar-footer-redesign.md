# Navbar & Footer Redesign

**Date:** 2026-05-07
**Status:** Approved
**Scope:** `packages/ui/components/layouts/Navbar.svelte` + `packages/ui/components/layouts/Footer.svelte`

---

## Summary

Refresh the Navbar and Footer with more character and interactivity while staying true to the existing design system (warm parchment palette, IBM Plex Mono + Caveat + Fraunces type hierarchy, paper-grain aesthetic). No structural changes — same layout, same data flow, same props.

---

## Navbar Changes

### Logo
- Logo image/icon gains a **tilt + scale on hover**: `transform: rotate(8deg) scale(1.08)` with `transition: transform 0.2s ease` and `transform-origin: center bottom`.
- Logo text (`blab bun.`) transitions to `var(--accent)` on hover (`transition: color 0.15s`).

### Nav Links
- On hover (and when `active`): a **scribble SVG underline slides in from the left** — `opacity 0→1` + `scaleX 0.6→1` from `transform-origin: left` over `0.2s ease`.
- Active link already shows this underline at rest.
- Hover color: `var(--accent)`.
- The SVG uses the existing dark-mode scribble stroke color `#D4A040`.

### Search Bar
- **Pill shape**: `border-radius: 20px` (was `3px`).
- **Expands on focus**: width `160px` → `220px` via `transition: width 0.25s ease`.
- **`/` keyboard hint**: small badge (`0.58rem`, `var(--muted2)`, `bg: var(--bg3)`, `border: var(--border)`, `border-radius: 3px`) positioned `right: 10px`. Fades out (`opacity: 0`) when the input is focused via `:focus-within` on the wrapper.
- **Accent glow ring on focus**: `box-shadow: 0 0 0 3px var(--accent-soft)` + `border-color: var(--accent)`.
- Search icon transitions to `var(--accent)` when wrapper has `:focus-within`.

### Saved Button
- **Pill shape** to match search: `border-radius: 20px`.
- Hover: `border-color: var(--accent)`, `color: var(--accent)`.

### Theme Toggle
- **Pill shape** to match: `border-radius: 20px`.
- Label uses **Caveat** font (`font-family: 'Caveat', cursive; font-size: 0.92rem`).
- Label text: `"☀ light mode"` (light) / `"◑ dark mode"` (dark).
- Hover: `border-color: var(--accent)`, `color: var(--accent)`.

### Mobile
- Mobile theme toggle keeps existing pill shape, gains Caveat label.
- Mobile hamburger button: no changes.
- Mobile search input inside dropdown: no pill change (full-width, stays rectangular for legibility).

---

## Footer Changes

### Divider
- Replace `border-top: 1px solid var(--divider)` with an **inline SVG scribble wave** — same Q-curve pattern as the scribble underline, stroke `var(--border)` (`#2c241c`), `stroke-width: 1.5`, `height: 12px`, `width: 100%`, `preserveAspectRatio: none`.

### Brand / Tagline
- Replace `"blab bun — writings since whenever"` with a **Caveat** tagline: `"thoughts, unfiltered."` in `var(--accent)`, `font-size: 1.15rem`, `transform: rotate(-0.5deg)`.
- Word count line stays below it: `font-size: 0.62rem`, `color: var(--muted2)`.

### Footer Links
- Each link gets a **slide-in underline on hover** — thin `1px` line, `var(--accent)`, `scaleX 0→1` from `transform-origin: left`, `transition: transform 0.18s ease`.
- Link color transitions to `var(--accent)` on hover.
- RSS badge: unchanged (already has accent border), gains `background: var(--accent-soft)` on hover.

---

## What Does NOT Change

- Props interface (`links`, `postCount` for Navbar; `wordCount` for Footer) — no changes.
- Layout structure (flex row, max-width 680px, padding values).
- Mobile dropdown markup and behavior.
- Bookmark count badge logic.
- Search dispatch events (`search:query`, `search:open`, `search:close`).
- `$state` / `$effect` / `$derived` reactive logic.
- Dark/light mode toggle logic and localStorage persistence.
- All `aria-label` attributes.

---

## Files to Edit

| File | Change |
|------|--------|
| `packages/ui/components/layouts/Navbar.svelte` | Styles on logo, nav links, search, saved btn, theme btn |
| `packages/ui/components/layouts/Footer.svelte` | SVG wave divider, Caveat tagline, link hover underlines |

No new files. No prop changes. No layout changes.

---

## Design Tokens Used

| Token | Usage |
|-------|-------|
| `--accent` (`#d4a040` dark) | Hover color for all interactive elements, scribble stroke, tagline |
| `--accent-soft` (`#2a1e0a` dark) | Search focus glow ring, RSS badge hover bg |
| `--bg3` (`#261f17` dark) | Kbd hint background |
| `--border` (`#2c241c` dark) | SVG scribble wave stroke, kbd hint border |
| `--muted2` (`#4a4038` dark) | Kbd hint text, word count |
| Caveat font | Theme toggle label, footer tagline |
