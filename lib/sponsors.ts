import { supabase } from "./supabase";
import type { Sponsor } from "./database.types";

/**
 * Sponsor (advertising) inventory.
 *
 * Two rules this module exists to keep:
 *   1. Every sponsor is rendered inside a labeled "Advertisement" unit. There
 *      is no code path that renders one as editorial.
 *   2. A sponsor never stands in for the neutral "Get connected" matching
 *      card. Pages place both; the sponsor sits alongside.
 */

/** Page types a slot can be requested for. */
export type SponsorPage = "building" | "risk" | "precon" | "city" | "faq";

export type SponsorVariant = "leaderboard" | "card";

/**
 * Active sponsors targeted at a page type, best first. `all` matches every
 * page. Failures return an empty list — a missing ad must never break a
 * record page.
 */
export async function getSponsors(page: SponsorPage): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .eq("active", true)
    .or(`target_pages.cs.{${page}},target_pages.cs.{all}`)
    .order("priority")
    .order("id");

  if (error) {
    console.error("[sponsors]", error.message);
    return [];
  }
  return (data ?? []) as Sponsor[];
}

/** Initials fall back to the name so the mark is never blank. */
export function sponsorInitials(sponsor: Sponsor): string {
  const explicit = sponsor.logo_initials?.trim();
  if (explicit) return explicit.slice(0, 3).toUpperCase();

  return sponsor.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** What the sponsor does, for the small type above the name. */
export function sponsorRole(sponsor: Sponsor): string {
  switch (sponsor.type) {
    case "lender":
      return "Mortgage lender";
    case "agent":
      return "Real-estate agent";
    case "foreign-national":
      return "Foreign-national lending";
    case "board-firm":
      return "Association services";
    default:
      return "Sponsor";
  }
}

/** Only http(s) destinations are linked — never a javascript: or data: URL. */
export function sponsorHref(sponsor: Sponsor): string | null {
  const url = sponsor.link_url?.trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}
