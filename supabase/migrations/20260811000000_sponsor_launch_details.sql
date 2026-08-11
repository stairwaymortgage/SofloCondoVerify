-- Fill in the real launch-sponsor details.
--
-- 20260810000000_create_sponsors.sql seeded both rows with a placeholder NMLS
-- number and no destinations, on purpose: credential_line renders verbatim in
-- a public advertisement, so an invented licence number is worse than a blank
-- one. These are the supplied real values.
--
-- Matched on name, not id — the ids are identity-generated and a rebuilt
-- database must land the same corrections.

update public.sponsors
set credential_line = 'NMLS #1072866 · Equal Housing Lender · Stairway Mortgage',
    link_url        = 'https://www.stairwaymortgage.com/'
where name = 'Jim Blackburn';

update public.sponsors
set link_url = 'https://www.olgablackburn.com/'
where name = 'Olga Blackburn';
