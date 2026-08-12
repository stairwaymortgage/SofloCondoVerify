-- SoFloCondoVerify — GoHighLevel delivery state on each lead.
--
-- Supabase stays the source of truth for a lead; GHL is a delivery target.
-- These two columns record whether that delivery happened, so a lead that
-- never reached the CRM is a query rather than a discovery months later:
--
--   select * from leads where not ghl_synced order by created_at desc;
--
-- ghl_synced defaults to false, which is the honest state for every row
-- captured before this integration existed — none of them were sent.
--
-- leads stays RLS-gated with no policies: server-only, secret key.

alter table public.leads
  add column if not exists ghl_synced     boolean not null default false,
  add column if not exists ghl_contact_id text;

-- Partial index: the interesting rows are the unsynced ones, and they should
-- stay a small tail of the table.
create index if not exists leads_ghl_unsynced_idx
  on public.leads (created_at desc)
  where not ghl_synced;
