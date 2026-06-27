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
- Salary slips use a **daily-rate model** ("patokan gaji per hari"): the bos enters Gaji Per Hari, the system auto-detects the number of days in the selected month (`new Date(year, month, 0).getDate()`), so `baseSalary = dailyRate × daysInMonth` (a 31-day month pays more than a 30-day month). Day-off deduction "Hari Libur" auto-fills `deductions = daysOff × dailyRate` (still manually editable; resets to 0 when Hari Libur is cleared). `netSalary = baseSalary + bonus − deductions`. Columns `daily_rate` + `days_off` persist this; old slips without them derive `dailyRate = baseSalary / daysInMonth` and `daysOff = round(deductions / dailyRate)` for display.
- UI is **light-first ("Neumorphism Tajam + Lampu")**: one soft cool-gray surface (`#E4E8EF`) shared by canvas and cards, with cards raised via twin neumorphic shadows (light top-left `--neu-light`, dark bottom-right `--neu-dark`), inputs and inner panels carved-in (inset shadow), borders kept minimal/transparent, and a glowing blue "lampu" accent on solid brand buttons. Big balance nominals render in dark charcoal (via the global `.text-white` → dark override), not glowing. Menu service tiles are harmonized into the theme: instead of the old per-label rainbow gradients, every tile is one calm raised neumorphic surface (`.menu-tile`) with a single blue "lampu" accent icon (`.menu-tile-icon`). The tiles wear a blue "balutan lampu" (light-halo wrap): a soft blue outer glow + a faint blue inset ring around the still-neutral neumorphic surface (NOT a solid-blue fill), plus a backlit drop-shadow glow on the blue icon; hover intensifies both glows. This is applied purely via the `.menu-tile`/`.menu-tile-icon` CSS in `index.css` (~lines 544-577). All buttons (and tiles especially) have a tactile press: they carve inward (inset shadow) and scale down slightly on `:active` so taps "feel alive". Theme styling is applied globally via utility-class overrides in `artifacts/alfathpulsa/src/index.css` (not per-component); the `ServiceIcon` component in `Dashboard.tsx` just emits the `.menu-tile`/`.menu-tile-icon` classes (no color logic). Fonts use a fluid `html { font-size: clamp(...) }` (plus a short-landscape tweak) so rem-based Tailwind sizes scale across phone/tablet and portrait/landscape without looking oversized. Default mode is light; dark mode is retained as a calm ambient-blue option (neumorphism is light-mode only). Theme attributes (`data-mode`/`data-theme`) are set at the App root so the Login/loading screens are themed too. The `themeStore` persist key is versioned (`alfath-theme-storage-v2`); bumping it resets existing users to defaults (both mode and accent color). **Palette is harmonized**: jarring default hues are folded into the calm theme by statically overriding the default Tailwind color values in the `@theme` block of `index.css` (needed because Tailwind v4 inlines literal colors into opacity utilities like `bg-x/10`, so overriding only the runtime var would miss them) — success/positive (emerald + other cool hues) → brand blue, pending/warning (amber/orange) → muted gold, danger/negative/delete (rose/red) → muted red; chart literals in `DepositAnalytics.tsx`/`Deposits.tsx` were updated by hand since the remap can't reach hardcoded `fill=/stroke=`/`shadow-[rgba()]` values (2-series charts use two blue shades, not a second hue). **Blue blocks wear the lampu, never a solid fill**: every solid full-color blue block (action buttons, tabs, filter chips, icon buttons, the brand side-strip, gradient avatar/initial circles) is converted in light mode to a light neumorphic surface where only the LETTERS + the ring/border glow blue, and the block lifts + glows brighter when pressed ("mengangkat menyala saat ditekan"). This is global CSS in `index.css` (overriding `button.bg-brand-500/600`, `.bg-brand-500/600.text-white`, `.bg-brand-500.self-stretch`, and blue gradients `from-brand-500`/`from-emerald-500`); because the palette remap makes solid `bg-emerald-500/600` render blue, those are converted too, and descendant `.text-white` is recolored blue so no white-on-light text goes invisible. Red/danger (rose) blocks intentionally stay solid (they are not blue); the Savings/Debts avatar color cycles were forced all-blue so no red avatar leaks in. The lampu now **follows the chosen accent** (`data-theme`): converted blocks use `var(--brand-600)` for letters and `color-mix(in srgb, var(--brand-500) …%, transparent)` for the ring/glow (no longer hardcoded blue). **Dark mode was made "pekat"** (deeper): canvas ≈`#03050A`, `--bg-asphalt-900` `#080C15`, cards lifted to `#1A2233` and given a raised shadow + faint top-edge highlight so they clearly "timbul"; text was brightened for legibility. Because the palette remap pins the success/cool families (emerald/teal/green/sky/cyan) to a fixed blue, their **solid 500/600 button fills are re-pointed to the accent var in dark mode** (`[data-mode='dark']`) so buttons follow the theme there too (`bg-brand-*` already does via `--brand-*`). Bos is monitoring-only: money quick-actions (Geser/Tarik/Setor a.k.a. "Pindah Saldo Cepat", setor report) are role-gated to karyawan/mandor, so bos sees Dana Terkelola + Kinerja Cabang only. (User rejected earlier dark "glowing glass" and approved neumorphism via canvas mockup.)

