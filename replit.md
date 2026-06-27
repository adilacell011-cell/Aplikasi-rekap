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

## Self-hosting (Docker / CasaOS)

- `Dockerfile` (repo root) builds a single image that builds the React PWA + bundles the Express API and serves both from one port (default `8080`). The API serves the frontend statically only when `STATIC_DIR` is set (so local Vite dev is unaffected); built frontend lives at `artifacts/alfathpulsa/dist/public`.
- `docker-compose.yml` runs two services: `postgres:16-alpine` (named volume `alfath_db`) + the app. Copy `.env.example` → `.env`, set `AUTH_SECRET` (required) and DB creds, then `docker compose up -d`.
- Frontend is built with `BASE_PATH=/` so assets are root-relative; the API server's Express SPA fallback serves `index.html` for non-`/api` GETs.
- Schema is applied on container start via `docker/entrypoint.sh` (`drizzle-kit push`); the server seeds the admin account on first run.
- `.github/workflows/docker-publish.yml` builds and pushes the image to GHCR on push to `main`; set `APP_IMAGE` in the server's `.env` to pull it instead of building.
- Keep `AUTH_SECRET` stable across restarts/upgrades — changing it invalidates all login tokens (logs everyone out).

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
- UI is **light-first ("Neumorphism Tajam + Lampu")**: one soft cool-gray surface (`#E4E8EF`) shared by canvas and cards, with cards raised via twin neumorphic shadows (light top-left `--neu-light`, dark bottom-right `--neu-dark`), inputs and inner panels carved-in (inset shadow), borders kept minimal/transparent, and a glowing blue "lampu" accent on solid brand buttons. Big balance nominals render in dark charcoal (via the global `.text-white` → dark override), not glowing. Colorful gradient rounded-square menu icon tiles (white icons) are retained. Theme styling is applied globally via utility-class overrides in `artifacts/alfathpulsa/src/index.css` (not per-component); the menu-tile gradients are the one exception, mapped per-label in the `ServiceIcon` component in `Dashboard.tsx`. Fonts use a fluid `html { font-size: clamp(...) }` (plus a short-landscape tweak) so rem-based Tailwind sizes scale across phone/tablet and portrait/landscape without looking oversized. Default mode is light; dark mode is retained as a calm ambient-blue option (neumorphism is light-mode only). Theme attributes (`data-mode`/`data-theme`) are set at the App root so the Login/loading screens are themed too. The `themeStore` persist key is versioned (`alfath-theme-storage-v2`); bumping it resets existing users to defaults (both mode and accent color). Bos is monitoring-only: money quick-actions (Geser/Tarik/Setor a.k.a. "Pindah Saldo Cepat", setor report) are role-gated to karyawan/mandor, so bos sees Dana Terkelola + Kinerja Cabang only. (User rejected earlier dark "glowing glass" and approved neumorphism via canvas mockup.)

## User preferences

- User is Indonesian-speaking and non-technical; communicate accordingly.
- Loose typecheck is acceptable (pre-existing TS errors in `VoucherRecaps.tsx`, `NotificationManager.tsx`, `SuccessToast.tsx` are out of scope).

## Gotchas

- The API server runs on port 8080, not 5000. Vite proxies `/api` to it.
- WhatsApp notifications require `FONNTE_API_KEY`; without it sends are skipped (non-fatal).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
