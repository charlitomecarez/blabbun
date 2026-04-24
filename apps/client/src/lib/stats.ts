import { createSupabaseClient } from "@blabbun/db";

export interface PostStats {
  claps: number;
  commentCount: number;
}

/**
 * Fetches clap counts and top-level comment counts for a list of post slugs.
 * Runs both queries in parallel. Returns a map keyed by slug — unknown slugs
 * get zeroed stats so callers never need to null-check individual entries.
 */
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
