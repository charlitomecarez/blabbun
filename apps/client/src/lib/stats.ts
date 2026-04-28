import type { SupabaseClient } from "@blabbun/db";

export interface PostStats {
  claps: number;
  commentCount: number;
}

export async function fetchPostStats(
  slugs: string[],
  supabase: SupabaseClient
): Promise<Record<string, PostStats>> {
  if (slugs.length === 0) return {};

  const [clapsResult, commentsResult] = await Promise.all([
    supabase
      .from("post_claps")
      .select("post_slug, count")
      .in("post_slug", slugs),
    // Only count top-level comments (parent_id IS NULL) — replies are nested under parents.
    supabase
      .from("comments")
      .select("post_slug")
      .in("post_slug", slugs)
      .is("parent_id", null),
  ]);

  const stats: Record<string, PostStats> = Object.fromEntries(
    slugs.map((slug) => [slug, { claps: 0, commentCount: 0 }])
  );

  for (const row of clapsResult.data ?? []) {
    if (stats[row.post_slug]) stats[row.post_slug].claps = row.count;
  }

  for (const row of commentsResult.data ?? []) {
    if (stats[row.post_slug]) stats[row.post_slug].commentCount++;
  }

  return stats;
}
