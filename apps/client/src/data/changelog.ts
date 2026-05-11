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
    version: "v1.3.1",
    date: "May 2026",
    label: "Polish & SEO",
    changes: [
      {
        type: "feat",
        description:
          "Post number badge added to every post card — a circular stamp showing chronological order (oldest = #1), hidden when the first-post stamp is displayed",
      },
      {
        type: "feat",
        description:
          'Sort toggle on the home feed lets you flip between newest and oldest posts; the "fresh out the oven!" badge stays visible regardless of sort order',
      },
      {
        type: "feat",
        description:
          '"See more posts →" link added to the Table of Contents on post pages, jumping straight to the related posts section',
      },
      {
        type: "feat",
        description:
          "Full SEO pass on post pages: Open Graph article tags, Twitter card labels, BreadcrumbList JSON-LD, enhanced BlogPosting schema, and hero image preloading",
      },
      {
        type: "feat",
        description:
          'Admin danger zone now includes a "Purge test data" button that wipes all subscribers, comments, claps, and clap votes after a confirmation prompt',
      },
      {
        type: "improvement",
        description:
          "Polaroid card background updated from white to the warm-brown design token so it blends naturally with the site palette",
      },
      {
        type: "improvement",
        description:
          "Body text across About, Now, Changelog, Terms, Archive, Help, and Unsubscribe pages switched to the muted color token, matching the warmth of blog post prose",
      },
      {
        type: "improvement",
        description:
          "Archive page redesigned with a Fraunces heading, Caveat tagline, and scribble SVG to match the rest of the site's visual language",
      },
      {
        type: "improvement",
        description:
          "Help page redesigned with a Fraunces heading, Caveat tagline, scribble SVG, and back link",
      },
      {
        type: "improvement",
        description:
          "Unsubscribe page all three states (success, valid, invalid) redesigned with Fraunces headings, Caveat taglines, and scribble SVGs",
      },
      {
        type: "improvement",
        description:
          "Scroll-to-top button relocated into the right-sidebar newsletter column on desktop so it no longer overlaps content; still visible as a fixed button on mobile",
      },
      {
        type: "improvement",
        description:
          "Sitemap now includes /changelog and /saved, and both pages are marked for prerendering",
      },
      {
        type: "fix",
        description:
          "Canonical URL now always uses the site origin plus pathname, stripping any query parameters and guaranteeing an https:// prefix",
      },
      {
        type: "fix",
        description:
          "Added security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) via the Vercel _headers file",
      },
      {
        type: "fix",
        description:
          "Resolved a MaxListenersExceededWarning in development by raising the EventEmitter listener limit in astro.config.mjs",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "May 2026",
    changes: [
      {
        type: "feat",
        description:
          "Matched admin post preview layout to the client — Fraunces title, Caveat date, tag badges, read time, scribble underline, and prose-styled body",
      },
      {
        type: "improvement",
        description:
          "Enforced design consistency across all pages — unified h1 sizes, container padding, and layout patterns",
      },
      {
        type: "fix",
        description:
          "Raised base font-size from 15px to 16px and bumped post body text to 0.94rem for better reading comfort",
      },
      {
        type: "fix",
        description:
          "Admin preview now shows accurate spacing for standalone br tags between paragraphs, preventing writers from over-adding breaks",
      },
      {
        type: "fix",
        description:
          "Replaced emoji icons with SVG icons in Navbar and PostCard",
      },
      {
        type: "fix",
        description:
          "Fixed topics tag page postItems type mapping to match ArchiveList expectations",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "May 2026",
    label: "Design Overhaul",
    changes: [
      {
        type: "improvement",
        description:
          "Enforced design consistency across all pages — unified h1 sizes, container padding, and layout patterns",
      },
      {
        type: "fix",
        description:
          "Raised base font-size from 15px to 16px and bumped post body text to 0.94rem for better reading comfort",
      },
      {
        type: "improvement",
        description: "Added initial-scale=1 to viewport meta",
      },
      {
        type: "feat",
        description:
          "Matched admin post preview layout to the client — Fraunces title, Caveat date, tag badges, read time, scribble underline, and prose-styled body",
      },
      {
        type: "fix",
        description:
          "Admin preview now shows accurate spacing for standalone br tags between paragraphs, preventing writers from over-adding breaks",
      },
      {
        type: "fix",
        description:
          "Replaced emoji icons with SVG icons in Navbar and PostCard",
      },
      {
        type: "fix",
        description:
          "Fixed topics tag page postItems type mapping to match ArchiveList expectations",
      },
      {
        type: "feat",
        description:
          "Loaded Fraunces and Caveat fonts in admin layout — they were missing, causing preview font fallbacks",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "Apr 2026",
    changes: [
      {
        type: "feat",
        description: "Search dropdown with live filtering across all posts",
      },
      { type: "feat", description: "Infinite scroll on the home feed" },
      { type: "feat", description: "Floating newsletter card on post pages" },
      { type: "feat", description: "Comments system with nested replies" },
      { type: "feat", description: "Clap reactions with per-IP deduplication" },
      { type: "feat", description: "Admin authentication" },
      { type: "feat", description: "Zine quote card injected into home feed" },
      { type: "improvement", description: "Dark mode as default theme" },
      {
        type: "improvement",
        description:
          "Email templates migrated to dark mode palette with Fraunces typography",
      },
      {
        type: "improvement",
        description: "Search dropdown UX and styling refined",
      },
    ],
  },
  {
    version: "v1.0.1",
    date: "Apr 2026",
    changes: [
      {
        type: "feat",
        description: "Saved posts feed with bookmark persistence",
      },
      {
        type: "feat",
        description:
          "Admin post editor: image snippet generator and real-time word count",
      },
      {
        type: "feat",
        description: "Mobile-responsive admin sidebar and post editor",
      },
      {
        type: "improvement",
        description: "BIMI logo support and updated email header branding",
      },
      {
        type: "improvement",
        description: "List-unsubscribe headers added to notification emails",
      },
      { type: "fix", description: "Related post ranking logic improved" },
    ],
  },
  {
    version: "v1.0.0",
    date: "Apr 2026",
    label: "Initial Launch",
    changes: [
      {
        type: "feat",
        description: "Public blog with MDX posts, tag system, and archive",
      },
      {
        type: "feat",
        description:
          "Admin dashboard for managing posts, comments, claps, and subscribers",
      },
      {
        type: "feat",
        description:
          "Supabase integration for comments, claps, and newsletter subscribers",
      },
      { type: "feat", description: "RSS feed, sitemap, and OG image support" },
      {
        type: "feat",
        description: "Light/dark theme with paper grain texture",
      },
      {
        type: "feat",
        description: "Deployed to Vercel with Cloudflare Workers adapter",
      },
    ],
  },
];
