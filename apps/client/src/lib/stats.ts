import type { CommentRow, PostClapRow } from "@blabbun/db";
import { createSupabaseClient } from "@blabbun/db";

export interface PostStats {
  claps: number;
  commentCount: number;
}

export async function fetchPostStats(
  slugs: string[]
): Promise<Record<string, PostStats>> {
  if (slugs.length === 0) return {};

  const supabase = createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [clapsResult, commentsResult] = await Promise.all([
    supabase
      .from("post_claps")
      .select("post_slug, count")
      .in("post_slug", slugs),
    supabase
      .from("comments")
      .select("post_slug")
      .in("post_slug", slugs)
      .is("parent_id", null),
  ]);

  const stats: Record<string, PostStats> = {};
  for (const slug of slugs) {
    stats[slug] = { claps: 0, commentCount: 0 };
  }
  for (const row of (clapsResult.data ?? []) as Pick<
    PostClapRow,
    "post_slug" | "count"
  >[]) {
    if (stats[row.post_slug]) stats[row.post_slug].claps = row.count;
  }
  for (const row of (commentsResult.data ?? []) as Pick<
    CommentRow,
    "post_slug"
  >[]) {
    if (stats[row.post_slug]) stats[row.post_slug].commentCount++;
  }

  return stats;
}
