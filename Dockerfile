# syntax=docker/dockerfile:1

# ---- Build + run image for the AlfathPulsa self-hosted deployment ----------
# Single container that builds the React PWA and the Express API, then serves
# both from one port. Pair it with a PostgreSQL container (see docker-compose.yml).

FROM node:24-bookworm-slim

# pnpm via corepack, pinned to the version used in this repo.
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

# Copy the whole monorepo (see .dockerignore for what is excluded) and install.
COPY . .
RUN pnpm install --frozen-lockfile

# Build the frontend (static assets) and bundle the API server.
# PORT/BASE_PATH are required by the Vite config; BASE_PATH=/ serves the app at root.
RUN PORT=19878 BASE_PATH=/ pnpm --filter @workspace/alfathpulsa run build \
  && pnpm --filter @workspace/api-server run build

# Runtime configuration.
ENV NODE_ENV=production
ENV PORT=8080
ENV STATIC_DIR=/app/artifacts/alfathpulsa/dist/public

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
