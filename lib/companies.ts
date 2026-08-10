import { supabase } from "./supabase";
import type { Building, Company, ExistingTower } from "./database.types";

/**
 * Companies — developers, architects, interior and landscape firms, brand and
 * hospitality partners. 510 rows; 128 of them have at least one project linked
 * in our own tables, and those are the pages worth prebuilding.
 *
 * Slugs are stored with a "developers-" prefix ("developers-arquitectonica").
 * The route drops it, so /developers/arquitectonica is canonical and the stored
 * form still resolves.
 */

export const SLUG_PREFIX = "developers-";

/** Route segment for a stored url_slug. */
export function companySlug(slug: string | null | undefined): string | null {
  const clean = slug?.trim().toLowerCase();
  if (!clean) return null;
  return clean.startsWith(SLUG_PREFIX) ? clean.slice(SLUG_PREFIX.length) : clean;
}

/**
 * Link target for a developer_page_slug carried on a project row. Precon and
 * existing-tower pages call this, so it must agree with the route above.
 */
export function developerHref(slug: string | null | undefined): string | null {
  const segment = companySlug(slug);
  return segment ? `/developers/${segment}` : null;
}

export function companyHref(company: Pick<Company, "url_slug">): string | null {
  return developerHref(company.url_slug);
}

/** "2850 Tigertail Ave, Ste 800, Miami, FL 33133" → "Miami". */
export function headquartersCity(headquarters: string | null): string | null {
  const raw = headquarters?.trim();
  if (!raw) return null;

  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const stateIndex = parts.findIndex((part) => /^FL\b/i.test(part));

  if (stateIndex > 0) return parts[stateIndex - 1];
  // No Florida marker — fall back to the second-to-last component.
  return parts.length >= 2 ? parts[parts.length - 2] : null;
}

/* ------------------------------------------------------------------ */
/* lookups                                                             */
/* ------------------------------------------------------------------ */

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from("companies").select("*").order("company");

  if (error) {
    console.error("[companies]", error.message);
    return [];
  }
  return (data ?? []) as Company[];
}

/** Accepts the route form ("arquitectonica") and the stored form. */
export async function getCompanyBySlug(raw: string): Promise<Company | null> {
  const segment = decodeURIComponent(raw).trim().toLowerCase();
  if (!segment || !/^[a-z0-9-]+$/.test(segment)) return null;

  const candidates = segment.startsWith(SLUG_PREFIX)
    ? [segment]
    : [`${SLUG_PREFIX}${segment}`, segment];

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .in("url_slug", candidates)
    .limit(1);

  if (error) {
    console.error("[companies/slug]", error.message);
    return null;
  }
  return (data?.[0] as Company | undefined) ?? null;
}

export interface LinkedCounts {
  precon: number;
  existing: number;
  total: number;
}

/**
 * How many projects we actually hold for each company, counted from our own
 * tables. companies.developments is the workbook's own figure and counts work
 * we don't track — the index shows this instead.
 */
export async function getLinkedCounts(): Promise<Map<number, LinkedCounts>> {
  const [miami, broward, towers] = await Promise.all([
    supabase.from("precon_miami").select("company_id").not("company_id", "is", null),
    supabase.from("precon_broward").select("company_id").not("company_id", "is", null),
    supabase.from("existing_towers").select("company_id").not("company_id", "is", null),
  ]);

  for (const result of [miami, broward, towers]) {
    if (result.error) console.error("[companies/counts]", result.error.message);
  }

  const counts = new Map<number, LinkedCounts>();

  const add = (id: number | null, key: "precon" | "existing") => {
    if (id === null) return;
    const entry = counts.get(id) ?? { precon: 0, existing: 0, total: 0 };
    entry[key] += 1;
    entry.total += 1;
    counts.set(id, entry);
  };

  for (const row of miami.data ?? []) add(row.company_id, "precon");
  for (const row of broward.data ?? []) add(row.company_id, "precon");
  for (const row of towers.data ?? []) add(row.company_id, "existing");

  return counts;
}

/** Companies carrying at least one linked project — the prebuild set. */
export async function getCompaniesWithProjects(): Promise<Company[]> {
  const [companies, counts] = await Promise.all([getCompanies(), getLinkedCounts()]);
  return companies.filter((company) => (counts.get(company.id)?.total ?? 0) > 0);
}

/* ------------------------------------------------------------------ */
/* portfolio                                                           */
/* ------------------------------------------------------------------ */

export interface PortfolioTower {
  id: number;
  building: string;
  neighborhood: string | null;
  yearBuilt: number | null;
  units: number | null;
  floors: number | null;
  architect: string | null;
  strAllowed: string | null;
  /** Verification record, when the name matches exactly one tri-county row. */
  buildingId: number | null;
}

/**
 * Existing towers for a company. Tower rows have no page of their own yet, so
 * each is matched to a verification record by exact name — and only when
 * exactly one record matches, since a wrong link here points a reader at
 * another building's compliance record.
 */
export async function getTowersByCompany(companyId: number): Promise<PortfolioTower[]> {
  const { data, error } = await supabase
    .from("existing_towers")
    .select("*")
    .eq("company_id", companyId)
    .order("year_built", { ascending: false })
    .order("building");

  if (error) {
    console.error("[companies/towers]", error.message);
    return [];
  }

  const rows = ((data ?? []) as ExistingTower[]).filter((row) => row.building);
  if (rows.length === 0) return [];

  const names = [...new Set(rows.map((row) => row.building!.trim()))];
  const matches = await matchBuildingsByName(names);

  return rows.map((row) => {
    const key = row.building!.trim().toUpperCase();
    const ids = matches.get(key) ?? [];

    return {
      id: row.id,
      building: row.building!,
      neighborhood: row.neighborhood,
      yearBuilt: row.year_built,
      units: row.units,
      floors: row.floors,
      architect: row.architect,
      strAllowed: row.str_allowed,
      buildingId: ids.length === 1 ? ids[0] : null,
    };
  });
}

async function matchBuildingsByName(names: string[]): Promise<Map<string, number[]>> {
  const matches = new Map<string, number[]>();
  if (names.length === 0) return matches;

  const { data, error } = await supabase
    .from("buildings")
    .select("id, building_name")
    .eq("tri_county", "Yes")
    .in("building_name", names);

  if (error) {
    console.error("[companies/name-match]", error.message);
    return matches;
  }

  for (const row of (data ?? []) as Pick<Building, "id" | "building_name">[]) {
    const key = row.building_name?.trim().toUpperCase();
    if (!key) continue;
    matches.set(key, [...(matches.get(key) ?? []), row.id]);
  }

  return matches;
}
