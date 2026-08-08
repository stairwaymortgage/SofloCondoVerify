-- Cross-links between the workbook tables.
--
-- Surrogate FKs (company_id / city_hub_id) rather than FKs on the slug itself,
-- so editing a slug can't orphan a row.
--
-- The backfill deliberately ignores the literal slug "developers". It is a stub
-- that appears on 223 rows across the three project tables (212 existing_towers,
-- 9 precon_broward, 2 precon_miami) and resolves to a junk companies row whose
-- name is "✕". Matching it would fabricate 223 developer links.

alter table public.precon_miami
  add column if not exists company_id bigint references public.companies (id) on delete set null;
alter table public.precon_broward
  add column if not exists company_id bigint references public.companies (id) on delete set null;
alter table public.existing_towers
  add column if not exists company_id bigint references public.companies (id) on delete set null;
alter table public.faq
  add column if not exists city_hub_id bigint references public.city_hubs (id) on delete set null;
alter table public.keyword_map
  add column if not exists city_hub_id bigint references public.city_hubs (id) on delete set null;

create index if not exists precon_miami_company_id_idx on public.precon_miami (company_id);
create index if not exists precon_broward_company_id_idx on public.precon_broward (company_id);
create index if not exists existing_towers_company_id_idx on public.existing_towers (company_id);
create index if not exists faq_city_hub_id_idx on public.faq (city_hub_id);
create index if not exists keyword_map_city_hub_id_idx on public.keyword_map (city_hub_id);

-- Backfill: prefer an exact slug match, fall back to an exact developer-name match.

update public.precon_miami p set company_id = (
  select c.id from public.companies c
  where lower(trim(c.url_slug)) <> 'developers'
    and ( (coalesce(trim(p.developer_page_slug),'') not in ('', 'developers')
           and lower(trim(c.url_slug)) = lower(trim(p.developer_page_slug)))
       or (coalesce(trim(p.lead_developer),'') <> ''
           and lower(trim(c.company)) = lower(trim(p.lead_developer))) )
  order by case when lower(trim(c.url_slug)) = lower(trim(p.developer_page_slug)) then 0 else 1 end
  limit 1
);

-- Note: this resolves 0 of 37. precon_broward has no usable developer data —
-- `delivery` is empty in all 37 rows, `developer` holds a delivery year, and
-- `address` holds delivery status text. The source columns are mislabeled.
update public.precon_broward p set company_id = (
  select c.id from public.companies c
  where lower(trim(c.url_slug)) <> 'developers'
    and ( (coalesce(trim(p.developer_page_slug),'') not in ('', 'developers')
           and lower(trim(c.url_slug)) = lower(trim(p.developer_page_slug)))
       or (coalesce(trim(p.developer),'') <> ''
           and lower(trim(c.company)) = lower(trim(p.developer))) )
  order by case when lower(trim(c.url_slug)) = lower(trim(p.developer_page_slug)) then 0 else 1 end
  limit 1
);

update public.existing_towers e set company_id = (
  select c.id from public.companies c
  where lower(trim(c.url_slug)) <> 'developers'
    and ( (coalesce(trim(e.developer_page_slug),'') not in ('', 'developers')
           and lower(trim(c.url_slug)) = lower(trim(e.developer_page_slug)))
       or (coalesce(trim(e.lead_developer),'') <> ''
           and lower(trim(c.company)) = lower(trim(e.lead_developer))) )
  order by case when lower(trim(c.url_slug)) = lower(trim(e.developer_page_slug)) then 0 else 1 end
  limit 1
);

update public.faq f set city_hub_id = h.id
  from public.city_hubs h
  where lower(trim(h.url_slug_hub)) = lower(trim(f.city_hub_slug));

update public.keyword_map k set city_hub_id = h.id
  from public.city_hubs h
  where lower(trim(h.url_slug_hub)) = lower(trim(k.hub_slug));
