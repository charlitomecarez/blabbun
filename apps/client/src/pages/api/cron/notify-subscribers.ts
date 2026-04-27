import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { getSupabaseClient, jsonResponse } from "@/lib/api";
import { getResendClient, newPostEmailHtml } from "@/lib/emails";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const secret = import.meta.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const supabase = getSupabaseClient();

  const [allPosts, notifiedResult, subscribersResult] = await Promise.all([
    getCollection("posts"),
    supabase.from("post_notifications").select("post_slug"),
    supabase.from("subscribers").select("email"),
  ]);

  const today = new Date();
  const notifiedSlugs = new Set(
    notifiedResult.data?.map((r) => r.post_slug) ?? []
  );
  const subscribers = subscribersResult.data ?? [];

  const newPosts = allPosts.filter(
    (p) =>
      !p.data.draft &&
      new Date(p.data.pubDate) <= today &&
      !notifiedSlugs.has(p.id)
  );

  if (newPosts.length === 0 || subscribers.length === 0) {
    return jsonResponse({ notified: 0, posts: [] });
  }

  const resend = getResendClient();
  const notifiedTitles: string[] = [];

  for (const post of newPosts) {
    const date = new Date(post.data.pubDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Each subscriber gets a personalized email with their own unsubscribe link
    const messages = subscribers.map((sub) => ({
      from: "onboarding@resend.dev",
      to: sub.email,
      subject: post.data.title,
      html: newPostEmailHtml(
        {
          title: post.data.title,
          slug: post.id,
          description: post.data.description,
          date,
        },
        sub.email
      ),
    }));

    for (let i = 0; i < messages.length; i += 100) {
      await resend.batch.send(messages.slice(i, i + 100));
    }

    await supabase
      .from("post_notifications")
      .insert({ post_slug: post.id })
      .throwOnError();

    notifiedTitles.push(post.data.title);
  }

  return jsonResponse({
    notified: notifiedTitles.length,
    posts: notifiedTitles,
    subscribers: subscribers.length,
  });
};
