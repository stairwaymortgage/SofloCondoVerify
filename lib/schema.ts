import type { Building } from "./database.types";
import type { PreconProject } from "./precon";
import { recordId } from "./signals";

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
    // Our own record number, exactly as the page prints it above the table.
    // Nothing is asserted about the building by it — it identifies the record.
    identifier: recordId(building),
    address: postalAddress({
      street: building.address,
      locality: building.city,
      postalCode: building.zip,
    }),
  });
}

/** The publisher of the record. The only claim here is who wrote the page. */
const PUBLISHER: Json = {
  "@type": "Organization",
  name: "SoFloCondoVerify",
  url: siteUrl("/"),
};

/**
 * The page that carries a record, as distinct from the thing it describes.
 *
 * This exists to answer "who published this" — a question every page on the
 * site left unanswered outside the nested publisher on Article pages. It
 * asserts nothing about the building: `about` points at the Residence node,
 * and the status columns the page displays are deliberately absent. FHA and
 * VA standing are dated public-record readings, not ratings, and there is no
 * schema.org property that carries them without implying an endorsement.
 */
export function recordPageSchema(
  /** The page being described, e.g. /building/1 or /building/1/risk. */
  path: string,
  /** The subject's canonical node — the Residence's @id, which is its path. */
  aboutPath: string,
  name: string
): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl(path)}#page`,
    url: siteUrl(path),
    name,
    about: { "@id": siteUrl(aboutPath) },
    isPartOf: { "@type": "WebSite", name: "SoFloCondoVerify", url: siteUrl("/") },
    publisher: PUBLISHER,
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

/** An explainer page. Article rather than FAQPage — these aren't Q&A. */
export function articleSchema(
  headline: string,
  description: string,
  path: string,
  dateModified: string
): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": siteUrl(path),
    headline,
    description,
    url: siteUrl(path),
    dateModified,
    publisher: { "@type": "Organization", name: "SoFloCondoVerify" },
  });
}

/**
 * A company we hold a record for. Address is emitted as a plain string because
 * companies.headquarters is a single free-text field, not parsed components.
 */
export function organizationSchema(
  name: string,
  path: string,
  headquarters: string | null
): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl(path),
    name,
    url: siteUrl(path),
    address: text(headquarters),
  });
}

/**
 * One question and its answer. FAQPage is only emitted for answers that pass
 * the thin-content guard — marking up a one-line answer invites a manual
 * action rather than a rich result.
 */
export function faqPageSchema(question: string, answer: string, path: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": siteUrl(path),
    url: siteUrl(path),
    mainEntity: [
      {
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      },
    ],
  };
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
