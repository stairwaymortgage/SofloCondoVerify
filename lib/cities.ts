import { supabase } from "./supabase";
import type { Building, CityHub } from "./database.types";

/**
 * City and county hubs.
 *
 * The workbook stores counties uppercase ("MIAMI-DADE") and hub slugs as
 * `condos-<county>-<city>`; the routes are /condos/<county>/<city>. Everything
 * that has to cross between those forms goes through this file.
 */

export interface County {
  /** URL segment, e.g. "miami-dade". */
  slug: string;
  /** Display form, e.g. "Miami-Dade". */
  name: string;
  /** Value stored in city_hubs.county and buildings.county. */
  db: string;
}

export const COUNTIES: County[] = [
  { slug: "miami-dade", name: "Miami-Dade", db: "MIAMI-DADE" },
  { slug: "broward", name: "Broward", db: "BROWARD" },
  { slug: "palm-beach", name: "Palm Beach", db: "PALM BEACH" },
];

export function countyBySlug(slug: string): County | null {
  return COUNTIES.find((county) => county.slug === slug.toLowerCase()) ?? null;
}

export function countyByDb(db: string | null | undefined): County | null {
  const value = db?.trim().toUpperCase();
  return COUNTIES.find((county) => county.db === value) ?? null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The city segment of a hub URL, taken from url_slug_hub where possible. */
export function citySlug(
  hub: Pick<CityHub, "url_slug_hub" | "county" | "city">
): string {
  const county = countyByDb(hub.county);
  const slug = hub.url_slug_hub?.trim().toLowerCase() ?? "";
  const prefix = county ? `condos-${county.slug}-` : "condos-";

  if (slug.startsWith(prefix)) return slug.slice(prefix.length);
  return slugify(hub.city ?? "");
}

export function countyHref(county: County): string {
  return `/condos/${county.slug}`;
}

export function cityHubHref(
  hub: Pick<CityHub, "url_slug_hub" | "county" | "city">
): string | null {
  const county = countyByDb(hub.county);
  if (!county) return null;
  return `/condos/${county.slug}/${citySlug(hub)}`;
}

/* ------------------------------------------------------------------ */
/* lookups                                                             */
/* ------------------------------------------------------------------ */

export async function getCityHubs(): Promise<CityHub[]> {
  const { data, error } = await supabase.from("city_hubs").select("*").order("city");

  if (error) {
    console.error("[cities]", error.message);
    return [];
  }
  return (data ?? []) as CityHub[];
}

export async function getCityHubsInCounty(county: County): Promise<CityHub[]> {
  const { data, error } = await supabase
    .from("city_hubs")
    .select("*")
    .eq("county", county.db)
    .order("city");

  if (error) {
    console.error("[cities/county]", error.message);
    return [];
  }
  return (data ?? []) as CityHub[];
}

/** Hub slugs are unique, so the route pair rebuilds the stored slug exactly. */
export async function getCityHub(
  countySlug: string,
  city: string
): Promise<CityHub | null> {
  const county = countyBySlug(countySlug);
  if (!county) return null;

  const slug = `condos-${county.slug}-${city.trim().toLowerCase()}`;
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const { data, error } = await supabase
    .from("city_hubs")
    .select("*")
    .eq("url_slug_hub", slug)
    .maybeSingle();

  if (error) {
    console.error("[cities/hub]", error.message);
    return null;
  }
  return data as CityHub | null;
}

/** The hub a building belongs to, for the breadcrumb on a record page. */
export async function getCityHubForBuilding(
  building: Pick<Building, "city" | "county">
): Promise<CityHub | null> {
  const city = building.city?.trim();
  const county = countyByDb(building.county);
  if (!city || !county) return null;

  const { data, error } = await supabase
    .from("city_hubs")
    .select("*")
    .eq("county", county.db)
    .ilike("city", city)
    .limit(1);

  if (error) {
    console.error("[cities/for-building]", error.message);
    return null;
  }
  return (data?.[0] as CityHub | undefined) ?? null;
}

/* ------------------------------------------------------------------ */
/* live counts — read from buildings, never from the workbook columns   */
/* ------------------------------------------------------------------ */

export interface LiveCounts {
  total: number;
  fhaApproved: number;
  vaAccepted: number;
  precon: number;
  flagged: number;
}

const EMPTY_COUNTS: LiveCounts = {
  total: 0,
  fhaApproved: 0,
  vaAccepted: 0,
  precon: 0,
  flagged: 0,
};

const VA_ACCEPTED = "va_status.like.Accepted%,va_status.eq.HUD Accepted";

function baseCountQuery(county: County, city: string | null) {
  const query = supabase
    .from("buildings")
    .select("*", { count: "exact", head: true })
    .eq("tri_county", "Yes")
    .eq("county", county.db);

  return city ? query.ilike("city", city) : query;
}

type CountQuery = ReturnType<typeof baseCountQuery>;

async function countBuildings(
  county: County,
  city: string | null,
  refine?: (query: CountQuery) => CountQuery
): Promise<number> {
  const base = baseCountQuery(county, city);
  const { count, error } = await (refine ? refine(base) : base);

  if (error) {
    console.error("[cities/count]", error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Current counts for one city, straight from the buildings table — the
 * workbook's buildings_tracked column is a snapshot and drifts.
 */
export async function getLiveCounts(
  county: County,
  city: string | null
): Promise<LiveCounts> {
  const [total, fhaApproved, vaAccepted, precon, flagged] = await Promise.all([
    countBuildings(county, city),
    countBuildings(county, city, (q) => q.eq("fha_status", "Approved")),
    countBuildings(county, city, (q) => q.or(VA_ACCEPTED)),
    countBuildings(county, city, (q) => q.eq("precon", "Yes")),
    countBuildings(county, city, (q) => q.gte("signal_count", 2)),
  ]);

  return { total, fhaApproved, vaAccepted, precon, flagged };
}

type CountRow = Pick<
  Building,
  "city" | "fha_status" | "va_status" | "precon" | "signal_count"
>;

const PAGE = 1000;

/**
 * Per-city counts for a whole county in one pass. A county page needs counts
 * for ~35 cities; paging the rows once beats 175 count queries.
 */
export async function getCountyCityCounts(
  county: County
): Promise<Map<string, LiveCounts>> {
  const counts = new Map<string, LiveCounts>();

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("buildings")
      .select("city, fha_status, va_status, precon, signal_count")
      .eq("tri_county", "Yes")
      .eq("county", county.db)
      .order("id")
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("[cities/county-counts]", error.message);
      break;
    }

    const rows = (data ?? []) as CountRow[];
    for (const row of rows) {
      const key = row.city?.trim().toUpperCase();
      if (!key) continue;

      const entry = counts.get(key) ?? { ...EMPTY_COUNTS };
      entry.total += 1;
      if (row.fha_status === "Approved") entry.fhaApproved += 1;
      if (row.va_status?.startsWith("Accepted") || row.va_status === "HUD Accepted") {
        entry.vaAccepted += 1;
      }
      if (row.precon === "Yes") entry.precon += 1;
      if ((row.signal_count ?? 0) >= 2) entry.flagged += 1;
      counts.set(key, entry);
    }

    if (rows.length < PAGE) break;
  }

  return counts;
}

export function countsFor(
  counts: Map<string, LiveCounts>,
  city: string | null
): LiveCounts {
  return counts.get(city?.trim().toUpperCase() ?? "") ?? { ...EMPTY_COUNTS };
}

/* ------------------------------------------------------------------ */
/* buildings in a city                                                 */
/* ------------------------------------------------------------------ */

export type CityBuilding = Pick<
  Building,
  "id" | "building_name" | "address" | "city" | "county" | "zip" | "signal_count" | "fha_status" | "va_status" | "tri_county"
>;

const CITY_BUILDING_COLUMNS =
  "id, building_name, address, city, county, zip, signal_count, fha_status, va_status, tri_county";

/** Buildings carrying stacked flags — these link to the due-diligence read. */
export async function getFlaggedBuildings(
  county: County,
  city: string,
  limit = 8
): Promise<CityBuilding[]> {
  const { data, error } = await supabase
    .from("buildings")
    .select(CITY_BUILDING_COLUMNS)
    .eq("tri_county", "Yes")
    .eq("county", county.db)
    .ilike("city", city)
    .gte("signal_count", 2)
    .order("signal_count", { ascending: false })
    .order("building_name")
    .limit(limit);

  if (error) {
    console.error("[cities/flagged]", error.message);
    return [];
  }
  return (data ?? []) as CityBuilding[];
}

/** Buildings holding a current FHA approval — the shortest list on the site. */
export async function getApprovedBuildings(
  county: County,
  city: string,
  limit = 8
): Promise<CityBuilding[]> {
  const { data, error } = await supabase
    .from("buildings")
    .select(CITY_BUILDING_COLUMNS)
    .eq("tri_county", "Yes")
    .eq("county", county.db)
    .ilike("city", city)
    .or("fha_status.eq.Approved,va_status.like.Accepted%,va_status.eq.HUD Accepted")
    .order("building_name")
    .limit(limit);

  if (error) {
    console.error("[cities/approved]", error.message);
    return [];
  }
  return (data ?? []) as CityBuilding[];
}
