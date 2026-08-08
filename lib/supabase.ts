import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
if (!publishableKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

/**
 * Browser / anon client. Uses the publishable (sb_publishable_…) key, so it is
 * safe to ship to the client and is subject to Row Level Security.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  url,
  publishableKey,
  { auth: { persistSession: false } }
);

/**
 * Server-only admin client. Uses the secret (sb_secret_… / service_role) key,
 * which BYPASSES Row Level Security — never import this into a client
 * component, and never expose the key to the browser.
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must never be called in the browser");
  }

  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local — fill it in before running server tasks."
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
