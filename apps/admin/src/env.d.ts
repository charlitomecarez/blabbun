/// <reference types="@cloudflare/workers-types" />

declare namespace App {
  interface Locals {
    admin?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

interface CloudflareEnv {
  JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}
