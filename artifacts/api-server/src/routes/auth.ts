import { Router, type IRouter } from "express";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken } from "../lib/auth";
import {
  requireAuth,
  toProfile,
  type AuthedRequest,
} from "../middleware/auth";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi" });
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, String(username).trim().toLowerCase()));
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return res.status(401).json({ error: "Username atau password salah" });
  }
  const token = signToken({ uid: user.id });
  return res.json({ token, user: toProfile(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = (req as AuthedRequest).authUser!;
  return res.json({ user: toProfile(user) });
});

// Verify current user's password (used before destructive actions)
router.post("/verify-password", requireAuth, async (req, res) => {
  const authUser = (req as AuthedRequest).authUser!;
  const { password } = req.body ?? {};
  if (!password) return res.status(400).json({ error: "Password wajib diisi" });
  const [user] = await db.select().from(users).where(eq(users.id, authUser.id));
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return res.status(401).json({ error: "Password salah" });
  }
  return res.json({ ok: true });
});

export default router;
