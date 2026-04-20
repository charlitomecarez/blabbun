# Related Posts Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "More from The Lunan" section below each blog post showing 3 randomly-selected posts (excluding the current one) as cards with image, tag, title, and excerpt.

**Architecture:** All logic is inline in the existing `[slug].astro` page — no new components or files. Post selection is Fisher-Yates shuffled at build time in the frontmatter. Card markup is plain Astro/HTML with Tailwind.

**Tech Stack:** Astro, Tailwind CSS, `astro:content` `getCollection`

---

### Task 1: Add related posts section to `[slug].astro`

**Files:**

- Modify: `apps/client/src/pages/[slug].astro`

- [ ] **Step 1: Add the related posts query to the frontmatter**

In `apps/client/src/pages/[slug].astro`, add this code after line 21 (`const hasImage = !!post.data.image;`) and before the closing `---`:

```ts
const allPosts = await getCollection("posts", ({ data }) => !data.draft);
const otherPosts = allPosts.filter((p) => p.id !== post.id);

// Fisher-Yates shuffle
const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const relatedPosts = shuffle(otherPosts)
  .slice(0, 3)
  .map((p) => ({
    title: p.data.title,
    description: p.data.description,
    tag: (p.data.tags?.[0] ?? "EDITORIAL").toUpperCase(),
    image: p.data.image ?? null,
    href: `/${p.id}`,
  }));
```

- [ ] **Step 2: Add the related posts section HTML after `</article>`**

In `apps/client/src/pages/[slug].astro`, replace the closing structure at lines 114–116:

```astro
    </article>
  </div>
</Layout>
```

with:

```astro
<!-- ─── Related Posts ───────────────────────────────────────── -->{
  relatedPosts.length > 0 && (
    <section class="mx-auto max-w-[1200px] px-4 pb-20 md:px-8">
      <div class="mb-6 border-t-2 border-[#c5f7d0] pt-8">
        <span class="font-manrope text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase">
          More from The Lunan
        </span>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {relatedPosts.map((p) => (
          <a
            href={p.href}
            class="group block overflow-hidden rounded-[12px] border border-[rgba(197,247,208,0.4)] bg-white transition-shadow hover:shadow-md"
          >
            {p.image ? (
              <img
                src={p.image}
                alt={p.title}
                class="h-[140px] w-full rounded-t-[12px] object-cover"
              />
            ) : (
              <div class="h-[140px] w-full rounded-t-[12px] bg-gradient-to-br from-[#c5f7d0] to-[#e1eae5]" />
            )}
            <div class="p-4">
              <span class="font-manrope inline-block rounded-full bg-[#ebf3ed] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.08em] text-[#386547] uppercase">
                {p.tag}
              </span>
              <p class="font-space-grotesk mt-2 line-clamp-2 text-[16px] leading-[1.3] font-bold text-[#29302d]">
                {p.title}
              </p>
              <p class="font-manrope mt-1 line-clamp-2 text-[13px] leading-[1.5] text-[rgba(41,48,45,0.55)]">
                {p.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify the build passes**

Run: `pnpm --filter @thelunan/client build`

Expected: Build completes with no errors. The `[slug]` pages are generated with the related posts section.

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/pages/\[slug\].astro
git commit -m "feat: add related posts section to blog post pages"
```
