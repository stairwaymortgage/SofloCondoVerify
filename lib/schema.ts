import type { Building } from "./database.types";
import type { PreconProject } from "./precon";

/**
 * JSON-LD for building and preconstruction pages.
 *
 * Deliberately conservative: a Residence describes the building itself, which
 * is what these pages are. We do not publish RealEstateListing / Offer markup —
 * we are not the seller, nothing here is for sale, and a price in an Offer
 * would read as a listing we don't have.
 */

const FALLBACK_ORIGIN = "https://soflocondoverify.com";

/** Absolute URL for a site path. Set NEXT_PUBLIC_SITE_URL per environment. */
export function siteUrl(path = "/"): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_ORIGIN).replace(
    /\/+$/,
    ""
  );
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

type Json = Record<string, unknown>;

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Drops empty values so we never emit half-populated nodes. */
function compact(node: Json): Json {
  return Object.fromEntries(
    Object.entries(node).filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    )
  );
}

function postalAddress(parts: {
  street?: string | null;
  locality?: string | null;
  postalCode?: string | null;
}): Json | null {
  const address = compact({
    "@type": "PostalAddress",
    streetAddress: text(parts.street),
    addressLocality: text(parts.locality),
    addressRegion: "FL",
    postalCode: text(parts.postalCode),
    addressCountry: "US",
  });

  // Region and country alone say nothing useful — require one real component.
  return Object.keys(address).length > 3 ? address : null;
}

export function buildingSchema(building: Building): Json {
  const path = `/building/${building.id}`;

  return compact({
    "@context": "https://schema.org",
    "@type": "Residence",
    "@id": siteUrl(path),
    name: text(building.building_name) ?? "Condominium",
    url: siteUrl(path),
    address: postalAddress({
      street: building.address,
      locality: building.city,
      postalCode: building.zip,
    }),
  });
}

/** "754 (CBB) / 775 (TRD Apr 2026)" must not become a unit count. */
function unitCount(units: string | null): number | null {
  const clean = text(units);
  if (!clean || !/^\d[\d,]*$/.test(clean)) return null;
  const parsed = Number(clean.replace(/,/g, ""));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function preconSchema(project: PreconProject): Json {
  const path = `/preconstruction/${project.slug}`;

  return compact({
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    "@id": siteUrl(path),
    name: project.project,
    url: siteUrl(path),
    address: postalAddress({
      street: project.address,
      // Miami rows are keyed by neighborhood, Broward rows by city.
      locality: project.area,
    }),
    numberOfAccommodationUnits: unitCount(project.units),
  });
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: siteUrl(crumb.path),
    })),
  };
}

/**
 * JSON-LD is machine-readable markup we generate ourselves — no user input
 * reaches it unescaped beyond the record fields, which JSON.stringify quotes.
 * `<` is escaped so a stray angle bracket in a building name can't close the
 * script tag.
 */
export function jsonLdHtml(schemas: Json[]): string {
  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas).replace(
    /</g,
    "\\u003c"
  );
}
