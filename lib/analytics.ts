/**
 * GA4 plumbing.
 *
 * The measurement ID is supplied per environment as NEXT_PUBLIC_GA_ID and is
 * deliberately not committed. When it is absent — local dev, previews, any
 * build before the ID is filled in — `<Analytics />` renders nothing and
 * `track()` returns without doing anything. Nothing downstream has to guard.
 */

/** Trimmed measurement ID, or null when analytics is switched off. */
export function gaId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return id ? id : null;
}

/** The events we send. Named here so a typo is a compile error, not silence. */
export type AnalyticsEvent =
  | "search_performed"
  | "record_viewed"
  | "connect_submitted"
  | "sponsor_clicked";

type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Send one event. Safe to call from anywhere on the client: no GA ID, no
 * script, an ad blocker, or a server render all end in the same no-op.
 * Analytics must never be able to break a record page.
 */
export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  // Drop empty values so GA doesn't record "(not set)" for absent context.
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    )
  );

  try {
    window.gtag("event", event, clean);
  } catch {
    // An analytics failure is not a user-facing failure.
  }
}
