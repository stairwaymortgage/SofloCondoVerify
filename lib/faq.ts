import { supabase } from "./supabase";
import { citySlug, countyByDb, type County } from "./cities";
import type { CityHub, Faq } from "./database.types";

/**
 * FAQ answers. 7,524 rows, ~72 per city hub, grouped into clusters (FHA, VA,
 * Structural/SIRS, STR/Rental …). Each row is one indexable answer page.
 */

/**
 * Thin-content guard. Roughly 2% of answers are one-line city blurbs or
 * templated "this city has no tower stock" lines — real, but too slight to
 * publish as a standalone indexable page. Those URLs still resolve, so nothing
 * breaks for anyone holding a link, but they carry noindex and are kept out of
 * the sitemap, the hub's cluster index, and the sibling lists.
 */
export const MIN_ANSWER_CHARS = 180;

export function isThin(faq: Pick<Faq, "answer">): boolean {
  return (faq.answer?.trim().length ?? 0) < MIN_ANSWER_CHARS;
}

/** Cluster display order — the money questions first. */
const CLUSTER_ORDER = [
  "FHA",
  "VA",
  "Conventional",
  "Financing",
  "Structural/SIRS",
  "Insurance",
  "Fees/Assessments",
  "STR/Rental",
  "Buying/Market",
  "General",
];

export function clusterRank(cluster: string | null): number {
  const index = CLUSTER_ORDER.indexOf(cluster?.trim() ?? "");
  return index === -1 ? CLUSTER_ORDER.length : index;
}

const COUNTY_SLUGS = ["miami-dade", "broward", "palm-beach"];

export function faqHref(faq: Pick<Faq, "url_slug" | "city_hub_slug">): string | null {
  const slug = faq.url_slug?.trim();
  const hub = faq.city_hub_slug?.trim().toLowerCase();
  if (!slug || !hub) return null;

  // city_hub_slug is "condos-<county>-<city>"; the route splits those apart.
  const county = COUNTY_SLUGS.find((value) => hub.startsWith(`condos-${value}-`));
  if (!county) return null;

  const city = hub.slice(`condos-${county}-`.length);
  return `/condos/${county}/${city}/faq/${slug}`;
}

export async function getFaqBySlug(rawSlug: string): Promise<Faq | null> {
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("url_slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[faq/slug]", error.message);
    return null;
  }
  return data as Faq | null;
}

/** Every answer for one city hub, for the cluster index on the hub page. */
export async function getFaqsForHub(hubId: number): Promise<Faq[]> {
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("city_hub_id", hubId)
    .order("col");

  if (error) {
    console.error("[faq/hub]", error.message);
    return [];
  }
  return (data ?? []) as Faq[];
}

export interface FaqCluster {
  cluster: string;
  faqs: Faq[];
}

export function groupByCluster(faqs: Faq[]): FaqCluster[] {
  const groups = new Map<string, Faq[]>();
  for (const faq of faqs) {
    const cluster = faq.cluster?.trim() || "General";
    groups.set(cluster, [...(groups.get(cluster) ?? []), faq]);
  }

  return [...groups.entries()]
    .map(([cluster, rows]) => ({ cluster, faqs: rows }))
    .sort((a, b) => clusterRank(a.cluster) - clusterRank(b.cluster));
}

/** Siblings in the same city and cluster, then the rest of the city. */
export async function getRelatedFaqs(faq: Faq, limit = 6): Promise<Faq[]> {
  if (faq.city_hub_id === null) return [];

  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("city_hub_id", faq.city_hub_id)
    .neq("id", faq.id)
    .order("col")
    .limit(120);

  if (error) {
    console.error("[faq/related]", error.message);
    return [];
  }

  const rows = ((data ?? []) as Faq[]).filter((row) => !isThin(row));
  const cluster = faq.cluster?.trim();
  const sameCluster = rows.filter((row) => row.cluster?.trim() === cluster);
  const others = rows.filter((row) => row.cluster?.trim() !== cluster);

  return [...sameCluster, ...others].slice(0, limit);
}

/** Every publishable answer slug, for the sitemap and for static params. */
export async function getAllFaqRoutes(): Promise<
  { county: string; city: string; slug: string }[]
> {
  const routes: { county: string; city: string; slug: string }[] = [];

  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("faq")
      .select("url_slug, city_hub_slug, answer")
      .order("id")
      .range(from, from + 999);

    if (error) {
      console.error("[faq/routes]", error.message);
      break;
    }

    const rows = data ?? [];
    for (const row of rows) {
      if (isThin(row as Pick<Faq, "answer">)) continue;
      const href = faqHref(row as Pick<Faq, "url_slug" | "city_hub_slug">);
      if (!href) continue;

      const [, , county, city, , slug] = href.split("/");
      routes.push({ county, city, slug });
    }

    if (rows.length < 1000) break;
  }

  return routes;
}

/** The hub a FAQ belongs to. */
export async function getFaqHub(faq: Faq): Promise<CityHub | null> {
  if (faq.city_hub_id === null) return null;

  const { data, error } = await supabase
    .from("city_hubs")
    .select("*")
    .eq("id", faq.city_hub_id)
    .maybeSingle();

  if (error) {
    console.error("[faq/hub-lookup]", error.message);
    return null;
  }
  return data as CityHub | null;
}

/** Breadcrumb parts for a FAQ, derived from its hub. */
export function faqTrail(hub: CityHub): {
  county: County | null;
  citySegment: string;
} {
  return { county: countyByDb(hub.county), citySegment: citySlug(hub) };
}
