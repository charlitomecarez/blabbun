# Admin Post Preview — Design Spec

**Date:** 2026-04-30
**Status:** Approved

## Summary

Add a live side-by-side preview panel to the admin post editor (`posts.astro`). As the user types, the right panel renders a styled preview matching the blabbun.com post layout.

---

## Layout

Wrap the existing form container and a new preview panel in a flex row:

```html
<div style="display:flex; gap:24px; align-items:flex-start">
  <!-- existing form div → flex:1; min-width:0 -->
  <!-- new preview panel → flex:1; min-width:0; position:sticky; top:24px -->
</div>
```

The form and preview each take half the available width. The preview panel is `position:sticky; top:24px` so it stays in view while the user scrolls the form.

---

## Preview Panel Structure

Mirrors the blabbun.com post layout using the same inline style tokens (`#fdf9f4`, `#f5ede0`, `#e0d4c0`, `#c4832a`, IBM Plex Mono):

1. **Cover image** — shown if `f-image` has a value; hidden otherwise
2. **Header bar** — blab bun logo text + "preview" badge (muted)
3. **Date** — formatted from `f-pubDate` (e.g. "April 30, 2026"); falls back to "—" if empty
4. **Title** — from `f-title`; falls back to muted "untitled"
5. **Description** — from `f-description`
6. **Divider**
7. **Body** — MDX textarea content rendered as Markdown via `marked`; prose-styled

Empty state (all fields blank): centered muted text "start typing to preview".

---

## Live Updates

A single `updatePreview()` function reads all relevant form fields and re-renders the panel. It is called on:

- `input` events on: `f-title`, `f-description`, `f-pubDate`, `f-image`, `f-content`
- After `editPost()` populates the form (called at end of that function)
- After `resetForm()` clears the form (called at end of that function)

Markdown is rendered with `marked` (synchronous, no async needed). MDX-specific syntax (imports, `<Component />`) that `marked` cannot parse is passed through as raw text — acceptable for a preview.

---

## Dependencies

- **`marked`** added to `apps/admin` dependencies (npm)

---

## Scope

Changes are confined to:
- `apps/admin/package.json` — add `marked`
- `apps/admin/src/pages/posts.astro` — layout wrapper, preview panel HTML, `updatePreview()` in `<script>`

No changes to `github.ts`, API routes, or any other file.

---

## Out of Scope

- MDX component rendering (custom `<Callout>`, `<Image>` etc.) — not feasible in-browser
- Syntax highlighting in the preview body
- Mobile/responsive layout adjustments
