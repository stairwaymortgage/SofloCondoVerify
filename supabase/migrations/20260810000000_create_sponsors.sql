-- SoFloCondoVerify — sponsor (advertising) inventory.
--
-- This is ad inventory, not personal data: it is publicly readable by design,
-- because every row is rendered in a labeled "Advertisement" unit. Inactive
-- rows stay invisible to the public key — the RLS policy gates on `active`.
--
-- Sponsor units never replace the neutral "Get connected" matching card; they
-- sit alongside it and are always labeled.

create table if not exists public.sponsors (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),

  name            text not null,
  -- lender | agent | foreign-national | board-firm
  type            text not null,
  tagline         text,
  -- Licence / disclosure line shown verbatim under the name.
  credential_line text,
  logo_initials   text,
  link_url        text,

  -- Page types this sponsor may appear on: building, precon, city, faq, risk,
  -- or 'all'. Matched with array containment.
  target_pages    text[] not null default array['all']::text[],

  -- Lower sorts first within a page type.
  priority        integer not null default 100,
  active          boolean not null default true
);

create index if not exists sponsors_active_priority_idx
  on public.sponsors (active, priority);
create index if not exists sponsors_target_pages_idx
  on public.sponsors using gin (target_pages);

alter table public.sponsors enable row level security;

drop policy if exists "Active sponsors are publicly readable" on public.sponsors;
create policy "Active sponsors are publicly readable"
  on public.sponsors for select
  to anon, authenticated
  using (active);

-- Launch sponsors.
-- NOTE: credential_line is rendered verbatim in a public advertisement.
-- Jim's NMLS number is still a placeholder and MUST be filled before this
-- goes live; link_url is null for both until real destinations are supplied,
-- and the slot renders without a link rather than inventing one.
insert into public.sponsors
  (name, type, tagline, credential_line, logo_initials, target_pages, priority)
values
  (
    'Jim Blackburn',
    'lender',
    'Conventional & foreign-national eligibility checks',
    'NMLS #_______ · Equal Housing Lender · Stairway Mortgage',
    'JB',
    array['all']::text[],
    10
  ),
  (
    'Olga Blackburn',
    'agent',
    'Buying or selling in South Florida',
    'FL Lic. SL3569153 · The Keyes Company',
    'OB',
    array['all']::text[],
    20
  )
on conflict do nothing;
