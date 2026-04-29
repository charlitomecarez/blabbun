import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types.js";

export function createSupabaseClient(url: string, key: string) {
  return createClient<Database>(url, key, {
    global: { fetch: (...args: Parameters<typeof fetch>) => fetch(...args) },
  });
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
