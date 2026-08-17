/**
 * Single source of truth for the 20 workbook tables: column types, RLS posture,
 * and indexes. Both the migration DDL and the CSV loader are generated from
 * this, so the schema and the load can't drift apart.
 *
 * Types are text unless the data is genuinely numeric. Columns that *look*
 * numeric but aren't (precon_broward.units = "160 private + 79 resort",
 * zip = "33176-3816") stay text — coercing them would silently invent data.
 */

export type ColumnType = "text" | "integer" | "numeric";

export interface WorkbookSpec {
  /** Postgres table name (matches the CSV name). */
  table: string;
  file: string;
  /** Row count we expect after loading — verified at the end of the load. */
  expected: number;
  /**
   * true => RLS enabled with NO policies: unreachable with the publishable
   * key, server/secret-key only. Used for tables holding personal data.
   */
  gated: boolean;
  /** Column name -> type, in CSV order. */
  columns: Record<string, ColumnType>;
  /** DB column -> CSV header, only where they differ. */
  renames?: Record<string, string>;
  /** Columns to index as lower(col) for case-insensitive lookup. */
  lowerIndexes?: string[];
  /** Freeform note surfaced in the load log. */
  note?: string;
}

const T = "text" as const;
const I = "integer" as const;
const N = "numeric" as const;

export const WORKBOOKS: WorkbookSpec[] = [
  // ---------- PRECON / EXISTING ----------
  {
    table: "precon_miami",
    file: "precon_miami.csv",
    expected: 127,
    gated: false,
    columns: {
      project: T, neighborhood: T, status: T, sold_out: T, str_allowed: T,
      str_detail: T, price_from: I, bedrooms: T, commission: T, delivery: T,
      delivery_year: I, architect: T, lead_developer: T, url_slug: T,
      developer_page_slug: T,
    },
    lowerIndexes: ["url_slug", "developer_page_slug"],
  },
  {
    table: "precon_broward",
    file: "precon_broward.csv",
    expected: 37,
    gated: false,
    // units/floors are text: 32% and 22% of values are non-numeric prose.
    columns: {
      project: T, city: T, area: T, status: T, sold_out: T, str_allowed: T,
      str_detail: T, price_from: I, bedrooms: T, sf_range: T, units: T,
      floors: T, delivery: T, address: T, developer: T, url_slug: T,
      developer_page_slug: T,
    },
    lowerIndexes: ["city", "url_slug", "developer_page_slug"],
    note: "units/floors kept text — values like '160 private + 79 resort'",
  },
  {
    table: "existing_towers",
    file: "existing_towers.csv",
    expected: 431,
    gated: false,
    columns: {
      building: T, neighborhood: T, units: I, floors: I, year_built: I,
      str_allowed: T, str_detail: T, architect: T, lead_developer: T,
      url_slug: T, developer_page_slug: T,
    },
    lowerIndexes: ["url_slug", "developer_page_slug"],
  },

  // ---------- COMPANIES / PEOPLE ----------
  {
    table: "companies",
    file: "companies.csv",
    // 510 after removing the "✕" placeholder row (slug "developers").
    expected: 510,
    gated: false,
    columns: { company: T, type: T, developments: I, headquarters: T, url_slug: T },
    lowerIndexes: ["url_slug"],
  },
  {
    table: "people",
    file: "people.csv",
    expected: 174,
    gated: false,
    columns: {
      name: T, role: T, company: T, title: T, current_projects: T,
      past_projects: T, website_linkedin: T, profile_depth: T, url_slug: T,
    },
    lowerIndexes: ["url_slug"],
  },

  // ---------- CONTENT / CITIES ----------
  {
    table: "city_hubs",
    file: "city_hubs.csv",
    expected: 104,
    gated: false,
    // flags_2 <- "2_flags": a leading digit is not a valid bare identifier.
    columns: {
      city: T, county: T, population: I, coastal_water: T, identity_nickname: T,
      known_for_hooks: T, condo_relevance: T, buildings_tracked: I,
      fha_approved: I, fha_expired: I, va_accepted: I, va_rejected: I,
      precon_pipeline: I, flags_2: I, url_slug_hub: T, primary_keyword: T,
      page_template: T, wikipedia_ref: T,
    },
    renames: { flags_2: "2_flags" },
    lowerIndexes: ["city", "url_slug_hub"],
    note: "population parsed from '~3,093' style values (approx marker dropped)",
  },
  {
    table: "faq",
    file: "faq.csv",
    expected: 7524,
    gated: false,
    columns: {
      city: T, county: T, col: I, question: T, answer: T, cluster: T,
      url_slug: T, primary_keyword: T, page_template: T, city_hub_slug: T,
    },
    lowerIndexes: ["city", "url_slug", "city_hub_slug"],
  },
  {
    table: "keyword_map",
    file: "keyword_map.csv",
    expected: 1033,
    gated: false,
    columns: {
      city: T, county: T, cluster: T, faq_pages: I, primary_keyword: T,
      hub_slug: T,
    },
    lowerIndexes: ["city", "hub_slug"],
  },

  // ---------- REFERENCE ----------
  {
    table: "statutes",
    file: "statutes.csv",
    expected: 16,
    gated: false,
    columns: {
      ref: T, citation: T, topic: T, requirement_threshold: T,
      retention_deadline: T, source_doc: T,
    },
  },
  {
    table: "records_access",
    file: "records_access.csv",
    expected: 30,
    gated: false,
    // `col` stays text: values include "11d" / "11e".
    columns: {
      col: T, record_category: T, owner_accessible: T, retention_period: T,
      notes: T,
    },
  },
  {
    table: "market_stats",
    file: "market_stats.csv",
    expected: 24,
    gated: false,
    columns: {
      metric_id: T, metric: T, county_scope: T, period: T, value: T,
      comparison_period: T, comparison_value: T, change: T, source: T,
    },
  },
  {
    table: "agencies",
    file: "agencies.csv",
    expected: 15,
    gated: false,
    columns: {
      organization_office: T, sub_office_role: T, category: T, phone: T,
      toll_free_alt: T, email: T, address: T, website: T, status: T,
      notes: T, source: T,
    },
  },
  {
    table: "legal_aid",
    file: "legal_aid.csv",
    expected: 10,
    gated: false,
    columns: {
      organization_firm: T, contact_role: T, category: T, phone: T,
      toll_free_alt: T, email: T, address_location: T, website: T, status: T,
      notes: T, source: T,
    },
  },
  {
    table: "authority_links",
    file: "authority_links.csv",
    // 127 after de-duplicating the statutes URL that differed only by case.
    expected: 127,
    gated: false,
    columns: { url: T, domain: T, type: T, use_for_outbound_link: T },
  },
  {
    table: "forms",
    file: "forms.csv",
    expected: 9,
    gated: false,
    // link_url / file_path are carried here so a reload cannot silently drop
    // destinations that only exist in the table. Without them the loader
    // truncates and re-inserts five columns, and every link is lost.
    columns: {
      form_template: T, purpose: T, source_authority: T, host_or_link: T,
      status: T, link_url: T, file_path: T,
    },
  },

  // ---------- ASSOCIATIONS ----------
  {
    table: "board_contacts",
    file: "board_contacts.csv",
    expected: 1090,
    gated: true, // personal names + phones
    columns: {
      association: T, city: T, county: T, contact_name: T, position: T,
      mailing_address: T, phone: T, source: T, publish: T,
    },
    lowerIndexes: ["city"],
    note: "gated: RLS with no policies; publish column gates rows even server-side",
  },
  {
    table: "management_firms",
    file: "management_firms.csv",
    expected: 12596,
    gated: false,
    columns: {
      firm_name: T, street: T, city: T, county: T, zip: T, license: T, status: T,
    },
    lowerIndexes: ["city"],
  },
  {
    table: "cam_licensees",
    file: "cam_licensees.csv",
    expected: 10093,
    gated: true, // personal names + addresses
    columns: {
      name: T, street: T, city: T, zip: T, license: T, expiration: T,
      ce_credits: N,
    },
    lowerIndexes: ["city"],
    note: "gated: RLS with no policies; ce_credits is numeric (values like 205.5)",
  },
  {
    table: "building_officials",
    file: "building_officials.csv",
    expected: 32,
    gated: false,
    columns: {
      jurisdiction: T, building_official: T, address: T, phone: T, fax: T,
      email: T,
    },
  },
  {
    table: "assn_registry",
    file: "assn_registry.csv",
    expected: 4055,
    gated: false,
    columns: {
      registration: T, association_name: T, address: T, type: T,
      registration_status: T, enforcement_status: T, reg_date: T,
    },
  },
];

