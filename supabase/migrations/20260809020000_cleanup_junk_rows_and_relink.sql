-- Data cleanup.
--
-- The source CSVs (data/companies.csv, data/authority_links.csv) have been
-- corrected too, so a fresh load produces this state directly. These statements
-- are idempotent and exist so an already-loaded database converges to the same
-- result without a reload.

-- 1. Drop the placeholder company row ("✕"). It carried the slug "developers",
--    the stub that 223 project rows point at; with it gone, a naive slug join
--    can no longer resolve to anything at all.
delete from public.companies where trim(company) = '✕';

-- 2. De-duplicate authority_links on a case-insensitive URL, keeping the lowest
--    id — here .../Statutes/, the capitalisation the Florida Legislature uses.
delete from public.authority_links a
  using public.authority_links b
  where lower(trim(a.url)) = lower(trim(b.url))
    and a.id > b.id;

-- 3. Re-resolve developer links, still excluding the "developers" stub, so a row
--    with no real developer stays null rather than gaining a fabricated link.
--    Resolves 124/127 (precon_miami) and 217/431 (existing_towers).
update public.precon_miami p set company_id = (
  select c.id from public.companies c
  where lower(trim(c.url_slug)) <> 'developers'
    and trim(c.company) <> '✕'
    and ( (coalesce(trim(p.developer_page_slug),'') not in ('', 'developers')
           and lower(trim(c.url_slug)) = lower(trim(p.developer_page_slug)))
       or (coalesce(trim(p.lead_developer),'') <> ''
           and lower(trim(c.company)) = lower(trim(p.lead_developer))) )
  order by case when lower(trim(c.url_slug)) = lower(trim(p.developer_page_slug)) then 0 else 1 end
  limit 1
);

update public.existing_towers e set company_id = (
  select c.id from public.companies c
  where lower(trim(c.url_slug)) <> 'developers'
    and trim(c.company) <> '✕'
    and ( (coalesce(trim(e.developer_page_slug),'') not in ('', 'developers')
           and lower(trim(c.url_slug)) = lower(trim(e.developer_page_slug)))
       or (coalesce(trim(e.lead_developer),'') <> ''
           and lower(trim(c.company)) = lower(trim(e.lead_developer))) )
  order by case when lower(trim(c.url_slug)) = lower(trim(e.developer_page_slug)) then 0 else 1 end
  limit 1
);

-- precon_broward stays unlinked on purpose: its source carries no developer
-- values, so there is nothing to join. Not fabricated.
