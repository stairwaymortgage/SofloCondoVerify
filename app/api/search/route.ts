import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Columns returned to the client — deliberately narrow. */
const COLUMNS =
  "id, building_name, city, zip, address, fha_status, va_status, signal_count";

const RESULT_LIMIT = 10;
/** Over-fetch a little so we can rank before trimming to RESULT_LIMIT. */
const CANDIDATE_LIMIT = 60;

export interface SearchResult {
  id: number;
  building_name: string | null;
  city: string | null;
  zip: string | null;
  address: string | null;
  fha_status: string | null;
  va_status: string | null;
  signal_count: number | null;
}

/**
 * PostgREST's `or=(…)` filter is comma/paren delimited, and `%`/`_` are ilike
 * wildcards — strip them so a query string can't alter the filter's shape.
 */
function sanitize(raw: string): string {
  return raw
    .replace(/[,()"*\\%_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Prefix matches on the building name beat mid-string and address matches. */
function rank(row: SearchResult, needle: string): number {
  const name = (row.building_name ?? "").toLowerCase();
  const address = (row.address ?? "").toLowerCase();

  if (name === needle) return 0;
  if (name.startsWith(needle)) return 1;
  if (name.includes(needle)) return 2;
  if (address.startsWith(needle)) return 3;
  if (address.includes(needle)) return 4;
  return 5;
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const q = sanitize(raw);

  if (q.length < 2) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  // Browsing is tri-county by default (Miami-Dade / Broward / Palm Beach).
  // Statewide rows stay loaded and remain reachable by direct record link.
  const { data, error } = await supabase
    .from("buildings")
    .select(COLUMNS)
    .eq("tri_county", "Yes")
    .or(
      [
        `building_name.ilike.%${q}%`,
        `address.ilike.%${q}%`,
        `zip.ilike.%${q}%`,
      ].join(",")
    )
    .limit(CANDIDATE_LIMIT);

  if (error) {
    console.error("[api/search]", error.message);
    return NextResponse.json({ error: "Search is unavailable." }, { status: 500 });
  }

  const needle = q.toLowerCase();
  const results = (data as SearchResult[])
    .sort((a, b) => {
      const byRank = rank(a, needle) - rank(b, needle);
      if (byRank !== 0) return byRank;
      return (a.building_name ?? "").localeCompare(b.building_name ?? "");
    })
    .slice(0, RESULT_LIMIT);

  return NextResponse.json({ results });
}
