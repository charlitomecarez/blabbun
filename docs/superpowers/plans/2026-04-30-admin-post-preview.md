# Admin Post Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live side-by-side preview panel to the admin post editor that renders a styled post card as the user types.

**Architecture:** Wrap the existing form container and a new preview panel in a flex row inside `posts.astro`. A single `updatePreview()` function reads all form fields, renders Markdown via `marked`, and updates the preview DOM on every `input` event. No new files; all changes are in `posts.astro` and `package.json`.

**Tech Stack:** Astro SSR (Cloudflare Workers), vanilla TypeScript `<script>` block bundled by Vite, `marked` for Markdown rendering, inline CSS matching blabbun.com token set.

---

## File Map

| File | Change |
|---|---|
| `apps/admin/package.json` | Add `marked` dependency |
| `apps/admin/src/pages/posts.astro` | Flex wrapper, preview panel HTML, `updatePreview()` in script |

---

### Task 1: Install `marked`

**Files:**
- Modify: `apps/admin/package.json`

- [ ] **Step 1: Install the package**

```bash
cd apps/admin && pnpm add marked
```

- [ ] **Step 2: Verify it appears in package.json**

```bash
grep '"marked"' apps/admin/package.json
```

Expected output: `"marked": "^x.x.x"`

- [ ] **Step 3: Commit**

```bash
git add apps/admin/package.json pnpm-lock.yaml
git commit -m "chore(admin): add marked for preview markdown rendering"
```

---

### Task 2: Add flex wrapper and preview panel HTML

**Files:**
- Modify: `apps/admin/src/pages/posts.astro` (lines 59–271, the form section)

- [ ] **Step 1: Wrap the form div and add the preview panel**

In `posts.astro`, find this opening tag (line 59):

```html
<Layout title="posts">
  <!-- Editor form -->
  <div
    style="border:1px solid var(--border);border-radius:4px;padding:20px;margin-bottom:24px;background:var(--bg2)"
  >
```

Replace it with a flex wrapper that contains the form and a new preview panel. The `margin-bottom:24px` moves to the outer wrapper:

```html
<Layout title="posts">
  <div style="display:flex;gap:24px;align-items:flex-start;margin-bottom:24px">
  <!-- Editor form -->
  <div
    style="flex:1;min-width:0;border:1px solid var(--border);border-radius:4px;padding:20px;background:var(--bg2)"
  >
```

- [ ] **Step 2: Close the flex wrapper and add the preview panel after the closing `</div>` of the form**

Find the closing `</div>` of the form container (the one that closes the `border:1px solid var(--border)` div, just before `<!-- Post list -->`). Add the preview panel and close the flex wrapper after it:

```html
  </div><!-- end form -->

  <!-- Live preview panel -->
  <div
    id="post-preview"
    style="flex:1;min-width:0;position:sticky;top:24px;border:1px solid var(--border);border-radius:4px;overflow:hidden;background:var(--bg2)"
  >
    <div
      id="preview-empty"
      style="padding:48px 24px;text-align:center;color:var(--muted);font-size:0.75rem"
    >
      start typing to preview
    </div>
    <div id="preview-content" style="display:none">
      <div id="preview-image-wrap" style="display:none">
        <img
          id="preview-image"
          src=""
          alt=""
          style="width:100%;height:200px;object-fit:cover;display:block;border-bottom:1px solid var(--border)"
        />
      </div>
      <div style="padding:20px 24px">
        <div
          style="display:flex;align-items:center;gap:8px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)"
        >
          <span
            style="font-size:0.9rem;font-weight:500;color:#c4832a;letter-spacing:0.04em;font-family:'IBM Plex Mono',monospace"
            >blab bun</span
          >
          <span
            style="font-size:0.62rem;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase"
            >preview</span
          >
        </div>
        <div
          id="preview-date"
          style="font-size:0.65rem;color:var(--muted2);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px"
        >
        </div>
        <div
          id="preview-title"
          style="font-size:1.1rem;font-weight:500;color:var(--text);margin-bottom:10px;line-height:1.4;font-family:'IBM Plex Mono',monospace"
        >
        </div>
        <div
          id="preview-description"
          style="font-size:0.8rem;color:var(--muted);line-height:1.7;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border)"
        >
        </div>
        <div
          id="preview-body"
          style="font-size:0.82rem;color:var(--text);line-height:1.8;overflow-wrap:break-word"
        >
        </div>
      </div>
    </div>
  </div>

  </div><!-- end flex wrapper -->
```

- [ ] **Step 3: Verify the page renders without errors**

```bash
pnpm dev:admin
```

