# syntax=docker/dockerfile:1

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1 – Builder
# Full monorepo install + build. Nothing from this stage reaches production.
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:24-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

# Build frontend (static PWA) and bundle the API server.
RUN PORT=19878 BASE_PATH=/ pnpm --filter @workspace/alfathpulsa run build \
 && pnpm --filter @workspace/api-server run build


# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2 – Runner  (lean production image)
# Only contains:
#   • the bundled API server (dist/*.mjs – fully self-contained, no node_modules)
#   • the built frontend static files
#   • pnpm + the @workspace/db package deps (drizzle-kit) for first-boot migration
# ═══════════════════════════════════════════════════════════════════════════════
FROM node:24-bookworm-slim AS runner

# postgresql-client menyediakan pg_dump untuk fitur backup database
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

# Install ONLY the db package and its dependencies (drizzle-kit, pg, etc.).
# The API server bundle is self-contained – it does not need node_modules.
# All lib/* packages must be present so pnpm can resolve the workspace lockfile.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/ ./lib/
RUN pnpm install --frozen-lockfile --filter @workspace/db

# Bundled API server (esbuild output – fully self-contained).
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

# Built React PWA static files.
COPY --from=builder /app/artifacts/alfathpulsa/dist/public ./artifacts/alfathpulsa/dist/public

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# ── Runtime defaults ─────────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=8080
ENV STATIC_DIR=/app/artifacts/alfathpulsa/dist/public
# Only log warnings and errors in production – skip noisy per-request info logs.
ENV LOG_LEVEL=warn
# Override via NODE_MAX_OLD_SPACE_MB env var in your compose file.
ENV NODE_MAX_OLD_SPACE_MB=192

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
