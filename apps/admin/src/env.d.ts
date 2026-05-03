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
