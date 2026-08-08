import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Locally these come from .env.local; on Vercel, from project settings. */
function missing(name: string): Error {
  return new Error(
    `Missing ${name}. Set it in .env.local locally, and in the Vercel project's ` +
      `Environment Variables for deployed builds.`
  );
}

if (!url) throw missing("NEXT_PUBLIC_SUPABASE_URL");
if (!publishableKey) throw missing("NEXT_PUBLIC_SUPABASE_ANON_KEY");

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
  if (!url) throw missing("NEXT_PUBLIC_SUPABASE_URL");
  if (!secretKey) throw missing("SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
