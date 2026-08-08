-- SoFloCondoVerify — lead capture from /connect
-- Capture only: no routing or assignment logic yet.

create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),

  intent      text not null,
  building_id bigint references public.buildings (id) on delete set null,

  name        text not null,
  email       text,
  phone       text,
  message     text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_building_id_idx on public.leads (building_id);

-- Contact details are PII. RLS is on with NO policies, so the publishable/anon
-- key can neither read nor write this table. Inserts happen server-side in
-- /api/leads using the secret key, which bypasses RLS.
alter table public.leads enable row level security;
