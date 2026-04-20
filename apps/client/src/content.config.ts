import type { Post } from "@thelunan/types";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Post is the canonical type for blog post frontmatter, shared across apps.
// The Zod schema below must stay in sync with the Post interface in @thelunan/types.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _PostCheck = Post;

const posts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().url().optional(),
    imageSource: z.string().optional(),
    imageSourceUrl: z.string().url().optional(),
  }),
});

export const collections = { posts };
