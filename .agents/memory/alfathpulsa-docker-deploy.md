---
name: AlfathPulsa Docker self-hosting
description: How the single-container Docker/CasaOS deployment is wired and the non-obvious constraints.
---

# AlfathPulsa Docker self-hosting

The app self-hosts as **one app container + one postgres container** (`docker-compose.yml`, repo root). The single image (`Dockerfile`) builds the Vite PWA and esbuild-bundles the Express API, then the **API server serves both** the static frontend and `/api` from one port (default 8080).

Key wiring / gotchas:
- The Express app serves the frontend **only when `STATIC_DIR` is set** (`artifacts/api-server/src/app.ts`). This keeps local Vite dev untouched. SPA routing relies on an `index.html` fallback for any non-`/api` GET.
- Frontend must be built with **`BASE_PATH=/`** so asset URLs are root-relative; the Vite config *requires* both `PORT` and `BASE_PATH` env at build time or it throws.
- The api bundle is self-contained for *running* (esbuild bundles `pg`), but the runtime image still keeps the workspace + pnpm because **schema is applied at startup via `drizzle-kit push`** (`docker/entrypoint.sh`) — the project uses push, not versioned migrations. Plain `push` is non-interactive on a fresh/unchanged DB; a destructive schema change could prompt and needs manual handling.
- All workspace libs are consumed from `./src` (their package `exports` point at source), so no lib `dist` build is needed in Docker — `**/dist` is safely excluded in `.dockerignore`.
- `.github/workflows/docker-publish.yml` pushes the image to GHCR (`ghcr.io/<owner>/<repo>`) for pull-to-server.

**Why:** user wanted a self-hostable image (CasaOS, docker compose) buildable on GitHub and pulled to a local server. **How to apply:** verify changes by running the bundled server locally with `NODE_ENV=production PORT=... STATIC_DIR=.../dist/public DATABASE_URL=...` and cur/`/api/healthz` + `/` — the nested Replit docker daemon can't reliably run a full `docker build`, so test the runtime path this way instead.
