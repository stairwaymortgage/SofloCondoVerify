-- SoFloCondoVerify — per-page lead attribution.
--
-- source_page is the path the form was submitted from ("/buyers",
-- "/preconstruction"). It was already being sent to GoHighLevel as a custom
-- field, but it was never stored on our side, so "how many leads did the
-- foreign-buyers page produce" was a question only the CRM could answer —
-- and only for leads whose GHL push succeeded.
--
-- Nullable with no default: leads captured before this column existed, and
-- leads from forms that don't set it, are honestly unattributed rather than
-- silently bucketed into some catch-all.
--
-- leads stays RLS-gated with no policies: server-only, secret key.

alter table public.leads
  add column if not exists source_page text;

-- Attribution reads group by page over a date range.
create index if not exists leads_source_page_idx
  on public.leads (source_page, created_at desc);
