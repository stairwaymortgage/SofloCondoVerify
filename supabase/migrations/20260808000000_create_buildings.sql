-- SoFloCondoVerify — buildings table
-- One row per South Florida condo building (Miami-Dade, Broward, Palm Beach).
-- Column names match data/buildings.csv headers exactly.

create extension if not exists pg_trgm with schema extensions;

create table if not exists public.buildings (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),

  -- identity / location
  building_name     text,
  county            text,
  city              text,
  zip               text,
  address           text,
  tri_county        text,

  -- rollup
  signal_count      integer,
  signals           text,

  -- FHA
  fha_status        text,
  fha_method        text,
  fha_exp           text,

  -- VA
  va_status         text,
  va_date           text,

  -- conventional (not publishable — reviewed privately)
  conv_review       text,
  conv_date         text,

  -- SB4D / milestone inspection
  sb4d              text,
  sb4d_bldgs_3plus  integer,
  sb4d_units        integer,

  -- SIRS / reserve study
  sirs_filed        text,

  -- association registry
  registry_status   text,
  registry_enf      text,

  -- 40-year recertification
  recert_year       integer,
  recert_status     text,

  -- preconstruction
  precon            text,
  precon_status     text
);

-- Lookup indexes.
create index if not exists buildings_city_lower_idx
  on public.buildings (lower(city));

create index if not exists buildings_zip_idx
  on public.buildings (zip);

-- Fuzzy building-name search (powers ilike '%q%' without a full scan).
create index if not exists buildings_building_name_trgm_idx
  on public.buildings using gin (lower(building_name) extensions.gin_trgm_ops);

-- Public record: readable by anyone, writable only via the service-role key
-- (which bypasses RLS entirely).
alter table public.buildings enable row level security;

drop policy if exists "buildings are publicly readable" on public.buildings;
create policy "buildings are publicly readable"
  on public.buildings
  for select
  to anon, authenticated
  using (true);