/** The CSV header a given DB column reads from. */
export function csvHeader(spec: WorkbookSpec, column: string): string {
  return spec.renames?.[column] ?? column;
}

/** Generates the full migration DDL for every workbook table. */
export function buildMigrationSql(): string {
  const out: string[] = [
    "-- SoFloCondoVerify — 20 workbook tables (generated from scripts/workbooks.ts)",
    "-- Public reference data is anon-readable. Tables holding personal data",
    "-- (board_contacts, cam_licensees) get RLS with NO policies: reachable only",
    "-- with the secret key, never with the publishable key.",
  ];

  for (const spec of WORKBOOKS) {
    const cols = Object.entries(spec.columns)
      .map(([name, type]) => `  ${name.padEnd(22)} ${type}`)
      .join(",\n");

    out.push(
      "",
      `-- ${spec.table} (${spec.expected} rows)${spec.gated ? " — GATED" : ""}`,
      `create table if not exists public.${spec.table} (`,
      `  id                     bigint generated always as identity primary key,`,
      `  created_at             timestamptz not null default now(),`,
      `${cols}`,
      `);`
    );

    for (const column of spec.lowerIndexes ?? []) {
      out.push(
        `create index if not exists ${spec.table}_${column}_lower_idx`,
        `  on public.${spec.table} (lower(${column}));`
      );
    }

    out.push(`alter table public.${spec.table} enable row level security;`);

    if (spec.gated) {
      out.push(
        `-- no policies: ${spec.table} holds personal data and is secret-key only`
      );
    } else {
      out.push(
        `drop policy if exists "${spec.table} are publicly readable" on public.${spec.table};`,
        `create policy "${spec.table} are publicly readable"`,
        `  on public.${spec.table} for select to anon, authenticated using (true);`
      );
    }
  }

  // Even with the secret key, unpublished board contacts should not be read
  // casually — this view is the intended read path for application code.
  out.push(
    "",
    "-- Publishable subset of board_contacts. Application code reads this view,",
    "-- never the base table, so unpublished rows stay gated server-side too.",
    "create or replace view public.board_contacts_publishable",
    "  with (security_invoker = true) as",
    "  select id, created_at, association, city, county, contact_name, position,",
    "         mailing_address, phone, source",
    "  from public.board_contacts",
    "  where lower(coalesce(publish, '')) = 'published';"
  );

  return out.join("\n") + "\n";
}
