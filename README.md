# City Wallet — Wizards 🚀

## Overview

**City Wallet — Wizards** is a cutting‑edge, privacy‑first mobile and web platform that delivers hyper‑personalized, context‑aware offers to city‑dwelling consumers. It seamlessly integrates merchant transaction feeds, real‑time location data, generative AI recommendation engines, and a sleek wallet UI to create a unified experience for shoppers and merchants alike.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
   - [app‑services](#app‑services)
   - [backend](#backend)
   - [recommendation‑engine](#recommendation-engine)
   - [store‑app](#store‑app)
   - [wallet‑app](#wallet‑app)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Contributing](#contributing)
9. [License](#license)

---

## Architecture Overview

```mermaid
flowchart LR
    subgraph Mobile
        WA[Wallet App (React Native)] --> B[Backend API]
    end

    subgraph Web
        SA[Store App (Next.js)] --> B
    end

    B --> RE[Recommendation Engine Python TypeScript]
    RE --> MT[Merchant Transaction Feed]
    B --> GPS[Location Service]
    B --> DB[(PostgreSQL Database)]

    style WA fill:#1e293b,stroke:#0ea5e9,color:#fff
    style SA fill:#1e293b,stroke:#f97316,color:#fff
    style B fill:#111827,stroke:#4ade80,color:#fff
    style RE fill:#1e293b,stroke:#a78bfa,color:#fff
    style MT fill:#0f172a,stroke:#f43f5e,color:#fff
    style GPS fill:#0f172a,stroke:#38bdf8,color:#fff
    style DB fill:#0f172a,stroke:#94a3b8,color:#fff
```

The system consists of loosely coupled services communicating over a **REST/GraphQL** API layer.   
- **Wallet App** – consumer‑facing mobile UI (React Native) where users view offers, coupons, and transaction history.  
- **Store App** – merchant‑facing web dashboard (Next.js) for managing offers, monitoring spend, and configuring AI rules.  
- **Backend** – Node/TypeScript service handling authentication, user profiles, and orchestrating data flow.  
- **Recommendation Engine** – AI‑driven micro‑service (Python + TypeScript) that synthesizes location, transaction, and event data to generate personalized offers.  
- **App‑Services** – shared TypeScript utility library (type definitions, API clients, validation schemas) used by both front‑ends and the backend.

---

## Core Components

### `app-services`
- Central TypeScript monorepo containing shared types, API wrappers, validation logic, and UI primitives.
- Exposes **`src/`** with modules like `auth`, `apiClient`, `models`, and `utils`.
- Built with **Vite** for rapid development and **ESM** output.

### `backend`
- Node.js/Express (or NestJS) server exposing **REST** endpoints for:
  - User authentication (JWT/OAuth2)
  - Transaction ingestion
  - Coupon CRUD operations
  - Location‑based query endpoints
- Connects to **PostgreSQL** via **Prisma** ORM.
- Includes **Payone transaction simulator** for local development.

### `recommendation-engine`
- Python service leveraging **transformers** and **scikit‑learn** for on‑device generative UI (GenUI) concepts.
- Consumes data from the backend and external APIs (Ticketmaster, OSM, Eventbrite).
- Returns ranked offer lists via a **GraphQL** endpoint.

### `store-app`
- Next.js (React) application for merchants:
  - Dashboard UI with dark‑mode glassmorphism design.
  - Real‑time analytics powered by the merchant transaction feed.
  - Offer creation wizard that talks to the recommendation engine.

### `wallet-app`
- React Native (Expo) mobile app for consumers:
  - Seamless wallet UI with micro‑animations (confetti on coupon claim).
  - GPS‑based location services for hyper‑personalized offers.
  - Coupon management and transaction history.

---

## Technology Stack
| Layer | Tech |
|-------|------|
| Front‑end (Web) | Next.js (React), TypeScript, TailwindCSS (custom theme) |
| Front‑end (Mobile) | React Native (Expo), TypeScript |
| Backend | Node.js, Express/NestJS, TypeScript, Prisma, PostgreSQL |
| AI / Recommendation | Python 3.11, PyTorch, Transformers, scikit‑learn |
| Shared Services | Vite, TypeScript, ESLint, Prettier |
| CI/CD | GitHub Actions, Docker, Railway (or Render) |
| Testing | Jest (TS), PyTest, Cypress (e2e) |

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **Docker** (optional, for local DB)
- **Expo CLI** (`npm i -g expo-cli`)
- **Git**

### Clone the Repository
```bash
git clone https://github.com/FGachu/City-Wallet---Wizards.git
cd City-Wallet---Wizards
```

### Install Shared Services
```bash
cd app-services
npm ci
npm run build
```

### Backend Setup
```bash
cd ../backend
npm ci
# Start a local PostgreSQL container
docker compose up -d db
npm run dev
```

### Recommendation Engine
```bash
cd ../recommendation-engine
python -m venv .venv
. .venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
python main.py   # starts the local inference server
```

### Store App (Web)
```bash
cd ../store-app
npm ci
npm run dev   # http://localhost:3000
```

### Wallet App (Mobile)
```bash
cd ../wallet-app
npm ci
expo start   # Follow the QR code to run on a device or emulator
```

---

## Development Workflow
1. **Branching** – Use `feature/<name>` for new work, `bugfix/<name>` for bugs.
2. **Lint & Format** – `npm run lint && npm run format` (shared scripts).
3. **Commit Message Convention** – `type(scope): subject` (e.g., `feat(wallet): add confetti animation`).
4. **Pull Requests** – Require at least one approval and CI pass before merge.
5. **Testing** – Run unit tests (`npm test`), integration tests (`npm run test:integration`), and e2e (`cypress run`).

---

## Testing
- **Unit** – Jest for TS modules, PyTest for Python utils.
- **Integration** – Supertest against the backend API.
- **End‑to‑End** – Cypress for store‑app UI flows; Detox for wallet‑app.
- **AI Model Tests** – Compare generated offer rankings against a baseline dataset.

---

## Deployment
- **Backend** – Docker image built via GitHub Actions, deployed to Railway/Render.
- **Store App** – Vercel (auto‑detects Next.js).
- **Wallet App** – Expo EAS build for iOS/Android.
- **Recommendation Engine** – Separate Docker container, GPU‑enabled on cloud (if needed).

---

## Contributing
We welcome contributions! Please read our **CONTRIBUTING.md** for the full workflow, code‑style guidelines, and how to run the local environment.

1. Fork the repo
2. Create a feature branch
3. Ensure all linting and tests pass
4. Open a PR with a clear description of the change

---

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---


