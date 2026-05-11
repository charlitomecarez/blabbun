import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { getAppEnv } from "@/lib/env";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const DELETE: APIRoute = async () => {
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getClient();

  const [comments, clapVotes, postClaps, postViews, subscribers] =
    await Promise.all([
      supabase
        .from("comments")
        .delete()
        .eq("env", appEnv)
        .neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase
        .from("clap_votes")
        .delete()
        .eq("env", appEnv)
        .neq("post_slug", ""),
      supabase
        .from("post_claps")
        .delete()
        .eq("env", appEnv)
        .neq("post_slug", ""),
      supabase
        .from("post_views")
        .delete()
        .eq("env", appEnv)
        .neq("post_slug", ""),
      supabase
        .from("subscribers")
        .delete()
        .eq("env", appEnv)
        .neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);

  const errors = [comments, clapVotes, postClaps, postViews, subscribers]
    .map((r) => r.error?.message)
    .filter(Boolean);

  if (errors.length > 0) return json({ error: errors.join("; ") }, 500);

  return json({ ok: true });
};
