-- SoFloCondoVerify — multi-step qualifier answers on captured leads.
--
-- The multi-step inquiry modal captures qualifier answers per lead before
-- the contact step. The questions vary by flow (finance, sell, board, etc.),
-- so a single JSONB column stores them rather than 30+ nullable columns.
--
-- Nullable: leads from the original single-step InquiryForm carry no
-- qualifier answers and should read as null rather than empty.
--
-- leads stays RLS-gated with no policies: server-only, secret key.

alter table public.leads
  add column if not exists answers jsonb;
