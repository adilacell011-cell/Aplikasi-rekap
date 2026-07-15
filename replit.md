# AlfathPulsa

A financial management system for BRILink agents (Sistem Manajemen Keuangan Agen BRILink). Built as a pnpm monorepo with a React frontend, Express API, and PostgreSQL database.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + Radix UI (in `artifacts/alfathpulsa`)
- **Backend**: Express + Node.js API server (in `artifacts/api-server`)
- **Database**: PostgreSQL via Drizzle ORM (schema in `lib/db`)
- **API Client**: Generated React hooks via Orval (in `lib/api-client-react`)

## How to run

Two workflows must be running:

1. **`artifacts/api-server: API Server`** — Express backend on `PORT=8080`
2. **`artifacts/alfathpulsa: web`** — Vite dev server for the React frontend

Dependencies: `pnpm install` from the workspace root.

Database schema: `pnpm --filter @workspace/db run push` (uses `DATABASE_URL` from Replit's managed PostgreSQL).

## Environment variables

| Key | Notes |
|-----|-------|
| `DATABASE_URL` | Managed by Replit — do not set manually |
| `AUTH_SECRET` | Set in Replit env (shared) |
| `SESSION_SECRET` | Set as a Replit secret |
| `FONNTE_API_KEY` | Optional — WhatsApp integration via Fonnte |

## Default credentials

On first start, the API server seeds an admin account:
- **Username**: `admin`
- **Password**: `admin123`

Change this immediately in production.

## User preferences