- **Employee (karyawan) kasbon & tabungan** are SEPARATE from nasabah debts/savings but reuse the same `customers`/`savings` tables, distinguished by `ownerType` ('nasabah'|'karyawan', default 'nasabah') + `userId`. The store's `loadAll` splits them: nasabah rows feed the existing Debts/Savings pages; karyawan rows feed `employeeDebts`/`employeeSavings` and the new **EmployeeFinance** page (`employee-finance` tab, gated to bos/mandor, Dashboard tile hidden for karyawan). Salary slips gained `debtPayment`/`savingDeposit`/`savingWithdraw`; on slip creation the SalarySlips form posts these allocations on the slip AND posts matching employee bon/tabungan ledger transactions. Take-home = `netSalary − debtPayment − savingDeposit + savingWithdraw`, but the **gaji expense stays = netSalary** (allocations are distribution of pay, not an expense reduction) so P&L stays correct. Validation: bayar kasbon ≤ sisa kasbon, ambil tabungan ≤ saldo, take-home cannot go negative. Deleting a slip does NOT auto-reverse the ledger transactions (ledger behavior, by design). Slip create + ledger posts are separate client calls (non-atomic, consistent with the app's poll-based architecture; store actions swallow their own errors).

- **Popups are iOS-styled.** The in-app popups were converted to iOS look via dedicated classes in `index.css` (`.ios-backdrop`, `.ios-alert`, `.ios-card`, `.ios-sheet`, `.ios-grabber`, `.ios-on-color`, `.ios-font`), all adapting to light/dark via `[data-mode]`: `ConfirmModal` is a centered iOS alert (frosted 270px card, 17px semibold title + 13px message, two hairline-separated 44px text buttons — `Batal` bold + the action, destructive in iOS red `#ff3b30`/`#ff453a`, otherwise accent); `SuccessToast` and the Layout global-error are iOS frosted top banners (`.ios-card`); the theme picker is an iOS bottom sheet (`.ios-sheet`) with a grabber + tap-outside-to-close. Action text color follows the accent via `var(--brand-600)`. White icons sitting on colored circles must use `.ios-on-color` (NOT `text-white`) because of the global `[data-mode='light'] .text-white { !important }` override. `ConfirmModal`/`SuccessToast` props are unchanged so all callers were untouched. The unused `components/ui/*` Radix popups were left as-is. Native browser `alert()`/`confirm()` popups were also removed: a global iOS dialog system (`src/store/dialogStore.ts` exposes `iosAlert(title, message?)` and `iosConfirm({title, message, confirmText, cancelText, confirmVariant})`, both returning a Promise) renders through a single `<IosDialog/>` host mounted in `main.tsx` (sibling to `<App/>`, so it works even for the PWA-update prompt that fires outside the React app tree). `iosAlert` shows one full-width default `OK`; `iosConfirm` shows `Batal` + action. Replaced sites: PWA update (`main.tsx`), Team copy-emails / no-WhatsApp-targets, SalarySlips duplicate/batch-complete. `usePWAInstall.ts`'s `deferredPrompt.prompt()` is the native install API, not a dialog, so it's left alone.

## User preferences

- User is Indonesian-speaking and non-technical; communicate accordingly.
- Loose typecheck is acceptable (pre-existing TS errors in `VoucherRecaps.tsx`, `NotificationManager.tsx`, `SuccessToast.tsx` are out of scope).

## Gotchas

- The API server runs on port 8080, not 5000. Vite proxies `/api` to it.
- WhatsApp notifications require `FONNTE_API_KEY`; without it sends are skipped (non-fatal).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
