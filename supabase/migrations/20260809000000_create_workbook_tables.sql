-- SoFloCondoVerify — 20 workbook tables (generated from scripts/workbooks.ts)
-- Public reference data is anon-readable. Tables holding personal data
-- (board_contacts, cam_licensees) get RLS with NO policies: reachable only
-- with the secret key, never with the publishable key.

-- precon_miami (127 rows)
create table if not exists public.precon_miami (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  project                text,
  neighborhood           text,
  status                 text,
  sold_out               text,
  str_allowed            text,
  str_detail             text,
  price_from             integer,
  bedrooms               text,
  commission             text,
  delivery               text,
  delivery_year          integer,
  architect              text,
  lead_developer         text,
  url_slug               text,
  developer_page_slug    text
);
create index if not exists precon_miami_url_slug_lower_idx
  on public.precon_miami (lower(url_slug));
create index if not exists precon_miami_developer_page_slug_lower_idx
  on public.precon_miami (lower(developer_page_slug));
alter table public.precon_miami enable row level security;
drop policy if exists "precon_miami are publicly readable" on public.precon_miami;
create policy "precon_miami are publicly readable"
  on public.precon_miami for select to anon, authenticated using (true);

-- precon_broward (37 rows)
create table if not exists public.precon_broward (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  project                text,
  city                   text,
  area                   text,
  status                 text,
  sold_out               text,
  str_allowed            text,
  str_detail             text,
  price_from             integer,
  bedrooms               text,
  sf_range               text,
  units                  text,
  floors                 text,
  delivery               text,
  address                text,
  developer              text,
  url_slug               text,
  developer_page_slug    text
);
create index if not exists precon_broward_city_lower_idx
  on public.precon_broward (lower(city));
create index if not exists precon_broward_url_slug_lower_idx
  on public.precon_broward (lower(url_slug));
create index if not exists precon_broward_developer_page_slug_lower_idx
  on public.precon_broward (lower(developer_page_slug));
alter table public.precon_broward enable row level security;
drop policy if exists "precon_broward are publicly readable" on public.precon_broward;
create policy "precon_broward are publicly readable"
  on public.precon_broward for select to anon, authenticated using (true);

-- existing_towers (431 rows)
create table if not exists public.existing_towers (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  building               text,
  neighborhood           text,
  units                  integer,
  floors                 integer,
  year_built             integer,
  str_allowed            text,
  str_detail             text,
  architect              text,
  lead_developer         text,
  url_slug               text,
  developer_page_slug    text
);
create index if not exists existing_towers_url_slug_lower_idx
  on public.existing_towers (lower(url_slug));
create index if not exists existing_towers_developer_page_slug_lower_idx
  on public.existing_towers (lower(developer_page_slug));
alter table public.existing_towers enable row level security;
drop policy if exists "existing_towers are publicly readable" on public.existing_towers;
create policy "existing_towers are publicly readable"
  on public.existing_towers for select to anon, authenticated using (true);

-- companies (511 rows)
create table if not exists public.companies (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  company                text,
  type                   text,
  developments           integer,
  headquarters           text,
  url_slug               text
);
create index if not exists companies_url_slug_lower_idx
  on public.companies (lower(url_slug));
alter table public.companies enable row level security;
drop policy if exists "companies are publicly readable" on public.companies;
create policy "companies are publicly readable"
  on public.companies for select to anon, authenticated using (true);

-- people (174 rows)
create table if not exists public.people (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  name                   text,
  role                   text,
  company                text,
  title                  text,
  current_projects       text,
  past_projects          text,
  website_linkedin       text,
  profile_depth          text,
  url_slug               text
);
create index if not exists people_url_slug_lower_idx
  on public.people (lower(url_slug));
alter table public.people enable row level security;
drop policy if exists "people are publicly readable" on public.people;
create policy "people are publicly readable"
  on public.people for select to anon, authenticated using (true);

