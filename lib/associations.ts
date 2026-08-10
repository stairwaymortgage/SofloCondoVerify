import { supabase } from "./supabase";
import type { AssnRegistryEntry, ManagementFirm } from "./database.types";

/**
 * Association registry entries.
 *
 * SCOPE, and it matters: registration_status and enforcement_status describe an
 * association's standing in an ORDINANCE REGISTRATION programme. They say
 * nothing about a building's structure, its reserves, its finances or its
 * safety, and nothing on these pages may imply otherwise.
 *
 * board_contacts and cam_licensees hold personal data, are RLS-gated, and are
 * never read here. Only management_firms — licensed businesses — appears, and
 * only as a fact about an address.
 */

export interface Association {
  id: number;
  registration: string;
  name: string;
  address: string;
  /** Parsed out of the address; null when it matches no known city. */
  city: string | null;
  zip: string | null;
  type: string | null;
  registrationStatus: string | null;
  enforcementOpen: boolean;
  regDate: string | null;
}

export function citySegment(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
}

/**
 * Names collide (dozens of "OCEAN VIEW CONDOMINIUM ASSOCIATION, INC"), so the
 * public registration number is appended. It is unique, it is public record,
 * and it makes the lookup a single exact-match query.
 */
export function associationSlug(association: Association): string {
  return `${slugifyName(association.name)}-${association.registration.toLowerCase()}`;
}

export function associationHref(association: Association): string | null {
  if (!association.city) return null;
  return `/associations/${citySegment(association.city)}/${associationSlug(
    association
  )}`;
}

/** The registration number is the last dash-separated token of the slug. */
function registrationFromSlug(slug: string): string | null {
  const token = slug.trim().toLowerCase().split("-").pop();
  return token && /^[a-z0-9]+$/.test(token) ? token : null;
}

/* ------------------------------------------------------------------ */
/* address parsing                                                     */
/* ------------------------------------------------------------------ */

const ZIP = /\b(\d{5})(?:-\d{4})?\s*$/;

function zipOf(address: string): string | null {
  return address.match(ZIP)?.[1] ?? null;
}

/**
 * Addresses arrive as one unpunctuated string — "1000 VENETIAN WAY MIAMI BEACH
 * FL 33139" — so the city is found by matching the known city list rather than
 * by splitting. Longest match wins, so Miami Beach beats Miami.
 */
function cityOf(address: string, cities: string[]): string | null {
  const upper = ` ${address.toUpperCase()} `;

  let best: string | null = null;
  for (const city of cities) {
    const needle = ` ${city.toUpperCase()} `;
    const index = upper.indexOf(needle);
    if (index === -1) continue;
    // Must sit immediately before the state marker.
    const after = upper.slice(index + needle.length - 1).trim();
    if (!/^(FL|FLORIDA)\b/.test(after)) continue;
    if (!best || city.length > best.length) best = city;
  }
  return best;
}

let cityCache: string[] | null = null;

async function knownCities(): Promise<string[]> {
  if (cityCache) return cityCache;

  const { data, error } = await supabase.from("city_hubs").select("city");
  if (error) {
    console.error("[associations/cities]", error.message);
    return [];
  }

  cityCache = (data ?? [])
    .map((row) => row.city?.trim())
    .filter((city): city is string => Boolean(city));
  return cityCache;
}

function toAssociation(row: AssnRegistryEntry, cities: string[]): Association | null {
  const name = row.association_name?.trim();
  const registration = row.registration?.trim();
  const address = row.address?.trim();
  if (!name || !registration || !address) return null;

  return {
    id: row.id,
    registration,
    name,
    address,
    city: cityOf(address, cities),
    zip: zipOf(address),
    type: row.type?.trim() ?? null,
    registrationStatus: row.registration_status?.trim() ?? null,
    enforcementOpen: row.enforcement_status?.trim() === "Yes",
    regDate: row.reg_date?.trim() ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* lookups                                                             */
/* ------------------------------------------------------------------ */

const PAGE = 1000;

/** Every registry entry, parsed. Paged — the table is ~4,000 rows. */
export async function getAssociations(): Promise<Association[]> {
  const cities = await knownCities();
  const all: Association[] = [];

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("assn_registry")
      .select("*")
      .order("id")
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("[associations]", error.message);
      break;
    }

    const rows = (data ?? []) as AssnRegistryEntry[];
    for (const row of rows) {
      const association = toAssociation(row, cities);
      if (association) all.push(association);
    }
    if (rows.length < PAGE) break;
  }

  return all;
}

export async function getAssociationBySlug(
  city: string,
  slug: string
): Promise<Association | null> {
  const registration = registrationFromSlug(slug);
  if (!registration) return null;

  const cities = await knownCities();
  const { data, error } = await supabase
    .from("assn_registry")
    .select("*")
    .ilike("registration", registration)
    .limit(1);

  if (error) {
    console.error("[associations/slug]", error.message);
    return null;
  }

  const row = (data?.[0] as AssnRegistryEntry | undefined) ?? null;
  if (!row) return null;

  const association = toAssociation(row, cities);
  if (!association?.city) return null;

  // The entry must live at the URL it was asked for.
  const expected = associationHref(association);
  return expected === `/associations/${city}/${slug}` ? association : null;
}

export interface CityGroup {
  city: string;
  segment: string;
  total: number;
  issued: number;
  enforcement: number;
}

