# EC Management — Frontend

A React 19 single-page application for double-entry bookkeeping and business reporting. Connects to a Django REST backend.

## Features

- **Dashboard** — revenue, expenses, net profit, cash, receivables, and payables at a glance
- **Accounts** — create and browse the chart of accounts (assets, liabilities, equity, revenue, expenses)
- **Journal Entries** — record debit/credit entries with balanced-line validation
- **JWT auth** — silent token refresh on 401; tokens stored in `localStorage`
- **Toast notifications** — contextual success/error feedback

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19, Tailwind CSS v4 |
| Routing | React Router v7 |
| Server state | TanStack React Query v5 |
| Forms | React Hook Form v7 + Zod v4 |
| HTTP | Axios |
| Build | Vite 8, TypeScript 6 |

## Getting Started

**Prerequisites:** Node.js 20+ and a running instance of the backend API.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and set VITE_API_URL to your backend origin

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the backend API |

## Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # Type-check then produce a production bundle
npm run preview   # Serve the production bundle locally
npm run lint      # Run ESLint
```

## Project Structure

```
src/
├── api/            # Axios client + per-resource API modules
├── components/     # Shared UI components and forms
├── context/        # AuthContext, ToastContext
├── hooks/          # React Query hooks (queries & mutations)
├── lib/            # Small utilities
├── pages/          # Route-level components (Login, Dashboard, Accounts, Entries)
└── types/          # TypeScript domain types (accounts, business, products)
```

## API

All requests go through the Axios instance in `src/api/client.ts`. It attaches `Authorization: Bearer <token>` to every request and automatically refreshes the access token on 401 responses. If the refresh fails, both tokens are cleared and the user is redirected to `/login`.

Backend endpoints used:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/token/` | Obtain token pair |
| `POST` | `/api/auth/token/refresh/` | Refresh access token |
| `GET/POST` | `/api/v1/accounting/accounts/` | Chart of accounts |
| `GET/POST` | `/api/v1/accounting/entries/` | Journal entries |
| `POST` | `/api/v1/accounting/entries/:id/void/` | Void an entry |
| `GET` | `/api/v1/business/setup/` | Business configuration |
| `GET` | `/api/v1/business/reports/summary/` | Financial summary |