-- city_hubs (104 rows)
create table if not exists public.city_hubs (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  city                   text,
  county                 text,
  population             integer,
  coastal_water          text,
  identity_nickname      text,
  known_for_hooks        text,
  condo_relevance        text,
  buildings_tracked      integer,
  fha_approved           integer,
  fha_expired            integer,
  va_accepted            integer,
  va_rejected            integer,
  precon_pipeline        integer,
  flags_2                integer,
  url_slug_hub           text,
  primary_keyword        text,
  page_template          text,
  wikipedia_ref          text
);
create index if not exists city_hubs_city_lower_idx
  on public.city_hubs (lower(city));
create index if not exists city_hubs_url_slug_hub_lower_idx
  on public.city_hubs (lower(url_slug_hub));
alter table public.city_hubs enable row level security;
drop policy if exists "city_hubs are publicly readable" on public.city_hubs;
create policy "city_hubs are publicly readable"
  on public.city_hubs for select to anon, authenticated using (true);

-- faq (7524 rows)
create table if not exists public.faq (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  city                   text,
  county                 text,
  col                    integer,
  question               text,
  answer                 text,
  cluster                text,
  url_slug               text,
  primary_keyword        text,
  page_template          text,
  city_hub_slug          text
);
create index if not exists faq_city_lower_idx
  on public.faq (lower(city));
create index if not exists faq_url_slug_lower_idx
  on public.faq (lower(url_slug));
create index if not exists faq_city_hub_slug_lower_idx
  on public.faq (lower(city_hub_slug));
alter table public.faq enable row level security;
drop policy if exists "faq are publicly readable" on public.faq;
create policy "faq are publicly readable"
  on public.faq for select to anon, authenticated using (true);

-- keyword_map (1033 rows)
create table if not exists public.keyword_map (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  city                   text,
  county                 text,
  cluster                text,
  faq_pages              integer,
  primary_keyword        text,
  hub_slug               text
);
create index if not exists keyword_map_city_lower_idx
  on public.keyword_map (lower(city));
create index if not exists keyword_map_hub_slug_lower_idx
  on public.keyword_map (lower(hub_slug));
alter table public.keyword_map enable row level security;
drop policy if exists "keyword_map are publicly readable" on public.keyword_map;
create policy "keyword_map are publicly readable"
  on public.keyword_map for select to anon, authenticated using (true);

-- statutes (16 rows)
create table if not exists public.statutes (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  ref                    text,
  citation               text,
  topic                  text,
  requirement_threshold  text,
  retention_deadline     text,
  source_doc             text
);
alter table public.statutes enable row level security;
drop policy if exists "statutes are publicly readable" on public.statutes;
create policy "statutes are publicly readable"
  on public.statutes for select to anon, authenticated using (true);

-- records_access (30 rows)
create table if not exists public.records_access (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  col                    text,
  record_category        text,
  owner_accessible       text,
  retention_period       text,
  notes                  text
);
alter table public.records_access enable row level security;
drop policy if exists "records_access are publicly readable" on public.records_access;
create policy "records_access are publicly readable"
  on public.records_access for select to anon, authenticated using (true);

-- market_stats (24 rows)
create table if not exists public.market_stats (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  metric_id              text,
  metric                 text,
  county_scope           text,
  period                 text,
  value                  text,
  comparison_period      text,
  comparison_value       text,
  change                 text,
  source                 text
);
alter table public.market_stats enable row level security;
drop policy if exists "market_stats are publicly readable" on public.market_stats;
create policy "market_stats are publicly readable"
  on public.market_stats for select to anon, authenticated using (true);

-- agencies (15 rows)
create table if not exists public.agencies (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  organization_office    text,
  sub_office_role        text,
  category               text,
  phone                  text,
  toll_free_alt          text,
  email                  text,
  address                text,
  website                text,
  status                 text,
  notes                  text,
  source                 text
);
alter table public.agencies enable row level security;
drop policy if exists "agencies are publicly readable" on public.agencies;
create policy "agencies are publicly readable"
  on public.agencies for select to anon, authenticated using (true);

