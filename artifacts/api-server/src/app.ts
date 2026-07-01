import path from "node:path";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Gzip/deflate all responses – cuts bandwidth significantly on slow STB networks.
app.use(compression());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global error handler — catches any unhandled errors from async route handlers
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error({ err, url: req.url, method: req.method }, "Unhandled route error");
  if (!res.headersSent) {
    res.status(500).json({ error: "Terjadi kesalahan pada server", details: message });
  }
});

// In a self-hosted (single-container) deployment the API server also serves the
// built frontend. Enabled only when STATIC_DIR is set, so local dev (Vite) is
// unaffected.
const staticDir = process.env.STATIC_DIR;
if (staticDir) {
  // Vite builds JS/CSS with content-hashed filenames → safe to cache for 1 year.
  app.use(
    "/assets",
    express.static(path.join(staticDir, "assets"), {
      maxAge: "1y",
      immutable: true,
    }),
  );

  // Root-level files (index.html, manifest, icons) must always be re-validated.
  app.use(
    express.static(staticDir, {
      maxAge: 0,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    }),
  );

  // SPA fallback: serve index.html for any non-API GET so client-side routing works.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res
      .setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
      .sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
