import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types.js";

export function createSupabaseClient(url: string, key: string) {
  return createClient<Database>(url, key, {
    global: {
      fetch: globalThis.fetch.bind(globalThis),
    },
  });
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
