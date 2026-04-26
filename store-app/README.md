# store-app · Merchant Console

Interactive Next.js dashboard for the **City Wallet** merchant — a restaurant
or local shop owner. Lets the merchant upload product photos, set per-product
maximum discount ceilings, and signal real-time demand via a traffic-light
control that the AI uses to shape outgoing offers.

The app now includes API routes plus a local SQLite database for persistent
console state and merchant settings.

## Stack

- Next.js 16 · App Router · React 19 · TypeScript
- Tailwind CSS v4 (theme defined in `app/globals.css`)
- `lucide-react` icons
- Prisma ORM + SQLite (`prisma/dev.db`)

## Getting started

```bash
cd store-app
npm install
npm run db:generate
npm run db:push
npm run dev
```

Open <http://localhost:3000>.

## Routes

- `/` — Overview · KPIs, live offer activity, demand signal, context signals
- `/products` — Photo upload + max-discount ceiling per product
- `/monitoring` — Traffic-light demand signal + hourly schedule
- `/offers` — Live offer feed with status filters
- `/settings` — Persistent merchant profile, integration and privacy controls

## Project layout

```
app/            Route segments (App Router)
components/    UI building blocks (sidebar, traffic-light, product-card, …)
lib/            Types, mock data, small utilities
prisma/         SQLite schema
```

## Design principles

- **Merchant sets the ceiling, AI picks the offer.** Discount sliders define
  the maximum the AI may apply, not a fixed price.
- **Traffic light is the merchant's only real lever.** Green = bring them in,
  amber = steady, red = full. Everything else (creative, targeting, timing) is
  AI-driven.
- **3-second comprehension.** Each card answers what / why / what now without
  scrolling.
