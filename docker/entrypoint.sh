#!/bin/sh
set -e

# ── Database migration ────────────────────────────────────────────────────────
# drizzle-kit push is heavy (~200 MB RAM spike). We only run it:
#   • On the very first boot (no marker file at /data/.migrated).
#   • When MIGRATE=true is explicitly set (e.g. after an upgrade).
#
# To force a re-run:  docker compose run app sh -c "rm /data/.migrated && exit"
# or set MIGRATE=true in your compose environment for one restart.
MARKER=/data/.migrated

if [ "${MIGRATE:-false}" = "true" ] || [ ! -f "$MARKER" ]; then
  echo "[entrypoint] Applying database schema (drizzle-kit push)..."
  pnpm --filter @workspace/db run push
  mkdir -p "$(dirname "$MARKER")"
  touch "$MARKER"
  echo "[entrypoint] Schema applied. Subsequent restarts will skip this step."
else
  echo "[entrypoint] Schema already applied. Skipping migration."
  echo "             Set MIGRATE=true or delete /data/.migrated to force re-run."
fi

# ── Start server ─────────────────────────────────────────────────────────────
# --max-old-space-size caps the V8 heap. Override with NODE_MAX_OLD_SPACE_MB.
# --enable-source-maps is intentionally omitted (saves ~50–100 MB on startup).
echo "[entrypoint] Starting AlfathPulsa server..."
exec node --max-old-space-size="${NODE_MAX_OLD_SPACE_MB:-192}" \
          /app/artifacts/api-server/dist/index.mjs
