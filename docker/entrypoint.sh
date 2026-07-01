#!/bin/sh
set -e

# Apply the database schema (creates tables on first run, no-op when unchanged).
echo "[entrypoint] Applying database schema (drizzle-kit push)..."
pnpm --filter @workspace/db run push

# Start the API server (also serves the frontend). The server seeds the initial
# admin account (admin / admin123) on first run.
# Note: --enable-source-maps is intentionally omitted in production to reduce
# RAM usage (~50–100MB). Source maps are only needed for local debugging.
# Set NODE_MAX_OLD_SPACE_MB env var to override the heap limit (default: 384).
echo "[entrypoint] Starting AlfathPulsa server..."
exec node --max-old-space-size="${NODE_MAX_OLD_SPACE_MB:-384}" /app/artifacts/api-server/dist/index.mjs
