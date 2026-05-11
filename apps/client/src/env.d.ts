/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  APP_ENV: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  RESEND_API_KEY: string;
  UNSUBSCRIBE_SECRET: string;
  CRON_SECRET: string;
}
