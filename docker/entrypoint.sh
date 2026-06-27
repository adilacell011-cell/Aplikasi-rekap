#!/bin/sh
set -e

# Apply the database schema (creates tables on first run, no-op when unchanged).
echo "[entrypoint] Applying database schema (drizzle-kit push)..."
pnpm --filter @workspace/db run push

# Start the API server (also serves the frontend). The server seeds the initial
# admin account (admin / admin123) on first run.
echo "[entrypoint] Starting AlfathPulsa server..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
