import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { logger } from "./logger";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BACKUP_DIR = process.env.BACKUP_DIR ?? path.resolve("../../backups");
const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS ?? 7);

export interface BackupEntry {
  filename: string;
  sizeBytes: number;
  createdAt: string; // ISO
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function ensureDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

function buildFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
  return `backup-${stamp}.sql.gz`;
}

// ---------------------------------------------------------------------------
// Run a single backup
// ---------------------------------------------------------------------------
export async function runBackup(): Promise<{ filename: string; sizeBytes: number }> {
  await ensureDir();

  const filename = buildFilename();
  const outPath = path.join(BACKUP_DIR, filename);

  logger.info({ filename }, "Starting database backup");

  // pg_dump writes plain SQL to stdout; we pipe through gzip.
  await new Promise<void>((resolve, reject) => {
    const pgDump = require("node:child_process").spawn("pg_dump", [], {
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const gzip = createGzip({ level: 9 });
    const out = createWriteStream(outPath);

    pgDump.stderr.on("data", (chunk: Buffer) => {
      logger.warn({ msg: chunk.toString() }, "pg_dump stderr");
    });

    pgDump.on("error", reject);
    pgDump.on("close", (code: number) => {
      if (code !== 0) reject(new Error(`pg_dump exited with code ${code}`));
    });

    pipeline(pgDump.stdout, gzip, out).then(resolve).catch(reject);
  });

  const stat = await fs.stat(outPath);
  logger.info({ filename, sizeBytes: stat.size }, "Backup completed");

  // Prune old backups
  await pruneOldBackups();

  return { filename, sizeBytes: stat.size };
}

// ---------------------------------------------------------------------------
// Prune backups older than KEEP_DAYS
// ---------------------------------------------------------------------------
async function pruneOldBackups() {
  const entries = await listBackups();
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  for (const entry of entries) {
    if (new Date(entry.createdAt).getTime() < cutoff) {
      const p = path.join(BACKUP_DIR, entry.filename);
      await fs.unlink(p).catch(() => null);
      logger.info({ filename: entry.filename }, "Pruned old backup");
    }
  }
}

// ---------------------------------------------------------------------------
// List backups
// ---------------------------------------------------------------------------
export async function listBackups(): Promise<BackupEntry[]> {
  await ensureDir();
  const files = await fs.readdir(BACKUP_DIR);
  const entries: BackupEntry[] = [];

  for (const f of files) {
    if (!f.startsWith("backup-") || !f.endsWith(".sql.gz")) continue;
    const stat = await fs.stat(path.join(BACKUP_DIR, f));
    entries.push({
      filename: f,
      sizeBytes: stat.size,
      createdAt: stat.mtime.toISOString(),
    });
  }

  // Newest first
  entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return entries;
}

// ---------------------------------------------------------------------------
// Resolve a safe download path (prevent directory traversal)
// ---------------------------------------------------------------------------
export function resolveBackupPath(filename: string): string | null {
  // Only allow simple filenames — no slashes, no dots at start
  if (!/^backup-[\d-]+\.sql\.gz$/.test(filename)) return null;
  return path.join(BACKUP_DIR, filename);
}
