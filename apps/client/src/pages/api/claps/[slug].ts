import { createHash } from "node:crypto";

import { createSupabaseClient } from "@thelunan/db";
import type { APIRoute } from "astro";

export const prerender = false;

function getClient() {
  return createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function ipHash(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const supabase = getClient();
  const hash = ipHash(request);

  const [clapsResult, voteResult] = await Promise.all([
    supabase
      .from("post_claps")
      .select("count")
      .eq("post_slug", slug!)
      .maybeSingle(),
    supabase
      .from("clap_votes")
      .select("ip_hash")
      .eq("post_slug", slug!)
      .eq("ip_hash", hash)
      .maybeSingle(),
  ]);

  if (clapsResult.error) return json({ error: clapsResult.error.message }, 500);

  return json({
    count: clapsResult.data?.count ?? 0,
    hasClapped: !!voteResult.data,
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const supabase = getClient();
  const hash = ipHash(request);

  // Check current vote state
  const { data: existingVote } = await supabase
    .from("clap_votes")
    .select("ip_hash")
    .eq("post_slug", slug!)
    .eq("ip_hash", hash)
    .maybeSingle();

  const { data: existing } = await supabase
    .from("post_claps")
    .select("count")
    .eq("post_slug", slug!)
    .maybeSingle();

  const currentCount = existing?.count ?? 0;

  if (existingVote) {
    // Already clapped — remove vote and decrement
    const { error: deleteError } = await supabase
      .from("clap_votes")
      .delete()
      .eq("post_slug", slug!)
      .eq("ip_hash", hash);

    if (deleteError) return json({ error: deleteError.message }, 500);

    const { error: upsertError } = await supabase
      .from("post_claps")
      .upsert({ post_slug: slug!, count: Math.max(0, currentCount - 1) });

    if (upsertError) return json({ error: upsertError.message }, 500);

    return json({ count: Math.max(0, currentCount - 1), hasClapped: false });
  } else {
    // Not yet clapped — insert vote and increment
    const { error: insertError } = await supabase
      .from("clap_votes")
      .insert({ post_slug: slug!, ip_hash: hash });

    if (insertError) return json({ error: insertError.message }, 500);

    const { error: upsertError } = await supabase
      .from("post_claps")
      .upsert({ post_slug: slug!, count: currentCount + 1 });

    if (upsertError) return json({ error: upsertError.message }, 500);

    return json({ count: currentCount + 1, hasClapped: true });
  }
};
