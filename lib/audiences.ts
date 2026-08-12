import { supabase } from "./supabase";

/**
 * Live figures for the three audience landing pages (/buyers, /sellers,
 * /foreign-buyers).
 *
 * Every number here is read from the buildings file at render time rather
 * than written into the copy, because these pages make claims about the
 * market and a stale hardcoded figure is a claim that quietly stops being
 * true. A failed count returns 0 and the page renders around it — a landing
 * page must not 500 because a count query timed out.
 */

export interface StandingCounts {
  /** Buildings the site actually lets you browse. */
  triCounty: number;
  /** Hold a current FHA approval. */
  fhaApproved: number;
  /** Accepted on the VA list, in any of its accepted forms. */
  vaAccepted: number;
  /** Two or more flagged signals — the priority set with a risk page. */
  flagged: number;
  /** FHA approval lapsed. Renewable, and not a rejection. */
  fhaExpired: number;
  /** Turned down by the VA. */
  vaRejected: number;
  /** No reserve-study filing found. Unconfirmed, never "non-compliant". */
  sirsUnconfirmed: number;
}

const EMPTY: StandingCounts = {
  triCounty: 0,
  fhaApproved: 0,
  vaAccepted: 0,
  flagged: 0,
  fhaExpired: 0,
  vaRejected: 0,
  sirsUnconfirmed: 0,
};

type Query = ReturnType<typeof triCountyBase>;

function triCountyBase() {
  return supabase
    .from("buildings")
    .select("*", { count: "exact", head: true })
    .eq("tri_county", "Yes");
}

async function tally(refine: (query: Query) => Query): Promise<number> {
  const { count, error } = await refine(triCountyBase());
  if (error) {
    console.error("[audiences]", error.message);
    return 0;
  }
  return count ?? 0;
}

/** All seven figures in one round of parallel head-count queries. */
export async function getStandingCounts(): Promise<StandingCounts> {
  try {
    const [
      triCounty,
      fhaApproved,
      vaAccepted,
      flagged,
      fhaExpired,
      vaRejected,
      sirsUnconfirmed,
    ] = await Promise.all([
      tally((q) => q),
      tally((q) => q.eq("fha_status", "Approved")),
      // Mirrors vaSignal() in lib/signals: "Accepted Without Conditions",
      // "Accepted With Conditions" and the separate "HUD Accepted" all count.
      tally((q) => q.or('va_status.like.Accepted*,va_status.eq."HUD Accepted"')),
      tally((q) => q.gte("signal_count", 2)),
      tally((q) => q.eq("fha_status", "Expired")),
      tally((q) => q.eq("va_status", "Rejected")),
      tally((q) => q.eq("sirs_filed", "No match")),
    ]);

    return {
      triCounty,
      fhaApproved,
      vaAccepted,
      flagged,
      fhaExpired,
      vaRejected,
      sirsUnconfirmed,
    };
  } catch (error) {
    console.error("[audiences]", error);
    return EMPTY;
  }
}

export interface FlaggedExample {
  id: number;
  name: string;
  city: string | null;
  signalCount: number;
}

/**
 * A handful of buildings from the priority set, to link at their risk pages.
 *
 * Read live rather than listed by hand: a hardcoded example is a named
 * building we would go on pointing at after its filings change. Ordered by
 * flag count then id, so the selection is deterministic and ISR caches it
 * cleanly, and restricted to rows with a readable name — a risk-page link
 * reading "Unnamed building" helps nobody.
 */
export async function getFlaggedExamples(limit = 4): Promise<FlaggedExample[]> {
  const { data, error } = await supabase
    .from("buildings")
    .select("id, building_name, city, signal_count")
    .eq("tri_county", "Yes")
    .gte("signal_count", 3)
    .not("building_name", "is", null)
    .order("signal_count", { ascending: false })
    .order("id")
    .limit(limit * 3);

  if (error) {
    console.error("[audiences/examples]", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => {
      const name = row.building_name?.trim() ?? "";
      return name.length >= 8 && name.length <= 46;
    })
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      name: row.building_name!.trim(),
      city: row.city?.trim() || null,
      signalCount: row.signal_count ?? 0,
    }));
}

/** How many preconstruction projects are on file, across both counties. */
export async function getPreconCount(): Promise<number> {
  const count = async (table: "precon_miami" | "precon_broward") => {
    const { count: value, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })
      .not("url_slug", "is", null);
    if (error) {
      console.error("[audiences/precon]", error.message);
      return 0;
    }
    return value ?? 0;
  };

  const [miami, broward] = await Promise.all([
    count("precon_miami"),
    count("precon_broward"),
  ]);
  return miami + broward;
}
