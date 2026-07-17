import app from "./app";
import { logger } from "./lib/logger";
import { seedInitialData } from "./lib/seed";
import { runBackup } from "./lib/backup";
import cron from "node-cron";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  await seedInitialData();
  logger.info({ port }, "Server listening");

  // Daily automatic backup at 02:00 every night
  cron.schedule("0 2 * * *", async () => {
    logger.info("Cron: starting scheduled daily backup");
    try {
      const result = await runBackup();
      logger.info(result, "Cron: daily backup completed");
    } catch (err) {
      logger.error({ err }, "Cron: daily backup failed");
    }
  });
  logger.info("Backup scheduler started — daily at 02:00");
});
