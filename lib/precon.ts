import { supabase } from "./supabase";
import type { PreconBroward, PreconMiami } from "./database.types";

/**
 * Preconstruction projects live in two tables with different shapes:
 * precon_miami (Miami-Dade, neighborhood-keyed) and precon_broward
 * (Broward, city-keyed). Everything above this file works off the merged
 * PreconProject shape rather than either row type.
 */

export type PreconSource = "miami" | "broward";

export interface PreconProject {
  source: PreconSource;
  id: number;
  /** url_slug as stored, e.g. "preconstruction-brickell-2200-brickell". */
  slug: string;
  project: string;
  county: "Miami-Dade" | "Broward";
  /** Grouping key: neighborhood (Miami) or city (Broward). */
  area: string;
  /** Broward's finer-grained area, e.g. "FTL Beach / Bahia Mar". */
  areaDetail: string | null;
  status: string | null;
  soldOut: boolean;
  strAllowed: string | null;
  strDetail: string | null;
  priceFrom: number | null;
  bedrooms: string | null;
  delivery: string | null;
  deliveryYear: number | null;
  architect: string | null;
  developer: string | null;
  developerSlug: string | null;
  units: string | null;
  floors: string | null;
  sfRange: string | null;
  address: string | null;
}

const UNKNOWN_AREA = "Area not on file";

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Broward has no delivery_year column — "Q1 2029" and "2030" both appear. */
function yearFrom(delivery: string | null): number | null {
  const match = delivery?.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function fromMiami(row: PreconMiami): PreconProject {
  const delivery = text(row.delivery);
  return {
    source: "miami",
    id: row.id,
    slug: text(row.url_slug) ?? "",
    project: text(row.project) ?? "Unnamed project",
    county: "Miami-Dade",
    area: text(row.neighborhood) ?? UNKNOWN_AREA,
    areaDetail: null,
    status: text(row.status),
    soldOut: text(row.sold_out) === "Yes",
    strAllowed: text(row.str_allowed),
    strDetail: text(row.str_detail),
    priceFrom: row.price_from,
    bedrooms: text(row.bedrooms),
    delivery,
    deliveryYear: row.delivery_year ?? yearFrom(delivery),
    architect: text(row.architect),
    developer: text(row.lead_developer),
    developerSlug: text(row.developer_page_slug),
    units: null,
    floors: null,
    sfRange: null,
    address: null,
  };
}

function fromBroward(row: PreconBroward): PreconProject {
  const delivery = text(row.delivery);
  return {
    source: "broward",
    id: row.id,
    slug: text(row.url_slug) ?? "",
    project: text(row.project) ?? "Unnamed project",
    county: "Broward",
    area: text(row.city) ?? UNKNOWN_AREA,
    areaDetail: text(row.area),
    status: text(row.status),
    soldOut: text(row.sold_out) === "Yes",
    strAllowed: text(row.str_allowed),
    strDetail: text(row.str_detail),
    priceFrom: row.price_from,
    bedrooms: text(row.bedrooms),
    delivery,
    deliveryYear: yearFrom(delivery),
    architect: null,
    developer: text(row.developer),
    developerSlug: text(row.developer_page_slug),
    units: text(row.units),
    floors: text(row.floors),
    sfRange: text(row.sf_range),
    address: text(row.address),
  };
}

function byProjectName(a: PreconProject, b: PreconProject): number {
  return a.project.localeCompare(b.project, "en");
}

/** All 164 projects, both counties, sorted by project name. */
export async function getPreconProjects(): Promise<PreconProject[]> {
  const [miami, broward] = await Promise.all([
    supabase.from("precon_miami").select("*"),
    supabase.from("precon_broward").select("*"),
  ]);

  if (miami.error) console.error("[precon] miami:", miami.error.message);
  if (broward.error) console.error("[precon] broward:", broward.error.message);

  return [
    ...(miami.data ?? []).map(fromMiami),
    ...(broward.data ?? []).map(fromBroward),
  ]
    .filter((project) => project.slug)
    .sort(byProjectName);
}

/**
 * Look a project up by url_slug across both tables. The stored slug carries a
 * "preconstruction-" prefix, so /preconstruction/<full-slug> is canonical and
 * /preconstruction/<slug-without-prefix> is accepted as an alias.
 */
export async function getPreconBySlug(raw: string): Promise<PreconProject | null> {
  const slug = decodeURIComponent(raw).trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;

  const candidates = slug.startsWith("preconstruction-")
    ? [slug]
    : [slug, `preconstruction-${slug}`];

  const [miami, broward] = await Promise.all([
    supabase.from("precon_miami").select("*").in("url_slug", candidates).limit(1),
    supabase.from("precon_broward").select("*").in("url_slug", candidates).limit(1),
  ]);

  if (miami.error) console.error("[precon/slug] miami:", miami.error.message);
  if (broward.error) console.error("[precon/slug] broward:", broward.error.message);

  const miamiRow = miami.data?.[0];
  if (miamiRow) return fromMiami(miamiRow);

  const browardRow = broward.data?.[0];
  if (browardRow) return fromBroward(browardRow);

  return null;
}

/** Other projects in the same neighborhood / city, nearest names first. */
export async function getRelatedPrecon(
  project: PreconProject,
  limit = 6
): Promise<PreconProject[]> {
  // Queried per-table rather than dynamically: the grouping column differs and
  // the generated types only allow columns common to both.
  const query =
    project.source === "miami"
      ? supabase
          .from("precon_miami")
          .select("*")
          .eq("neighborhood", project.area)
          .neq("id", project.id)
          .limit(limit + 1)
          .then(({ data, error }) => ({ rows: (data ?? []).map(fromMiami), error }))
      : supabase
          .from("precon_broward")
          .select("*")
          .eq("city", project.area)
          .neq("id", project.id)
          .limit(limit + 1)
          .then(({ data, error }) => ({ rows: (data ?? []).map(fromBroward), error }));

  const { rows, error } = await query;
  if (error) {
    console.error("[precon/related]", error.message);
    return [];
  }

  return rows.filter((row) => row.slug).sort(byProjectName).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* presentation helpers                                                */
/* ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | null): string | null {
  return value === null || !Number.isFinite(value) ? null : currency.format(value);
}

export function preconHref(project: Pick<PreconProject, "slug">): string {
  return `/preconstruction/${project.slug}`;
}

/**
 * Developer pages are keyed by companies.url_slug, which is stored with a
 * "developers-" prefix. Kept in one place so the route can move without
 * touching the pages.
 */
export function developerHref(slug: string | null): string | null {
  const clean = text(slug);
  if (!clean) return null;
  return `/developers/${clean.replace(/^developers-/, "")}`;
}

/**
 * Tones follow the site rule: green (go) is approved/cleared status ONLY, and
 * no construction phase is an approval — so these are amber or neutral.
 */
export type PreconTone = "caution" | "none";

export function statusTone(status: string | null): PreconTone {
  const value = text(status)?.toLowerCase();
  if (!value) return "none";
  if (value === "halted" || value === "unverified") return "caution";
  return "none";
}

/** "UNVERIFIED" reads as shouting in a badge. */
export function statusLabel(status: string | null): string {
  const value = text(status);
  if (!value) return "Status not on file";
  return value === "UNVERIFIED" ? "Unverified" : value;
}

/**
 * str_detail often restates str_allowed ("Yes" / "Yes/Airbnb"). Fold that case
 * into one line and keep the detail only when it actually says something more.
 */
export function strFact(
  project: Pick<PreconProject, "strAllowed" | "strDetail">
): { value: string | null; detail: string | null } {
  const value = text(project.strAllowed);
  const detail = text(project.strDetail);
  if (!value || !detail) return { value, detail };

  if (detail.toLowerCase() === value.toLowerCase()) return { value, detail: null };

  const prefix = `${value.toLowerCase()}/`;
  if (detail.toLowerCase().startsWith(prefix)) {
    return { value: `${value} — ${detail.slice(prefix.length)}`, detail: null };
  }

  return { value, detail };
}

/** Only a documented "Yes" earns the chip — "Varies"/"Unknown" do not. */
export function strAllowsShortTerm(project: Pick<PreconProject, "strAllowed">): boolean {
  return text(project.strAllowed) === "Yes";
}

/**
 * Stable, slug-derived record number in the SCV- house style, e.g.
 * SCV-PRE-MDC-40718. Derived from the slug so it survives table reloads.
 */
export function preconRecordId(project: Pick<PreconProject, "slug" | "county">): string {
  const county = project.county === "Miami-Dade" ? "MDC" : "BRW";

  // FNV-1a, truncated to five digits — an identifier, not a checksum.
  let hash = 0x811c9dc5;
  for (let i = 0; i < project.slug.length; i += 1) {
    hash ^= project.slug.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `SCV-PRE-${county}-${String(hash % 100000).padStart(5, "0")}`;
}

/** Share of the price a non-resident program typically leaves financed. */
export const FOREIGN_NATIONAL_DOWN = 0.35;

export interface FinancingIllustration {
  price: string;
  down: string;
  financed: string;
  downPct: string;
  financedPct: string;
}

/** Illustrative only — null when the project has no published price. */
export function financingIllustration(
  priceFrom: number | null
): FinancingIllustration | null {
  const price = formatPrice(priceFrom);
  if (price === null || priceFrom === null) return null;

  const down = priceFrom * FOREIGN_NATIONAL_DOWN;
  return {
    price,
    down: currency.format(down),
    financed: currency.format(priceFrom - down),
    downPct: `${Math.round(FOREIGN_NATIONAL_DOWN * 100)}%`,
    financedPct: `${Math.round((1 - FOREIGN_NATIONAL_DOWN) * 100)}%`,
  };
}