-- legal_aid (10 rows)
create table if not exists public.legal_aid (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  organization_firm      text,
  contact_role           text,
  category               text,
  phone                  text,
  toll_free_alt          text,
  email                  text,
  address_location       text,
  website                text,
  status                 text,
  notes                  text,
  source                 text
);
alter table public.legal_aid enable row level security;
drop policy if exists "legal_aid are publicly readable" on public.legal_aid;
create policy "legal_aid are publicly readable"
  on public.legal_aid for select to anon, authenticated using (true);

-- authority_links (128 rows)
create table if not exists public.authority_links (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  url                    text,
  domain                 text,
  type                   text,
  use_for_outbound_link  text
);
alter table public.authority_links enable row level security;
drop policy if exists "authority_links are publicly readable" on public.authority_links;
create policy "authority_links are publicly readable"
  on public.authority_links for select to anon, authenticated using (true);

-- forms (9 rows)
create table if not exists public.forms (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  form_template          text,
  purpose                text,
  source_authority       text,
  host_or_link           text,
  status                 text
);
alter table public.forms enable row level security;
drop policy if exists "forms are publicly readable" on public.forms;
create policy "forms are publicly readable"
  on public.forms for select to anon, authenticated using (true);

-- board_contacts (1090 rows) — GATED
create table if not exists public.board_contacts (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  association            text,
  city                   text,
  county                 text,
  contact_name           text,
  position               text,
  mailing_address        text,
  phone                  text,
  source                 text,
  publish                text
);
create index if not exists board_contacts_city_lower_idx
  on public.board_contacts (lower(city));
alter table public.board_contacts enable row level security;
-- no policies: board_contacts holds personal data and is secret-key only

-- management_firms (12596 rows)
create table if not exists public.management_firms (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  firm_name              text,
  street                 text,
  city                   text,
  county                 text,
  zip                    text,
  license                text,
  status                 text
);
create index if not exists management_firms_city_lower_idx
  on public.management_firms (lower(city));
alter table public.management_firms enable row level security;
drop policy if exists "management_firms are publicly readable" on public.management_firms;
create policy "management_firms are publicly readable"
  on public.management_firms for select to anon, authenticated using (true);

-- cam_licensees (10093 rows) — GATED
create table if not exists public.cam_licensees (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  name                   text,
  street                 text,
  city                   text,
  zip                    text,
  license                text,
  expiration             text,
  ce_credits             numeric
);
create index if not exists cam_licensees_city_lower_idx
  on public.cam_licensees (lower(city));
alter table public.cam_licensees enable row level security;
-- no policies: cam_licensees holds personal data and is secret-key only

-- building_officials (32 rows)
create table if not exists public.building_officials (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  jurisdiction           text,
  building_official      text,
  address                text,
  phone                  text,
  fax                    text,
  email                  text
);
alter table public.building_officials enable row level security;
drop policy if exists "building_officials are publicly readable" on public.building_officials;
create policy "building_officials are publicly readable"
  on public.building_officials for select to anon, authenticated using (true);

-- assn_registry (4055 rows)
create table if not exists public.assn_registry (
  id                     bigint generated always as identity primary key,
  created_at             timestamptz not null default now(),
  registration           text,
  association_name       text,
  address                text,
  type                   text,
  registration_status    text,
  enforcement_status     text,
  reg_date               text
);
alter table public.assn_registry enable row level security;
drop policy if exists "assn_registry are publicly readable" on public.assn_registry;
create policy "assn_registry are publicly readable"
  on public.assn_registry for select to anon, authenticated using (true);

-- Publishable subset of board_contacts. Application code reads this view,
-- never the base table, so unpublished rows stay gated server-side too.
create or replace view public.board_contacts_publishable
  with (security_invoker = true) as
  select id, created_at, association, city, county, contact_name, position,
         mailing_address, phone, source
  from public.board_contacts
  where lower(coalesce(publish, '')) = 'published';

