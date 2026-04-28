import type { APIRoute } from "astro";

import {
  getRuntimeEnv,
  getSupabaseClient,
  hashIp,
  jsonResponse,
} from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const hash = hashIp(request);

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

  if (clapsResult.error)
    return jsonResponse({ error: clapsResult.error.message }, 500);

  return jsonResponse({
    count: clapsResult.data?.count ?? 0,
    hasClapped: !!voteResult.data,
  });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  const env = getRuntimeEnv(locals);
  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const hash = hashIp(request);

  const [voteResult, clapResult] = await Promise.all([
    supabase
      .from("clap_votes")
      .select("ip_hash")
      .eq("post_slug", slug!)
      .eq("ip_hash", hash)
      .maybeSingle(),
    supabase
      .from("post_claps")
      .select("count")
      .eq("post_slug", slug!)
      .maybeSingle(),
  ]);

  const currentCount = clapResult.data?.count ?? 0;

  if (voteResult.data) {
    // Already clapped — remove vote and decrement.
    // Math.max(0, ...) guards against a count going negative if rows are inconsistent.
    const { error: deleteError } = await supabase
      .from("clap_votes")
      .delete()
      .eq("post_slug", slug!)
      .eq("ip_hash", hash);

    if (deleteError) return jsonResponse({ error: deleteError.message }, 500);

    const newCount = Math.max(0, currentCount - 1);
    const { error: upsertError } = await supabase
      .from("post_claps")
      .upsert({ post_slug: slug!, count: newCount });

    if (upsertError) return jsonResponse({ error: upsertError.message }, 500);

    return jsonResponse({ count: newCount, hasClapped: false });
  } else {
    // Not yet clapped — insert vote and increment.
    const { error: insertError } = await supabase
      .from("clap_votes")
      .insert({ post_slug: slug!, ip_hash: hash });

    if (insertError) return jsonResponse({ error: insertError.message }, 500);

    const newCount = currentCount + 1;
    const { error: upsertError } = await supabase
      .from("post_claps")
      .upsert({ post_slug: slug!, count: newCount });

    if (upsertError) return jsonResponse({ error: upsertError.message }, 500);

    return jsonResponse({ count: newCount, hasClapped: true });
  }
};