/** City rollup for the index. */
export function groupByCity(associations: Association[]): CityGroup[] {
  const groups = new Map<string, CityGroup>();

  for (const association of associations) {
    if (!association.city) continue;

    const entry = groups.get(association.city) ?? {
      city: association.city,
      segment: citySegment(association.city),
      total: 0,
      issued: 0,
      enforcement: 0,
    };
    entry.total += 1;
    if (association.registrationStatus === "Issued") entry.issued += 1;
    if (association.enforcementOpen) entry.enforcement += 1;
    groups.set(association.city, entry);
  }

  return [...groups.values()].sort(
    (a, b) => b.total - a.total || a.city.localeCompare(b.city, "en")
  );
}

export async function getAssociationsInCity(segment: string): Promise<Association[]> {
  const associations = await getAssociations();
  return associations
    .filter((association) => association.city && citySegment(association.city) === segment)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

/* ------------------------------------------------------------------ */
/* status presentation                                                 */
/* ------------------------------------------------------------------ */

/**
 * Tones follow the site rule — green is an approval or clearance ONLY, and a
 * current ordinance registration is exactly that: the registration was issued.
 * It remains a statement about registration, never about the building.
 */
export type RegistryTone = "go" | "flag" | "caution" | "none";

export function registrationTone(status: string | null): RegistryTone {
  switch (status) {
    case "Issued":
      return "go";
    case "Rejected":
    case "Revoked":
      return "flag";
    case "Expired":
    case "In Progress":
    case "Abandoned":
      return "caution";
    default:
      return "none";
  }
}

export function registrationLabel(status: string | null): string {
  switch (status) {
    case "Issued":
      return "Registration issued";
    case "Expired":
      return "Registration expired";
    case "In Progress":
      return "Registration in progress";
    case "Rejected":
      return "Registration rejected";
    case "Revoked":
      return "Registration revoked";
    case "Abandoned":
      return "Application abandoned";
    case "Closed":
      return "File closed";
    default:
      return "Nothing on file";
  }
}

/* ------------------------------------------------------------------ */
/* management firms — public business records only                     */
/* ------------------------------------------------------------------ */

export interface RegisteredFirm {
  id: number;
  name: string;
  street: string | null;
  city: string | null;
  license: string | null;
  status: string | null;
}

/**
 * Names that identify a business rather than a person. Deliberately strong
 * markers only: "PA", "LP", "CO" and "TRUST" attach to sole practitioners as
 * often as to firms, so they don't qualify anything on their own.
 */
const BUSINESS_MARKER =
  /\b(INC|INCORPORATED|L\.?L\.?C|CORP|CORPORATION|COMPANY|MANAGEMENT|MGMT|SERVICES|GROUP|ASSOCIATES|PROPERTIES|REALTY|ENTERPRISES|PARTNERS|HOLDINGS|SOLUTIONS|ADVISORS|COMMUNITIES|CONSULTING|MANAGERS)\b/i;

/** Legal suffixes that a sole practitioner can carry as easily as a firm. */
const LEGAL_SUFFIX = /\b(INC|INCORPORATED|L\.?L\.?C|CORP|CORPORATION|LTD|L\.?P\.?|P\.?A\.?|PLLC|CO)\b\.?/gi;

/**
 * Despite its name, management_firms is mostly individuals: 10,321 of its
 * 12,596 rows are "SURNAME, FORENAME" sole licensees, not companies. Their
 * names sit beside a street address, which makes them personal data whatever
 * table they happen to live in — so this defaults to deny and publishes a row
 * only when the name positively identifies a business.
 *
 * "HARBOR MANAGEMENT SERVICES, INC." publishes; "LEE, PATRICIA N" does not,
 * and neither does "LEE, PATRICIA N LLC" — a sole proprietor's registration
 * still names a person. Genuine firms without a marker word ("FirstService
 * Residential") are held back too; a false negative costs a listing, a false
 * positive publishes someone's name and address.
 */
function isPublishableFirm(name: string): boolean {
  const clean = name.trim();
  if (!clean || !BUSINESS_MARKER.test(clean)) return false;

  const comma = clean.indexOf(",");
  if (comma === -1) return true;

  // A marker ahead of the comma means the name itself is the business.
  if (BUSINESS_MARKER.test(clean.slice(0, comma))) return true;

  // Otherwise the marker is a trailing suffix on what reads as a person.
  const trailing = clean.slice(comma + 1).replace(LEGAL_SUFFIX, "");
  return BUSINESS_MARKER.test(trailing);
}

/**
 * Licensed management firms whose registered business address matches this
 * association's address. This is co-location in two public files — it is NOT
 * evidence that the firm manages the association, and the page must not say it
 * is. Individually-licensed people are filtered out entirely, and
 * board_contacts and cam_licensees are never read.
 */
export async function getFirmsAtAddress(
  association: Association
): Promise<RegisteredFirm[]> {
  if (!association.zip) return [];

  const { data, error } = await supabase
    .from("management_firms")
    .select("id, firm_name, street, city, license, status")
    .eq("zip", association.zip);

  if (error) {
    console.error("[associations/firms]", error.message);
    return [];
  }

  const address = association.address.toUpperCase();

  return ((data ?? []) as Pick<
    ManagementFirm,
    "id" | "firm_name" | "street" | "city" | "license" | "status"
  >[])
    .filter((firm) => {
      const street = firm.street?.trim().toUpperCase();
      if (!street || !address.startsWith(street)) return false;
      return isPublishableFirm(firm.firm_name ?? "");
    })
    .map((firm) => ({
      id: firm.id,
      name: firm.firm_name?.trim() ?? "Unnamed firm",
      street: firm.street?.trim() ?? null,
      city: firm.city?.trim() ?? null,
      license: firm.license?.trim() ?? null,
      status: firm.status?.trim() ?? null,
    }));
}
