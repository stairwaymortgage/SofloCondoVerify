-- SoFloCondoVerify — destinations for the forms catalog.
--
-- The forms table has never had anywhere to put a URL. host_or_link holds a
-- plan ("Link", "Template", "Host"), not a destination, so /forms renders
-- eight documents as plain text with nothing to click — the page says so in
-- a banner. These two columns are what a real link needs.
--
-- Two columns rather than one because the two cases behave differently in
-- the markup: link_url leaves the site and opens in a new tab with
-- rel="noopener noreferrer"; file_path is ours and downloads in place.
-- Collapsing them into one column would mean sniffing the value at render
-- time to decide which, and getting that wrong sends a visitor off-site
-- without warning.
--
-- Both nullable with no default: a row that has neither is the honest state
-- for a catalog entry we have not sourced yet, and it renders exactly as it
-- does today. Nothing is backfilled here.
--
-- No index. The table holds nine rows and is read in full on every request;
-- an index on it would cost more to maintain than it could ever save.
--
-- forms stays publicly readable — the existing select policy is unchanged.

alter table public.forms
  add column if not exists link_url  text,
  add column if not exists file_path text;
