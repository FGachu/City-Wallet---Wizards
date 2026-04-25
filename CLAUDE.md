# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**City Wallet** — MVP for a hackathon challenge from **DSV-Gruppe** (Deutscher Sparkassenverlag, German Savings Banks Financial Group), in collaboration with MIT Club of Northern California and MIT Club of Germany.

The product is an AI-powered city wallet that detects the most relevant local offer for a user in real time, generates it dynamically, and makes it redeemable through a simulated checkout. It is **not** a coupon app with a static database — offers do not exist until the moment they are needed, and are generated specifically for one user, one location, one minute.

The reference user story ("Mia") drives every design decision: a 28-year-old in Stuttgart with 12 minutes free at lunchtime, slightly cold, near a quiet café — the system must close the gap between her current context and a perfectly-timed local offer.

## Repository Status

Currently empty (only `LICENSE`). No build, lint, or test commands exist yet. When implementing, document the chosen stack and commands in this file.

## Required Architecture — Three Modules

The submission must build all three; partial-but-connected beats polished-but-disconnected.

### 1. Context Sensing Layer
Aggregates real-time signals and recognises **composite context states** (e.g. `raining + Tuesday afternoon + partner café transaction volume unusually low`) that trigger the generative pipeline.

- **Hard requirement**: at least two real, user-visible context signal categories from {weather, location, time, local events, demand proxies}.
- **Configurability requirement**: signals must be swappable via configuration, not code changes — a different city or data source slots in as config. Do not hardcode city/country assumptions.
- Suggested sources: OpenWeatherMap / DWD (weather), Eventbrite or local event APIs, Google Maps Platform / OSM (POI, footfall), and a **simulated Payone transaction feed** for merchant transaction density (a core DSV asset — quiet periods trigger offers).

### 2. Generative Offer Engine
Given a context state, autonomously generates a campaign: content, discount parameters, visual design, timing.

- **Hard requirement**: offers must be generated dynamically, not retrieved from a static database.
- **Hard requirement**: a merchant-side rule interface (even as mockup) where the merchant sets only goals/rules (e.g. "max 20% discount to fill quiet hours") — the AI handles creative execution.
- Use **Generative UI (GenUI)** techniques to build the offer widget at runtime (imagery, tone, emotional framing) — not template-filling.
- **Privacy-by-design**: prefer **on-device Small Language Models** (Phi-3, Gemma, etc.) for local preference and movement data. Only an abstract "intent" signal should be sent upstream. GDPR compliance is not optional — address it explicitly.

### 3. Seamless Checkout & Redemption
End-to-end flow from offer generation to simulated redemption.

- **Hard requirement**: dynamic QR code / token validated via API, OR a cashback-credit mechanic after a successful transaction.
- **Hard requirement**: a merchant dashboard or summary view (static mockup acceptable) showing offer performance and accept/decline rates.

## UX Is Part of the Challenge

Design is the mechanism of acceptance or rejection. The demo must explicitly answer four questions:

1. **Where does the interaction happen?** Push, in-app card, lock-screen widget, homescreen banner — each has different attention rules and drop-off risk.
2. **How does the offer address the user?** Factual-informative (`15% off at Café Müller, 300m away`) vs. emotional-situational (`Cold outside? Your cappuccino is waiting.`).
3. **What happens in the first 3 seconds?** The offer must be understood without scrolling or deliberation.
4. **How does the offer end?** Expiry, acceptance, or dismissal — each must feel intentional.

This challenge is won in interaction design, not model architecture. Do not over-engineer the AI stack at the expense of the experience.

## Suggested Stack (from the brief)

- **Mobile UI**: React Native or Flutter with GenUI / streamed dynamic components.
- **On-device inference**: Phi-3, Gemma, or similar SLM.
- **Cloud**: only receives abstract intent signals — never raw location/preference data.

The stack is not prescribed; document the actual choice once made.

## What Strong vs. Weak Submissions Look Like

| Strong | Weak |
|---|---|
| Concrete scenario showing context → specific offer | Beautiful UI on top of static dummy offers |
| 3-second comprehension demonstrated in the UI | Merchant side treated as an afterthought |
| Closed loop: detect → generate → display → accept → redeem | Over-engineered AI, under-engineered UX |
| Explicit GDPR story (on-device, anonymisation, consent) | Ignoring the merchant supply side |

## Challenge Contact

Tim Heuschele, Referent Strategisches Portfoliomanagement, DSV Gruppe — `tim.heuschele@dsv-gruppe.de`
