# About Page Design

**Date:** 2026-04-20
**Status:** Approved

## Overview

A minimal, static `/about` page for The Lunan blog. No photo. Single centered column. Tone: casual, warm — like a friend you talk to every day.

## Layout

- Route: `apps/client/src/pages/about.astro`
- Wraps in existing `Layout.astro`
- Top padding `pt-[64px]` to clear fixed navbar (same as all other pages)
- Max width `760px`, centered, horizontal padding `px-4 md:px-8`

## Sections (top to bottom)

1. **Pill badge** — `ABOUT` in the site's `#ccf05f` yellow pill (matches homepage `Personal Blog` badge)
2. **Heading** — `"hey, I'm Lunan."` in Space Grotesk, large, tracking tight, `#2d5a3d`
3. **Divider** — short `2px` green bar, same as homepage
4. **Body copy** — 2 short paragraphs in Manrope, muted green-grey (`rgba(41,48,45,0.65)`):
   - _"This is my little corner of the internet. No agenda, no niche, no 'personal brand.' Just me writing about whatever's on my mind — life, opinions, the stuff I'd rant about to a friend over a late night."_
   - _"Some of it's half-baked. Some of it's stuff I'll probably cringe at later. That's kind of the point."_
5. **Archive link** — `← Back to archive` styled like the post page footer link

## Styling Constraints

- Fonts: `font-space-grotesk` (headings), `font-manrope` (body) — already loaded globally
- Color palette: `#386547`, `#2d5a3d`, `#c5f7d0`, `#ccf05f`, `rgba(41,48,45,*)` — no new colors
- No new components — plain Astro page only
- No image, no card wrapper, no extra sections

## Out of Scope

- Social links
- Contact form
- Dynamic data
