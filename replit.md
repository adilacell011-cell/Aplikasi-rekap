# AlfathPulsa

A self-hostable Indonesian BRILink/pulsa finance management PWA for a small multi-branch business: tracks branch capital, deposits (setoran), debts (bon/hutang), customer savings, voucher recaps, and staff salary slips, with role-based access (bos, mandor, karyawan).

## Run & Operate

- `pnpm --filter @workspace/alfathpulsa run dev` — run the web app (port 19878)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080; routes mounted at `/api`)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `DATABASE_URL` — Postgres connection string
- Recommended env: `AUTH_SECRET` — HMAC token secret (required in production; dev falls back to an insecure default)
- Optional env: `FONNTE_API_KEY` — WhatsApp notifications via Fonnte (notifications are skipped if unset)

## Default login

- Seeded admin: username `admin`, password `admin123`, role `bos` (email `alfathpulsa27@gmail.com`). Change the password after first login. New accounts are created by a bos from the Team (Tim & Cabang) page.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 18 (PWA), zustand stores
- API: Express 5 (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: HMAC bearer token + scrypt password hashing (no Firebase)

## Where things live

- DB schema (source of truth): `lib/db/src/schema/finance.ts`
- API routes: `artifacts/api-server/src/routes/` (`auth.ts`, `users.ts`, `finance.ts`); auth helpers in `src/lib/auth.ts`; middleware in `src/middleware/auth.ts`; admin seed in `src/lib/seed.ts`
- Frontend REST client: `artifacts/alfathpulsa/src/api.ts` (token stored in localStorage key `alfathpulsa_token`)
- Stores: `artifacts/alfathpulsa/src/store/authStore.ts`, `artifacts/alfathpulsa/src/hooks/useFinanceStore.ts`

## Architecture decisions

- Migrated off Firebase (Firestore + Google Auth) to a local PostgreSQL + REST backend for offline self-hosting. Store interfaces were kept identical so components were largely untouched.
- Real-time `onSnapshot` listeners were replaced with 5s polling plus refetch-after-mutation.
- Role/branch visibility filtering is done client-side in the stores (parity with original). Server-side authorization enforces bos-only access on genuinely admin-only mutations: create/delete branch, settings, and salary-slip writes. Branch capital PATCH stays open to branch staff (used for capital shifts on the Dashboard).
- Orval/OpenAPI codegen is intentionally skipped for the frontend (store-based, not hook-based).
- Date columns are stored as ISO strings to match prior Firestore behavior.

## User preferences

- User is Indonesian-speaking and non-technical; communicate accordingly.
- Loose typecheck is acceptable (pre-existing TS errors in `VoucherRecaps.tsx`, `NotificationManager.tsx`, `SuccessToast.tsx` are out of scope).

## Gotchas

- The API server runs on port 8080, not 5000. Vite proxies `/api` to it.
- WhatsApp notifications require `FONNTE_API_KEY`; without it sends are skipped (non-fatal).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
