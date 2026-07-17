import { Router } from "express";
import fs from "node:fs";
import { requireBos } from "../middleware/auth";
import { runBackup, listBackups, resolveBackupPath } from "../lib/backup";
import { logger } from "../lib/logger";

const router = Router();

// All backup endpoints require bos role
router.use(requireBos);

// GET /api/backups — list available backups
router.get("/backups", async (_req, res) => {
  try {
    const entries = await listBackups();
    res.json(entries);
  } catch (err) {
    logger.error({ err }, "Failed to list backups");
    res.status(500).json({ error: "Gagal membaca daftar backup" });
  }
});

// POST /api/backups/run — trigger a manual backup
router.post("/backups/run", async (_req, res) => {
  try {
    const result = await runBackup();
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error({ err }, "Manual backup failed");
    res.status(500).json({ error: "Backup gagal: " + (err instanceof Error ? err.message : String(err)) });
  }
});

// GET /api/backups/download/:filename — download a backup file
router.get("/backups/download/:filename", async (req, res) => {
  const filePath = resolveBackupPath(req.params.filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ error: "File tidak ditemukan" });
    return;
  }
  res.setHeader("Content-Type", "application/gzip");
  res.setHeader("Content-Disposition", `attachment; filename="${req.params.filename}"`);
  fs.createReadStream(filePath).pipe(res);
});

// DELETE /api/backups/:filename — delete a specific backup
router.delete("/backups/:filename", async (req, res) => {
  const filePath = resolveBackupPath(req.params.filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ error: "File tidak ditemukan" });
    return;
  }
  try {
    await fs.promises.unlink(filePath);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete backup");
    res.status(500).json({ error: "Gagal menghapus backup" });
  }
});

export default router;
