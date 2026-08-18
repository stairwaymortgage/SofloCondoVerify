-- SoFloCondoVerify — TCPA consent record on captured leads.
--
-- InquiryForm shows a required, never-pre-ticked checkbox above the submit
-- button on the four audience pages, and /api/leads already refuses any
-- submission that carries the field as anything other than boolean true. That
-- refusal is enforcement, not evidence: nothing about the tick survived the
-- request, so the only thing proving consent was that the row existed at all.
-- These two columns are the record.
--
-- Two columns rather than one because the boolean alone is not defensible.
-- What a TCPA challenge asks is not "did they tick something" but "what
-- exactly did they agree to" — and consentText in lib/disclosures.ts will be
-- reissued if the calling party or the wording ever changes. Storing the
-- wording as shown at capture time means a later revision cannot retroactively
-- alter what an earlier lead appears to have consented to; a lone boolean
-- would silently inherit whatever the constant says today.
--
-- Both nullable with no default: leads captured before this column existed,
-- and leads from forms that have no consent box (ConnectForm on /connect),
-- are honestly unrecorded rather than defaulted to false — which would read as
-- "this person was asked and declined" when they were never asked. Null means
-- not asked; false would mean asked and refused, and that distinction is the
-- whole reason not to put `not null default false` here.
--
-- No index. Consent is read one row at a time as evidence for a specific
-- lead, never aggregated on a hot path, and the table is small; an audit sweep
-- for rows missing consent is a rare full scan and does not justify the write
-- cost on every insert.
--
-- leads stays RLS-gated with no policies: server-only, secret key.

alter table public.leads
  add column if not exists consent_given boolean,
  add column if not exists consent_text  text;
