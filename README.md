# SoFloCondoVerify — scv-app

The web app for **soflocondoverify.com** — a neutral South Florida condo
verification authority (Miami-Dade, Broward, Palm Beach).

Stack: **Next.js 14 (App Router) · TypeScript · CSS Modules**.
Theme: Ocean Teal government-authority. Green = status only (approved/go); teal = brand/action.

## Getting started (local)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel → **Add New Project** → import the repo.
3. Framework preset auto-detects **Next.js**. No env vars needed for this first deploy.
4. Deploy. Every push to `main` auto-deploys; PRs get preview URLs.

## What's here now (Phase 0 — Foundation)

- `app/layout.tsx` — root layout, Google fonts (Public Sans + Roboto Mono), metadata
- `app/globals.css` — design tokens (the teal theme)
- `app/page.tsx` — homepage: hero + lookup form + stat bar + sample verification record
- `app/advertise/page.tsx` — placeholder advertise page (nav target)
- `components/Masthead.tsx` — authority strip + nav
- `components/LookupForm.tsx` — interactive lookup (client component; search wired to Supabase in a later task)

## What's next (see the Build Tracker)

Phase 1 loads the 7-workbook master database into Supabase, then real
building/precon/city/FAQ pages, the matching engine, and labeled ad slots.

## Structure

```
app/
  layout.tsx
  globals.css
  page.tsx
  page.module.css
  advertise/page.tsx
components/
  Masthead.tsx  + .module.css
  LookupForm.tsx + .module.css
```