Open `http://localhost:4322/posts` — the page should show the form on the left and the "start typing to preview" placeholder on the right. No console errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/pages/posts.astro
git commit -m "feat(admin): add side-by-side preview panel layout"
```

---

### Task 3: Implement `updatePreview()` and wire up events

**Files:**
- Modify: `apps/admin/src/pages/posts.astro` (the `<script>` block)

- [ ] **Step 1: Add the `marked` import at the top of the `<script>` block**

Find the opening `<script>` tag and add the import as the first line:

```ts
<script>
  import { marked } from "marked";

  const $ = (id: string) =>
```

- [ ] **Step 2: Add `updatePreview()` before the `Object.assign` line at the bottom of the script**

Insert this function before `Object.assign(window, { editPost, deletePost, addTag, resetForm });`:

```ts
  function updatePreview() {
    const title = ($("f-title") as HTMLInputElement)?.value ?? "";
    const description = ($("f-description") as HTMLInputElement)?.value ?? "";
    const pubDate = ($("f-pubDate") as HTMLInputElement)?.value ?? "";
    const image = ($("f-image") as HTMLInputElement)?.value ?? "";
    const content = ($("f-content") as HTMLTextAreaElement)?.value ?? "";

    const isEmpty = !title && !description && !content;

    const emptyEl = document.getElementById("preview-empty");
    const contentEl = document.getElementById("preview-content");
    if (emptyEl) emptyEl.style.display = isEmpty ? "block" : "none";
    if (contentEl) contentEl.style.display = isEmpty ? "none" : "block";
    if (isEmpty) return;

    const imageWrap = document.getElementById("preview-image-wrap");
    const imageEl = document.getElementById("preview-image") as HTMLImageElement | null;
    if (imageWrap && imageEl) {
      imageWrap.style.display = image ? "block" : "none";
      imageEl.src = image;
    }

    const dateEl = document.getElementById("preview-date");
    if (dateEl) {
      dateEl.textContent = pubDate
        ? new Date(pubDate + "T00:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—";
    }

    const titleEl = document.getElementById("preview-title");
    if (titleEl) titleEl.textContent = title || "untitled";

    const descEl = document.getElementById("preview-description");
    if (descEl) descEl.textContent = description;

    const bodyEl = document.getElementById("preview-body");
    if (bodyEl)
      bodyEl.innerHTML = marked.parse(content, { async: false }) as string;
  }
```

- [ ] **Step 3: Wire up input listeners after the slug/title listeners block**

Add after the existing `$("f-title")?.addEventListener("input", ...)` block:

```ts
  ["f-title", "f-description", "f-pubDate", "f-image", "f-content"].forEach(
    (id) => document.getElementById(id)?.addEventListener("input", updatePreview)
  );
  updatePreview();
```

- [ ] **Step 4: Call `updatePreview()` at the end of `resetForm()`**

Find `resetForm()` and add `updatePreview();` as its last line:

```ts
  function resetForm() {
    const form = document.getElementById("post-form") as HTMLFormElement;
    form?.reset();
    ($("f-overwrite") as HTMLInputElement).value = "false";
    slugManuallyEdited = false;
    document.getElementById("form-label")!.textContent = "new post";
    document.getElementById("form-error")!.style.display = "none";
    ($("submit-btn") as HTMLButtonElement).textContent = "save post";
    updatePreview();
  }
```

- [ ] **Step 5: Call `updatePreview()` at the end of `editPost()`**

Find `editPost()` and add `updatePreview();` as the last line before the closing `}`:

```ts
    document
      .getElementById("post-form")
      ?.scrollIntoView({ behavior: "smooth" });
    updatePreview();
  }
```

- [ ] **Step 6: Expose `updatePreview` is NOT needed on window — verify the Object.assign line is unchanged**

The line should still read:
```ts
  Object.assign(window, { editPost, deletePost, addTag, resetForm });
```

`updatePreview` is internal only — do not add it here.

- [ ] **Step 7: Manual verification**

```bash
pnpm dev:admin
```

Open `http://localhost:4322/posts` and verify:

1. Empty form → preview shows "start typing to preview"
2. Type a title → preview shows the title immediately
3. Fill in description → preview updates
4. Set a date → preview shows formatted date (e.g. "April 30, 2026")
5. Paste a markdown body (e.g. `## Hello\n\nSome **bold** text`) → preview renders it as HTML
6. Enter an image URL → preview shows the cover image
7. Click "clear" → preview resets to empty state
8. Click "edit" on an existing post → preview populates with that post's content

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/pages/posts.astro
git commit -m "feat(admin): live side-by-side post preview with markdown rendering"
```
