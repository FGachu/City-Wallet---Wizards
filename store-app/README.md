# store-app · Merchant Console

Presentational Next.js dashboard for the **City Wallet** merchant — a restaurant
or local shop owner. Lets the merchant upload product photos, set per-product
maximum discount ceilings, and signal real-time demand via a traffic-light
control that the AI uses to shape outgoing offers.

This is a **mockup**: no backend, no auth, no real persistence. Mock data lives
in `lib/mock-data.ts`. All interactions (toggles, sliders, photo uploads,
traffic-light selection) are local state only.

## Stack

- Next.js 15 · App Router · React 19 · TypeScript
- Tailwind CSS v4 (theme defined in `app/globals.css`)
- `lucide-react` icons

## Getting started

```bash
cd store-app
npm install
npm run dev
```

Open <http://localhost:3000>.

## Routes

- `/` — Overview · KPIs, live offer activity, demand signal, context signals
- `/products` — Photo upload + max-discount ceiling per product
- `/monitoring` — Traffic-light demand signal + hourly schedule
- `/offers`, `/settings` — Placeholders

## Project layout

```
app/            Route segments (App Router)
components/    UI building blocks (sidebar, traffic-light, product-card, …)
lib/            Types, mock data, small utilities
```

## Design principles

- **Merchant sets the ceiling, AI picks the offer.** Discount sliders define
  the maximum the AI may apply, not a fixed price.
- **Traffic light is the merchant's only real lever.** Green = bring them in,
  amber = steady, red = full. Everything else (creative, targeting, timing) is
  AI-driven.
- **3-second comprehension.** Each card answers what / why / what now without
  scrolling.
