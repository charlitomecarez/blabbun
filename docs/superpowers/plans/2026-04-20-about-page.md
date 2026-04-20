# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static `/about` page to the Astro client app matching the site's minimal aesthetic.

**Architecture:** Single new Astro page at `apps/client/src/pages/about.astro`, wrapped in the existing `Layout.astro`. No new components, no dynamic data — pure static markup using existing design tokens.

**Tech Stack:** Astro, Tailwind CSS, Space Grotesk + Manrope fonts (already loaded globally)

---

### Task 1: Create the about page

**Files:**

- Create: `apps/client/src/pages/about.astro`

- [ ] **Step 1: Create the file**

`apps/client/src/pages/about.astro`:

```astro
---
import Layout from "@/layouts/Layout.astro";
---

<Layout>
  <main class="pt-[64px]">
    <div class="mx-auto max-w-[760px] px-4 py-16 md:px-8 md:py-24">
      <!-- Pill badge -->
      <span
        class="font-manrope mb-6 inline-block rounded-full bg-[#ccf05f] px-3 py-1 text-[10px] font-bold tracking-[3px] text-[#29302d] uppercase"
      >
        About
      </span>

      <!-- Heading -->
      <h1
        class="font-space-grotesk text-[38px] leading-[1.05] font-bold tracking-[-0.04em] text-[#2d5a3d] sm:text-[46px] md:text-[52px]"
      >
        hey, I&apos;m Lunan<span class="text-[#ccf05f]">.</span>
      </h1>

      <!-- Divider -->
      <div class="my-6 h-[2px] w-10 rounded-full bg-[#386547]"></div>

      <!-- Body copy -->
      <div class="space-y-5">
        <p
          class="font-manrope text-[17px] leading-[1.75] text-[rgba(41,48,45,0.65)]"
        >
          This is my little corner of the internet. No agenda, no niche, no
          &ldquo;personal brand.&rdquo; Just me writing about whatever&apos;s on
          my mind &mdash; life, opinions, the stuff I&apos;d rant about to a
          friend over a late night.
        </p>

        <p
          class="font-manrope text-[17px] leading-[1.75] text-[rgba(41,48,45,0.65)]"
        >
          Some of it&apos;s half-baked. Some of it&apos;s stuff I&apos;ll
          probably cringe at later. That&apos;s kind of the point.
        </p>
      </div>

      <!-- Archive link -->
      <div class="mt-14 border-t border-[rgba(197,247,208,0.4)] pt-8">
        <a
          href="/archive"
          class="font-manrope group inline-flex items-center gap-2 text-[13px] font-semibold text-[rgba(41,48,45,0.5)] transition-colors hover:text-[#386547]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            class="transition-transform group-hover:-translate-x-0.5"
          >
            <path
              d="M13 7H1M6 2L1 7l5 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"></path>
          </svg>
          Back to archive
        </a>
      </div>
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: Verify the dev server renders it**

```bash
pnpm --filter @thelunan/client dev
```

Open `http://localhost:4321/about` and confirm:

- Pill badge shows `ABOUT` in yellow
- Heading reads "hey, I'm Lunan." with yellow period
- Two paragraphs render in muted green-grey
- "Back to archive" link appears at the bottom
- Navbar "About" link highlights correctly on this route

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/pages/about.astro
git commit -m "feat: add about page"
```
