import { db, users, settings } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";
import { logger } from "./logger";

// Seeds an initial "bos" admin account and the settings singleton on first
// run so a freshly provisioned local install is immediately usable.
export async function seedInitialData() {
  try {
    const existing = await db.select().from(users).limit(1);
    if (existing.length === 0) {
      await db.insert(users).values({
        username: "admin",
        passwordHash: hashPassword("admin123"),
        name: "Bos",
        email: "alfathpulsa27@gmail.com",
        role: "bos",
        branchId: null,
        createdAt: new Date().toISOString(),
      });
      logger.info(
        "Seeded initial admin account (username: admin / password: admin123)",
      );
    }

    const [s] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, "general"));
    if (!s) {
      await db.insert(settings).values({
        id: "general",
        fixedBalance: 0,
        announcement: "",
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed initial data");
  }
}
