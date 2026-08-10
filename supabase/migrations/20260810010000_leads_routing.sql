-- SoFloCondoVerify — lead routing scaffold.
--
-- No external integration yet. These columns let every lead be stamped with
-- the tier it was captured under, so turning routing up later is a config
-- change rather than a schema migration and a backfill.
--
-- leads stays RLS-gated with no policies: server-only, secret key.

alter table public.leads
  add column if not exists routing_tier text not null default 'tier1_founding',
  add column if not exists routed_to    text,
  add column if not exists status       text not null default 'new';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_status_check'
  ) then
    alter table public.leads
      add constraint leads_status_check
      check (status in ('new', 'contacted', 'closed'));
  end if;
end $$;

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_routing_tier_idx on public.leads (routing_tier);
