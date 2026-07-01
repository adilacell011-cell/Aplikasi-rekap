import { Router, type IRouter } from "express";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import { requireBos, toProfile, type AuthedRequest } from "../middleware/auth";

const router: IRouter = Router();

// List all users (any authenticated user; frontend scopes by role)
router.get("/", async (_req, res) => {
  const rows = await db.select().from(users);
  return res.json(rows.map(toProfile));
});

// Create a new user (bos only)
router.post("/", requireBos, async (req, res) => {
  const {
    username,
    password,
    name,
    role,
    branchId,
    phone,
    email,
  } = req.body ?? {};
  if (!username || !password || !name) {
    return res
      .status(400)
      .json({ error: "Username, password, dan nama wajib diisi" });
  }
  const normalized = String(username).trim().toLowerCase();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, normalized));
  if (existing) {
    return res.status(409).json({ error: "Username sudah digunakan" });
  }
  const [created] = await db
    .insert(users)
    .values({
      username: normalized,
      passwordHash: hashPassword(String(password)),
      name,
      role: role ?? "karyawan",
      branchId: branchId ?? null,
      phone: phone ?? null,
      email: email ?? null,
      createdAt: new Date().toISOString(),
    })
    .returning();
  return res.status(201).json(toProfile(created));
});

// Change own password (any authenticated user)
router.patch("/me/password", async (req, res) => {
  const authUser = (req as AuthedRequest).authUser;
  if (!authUser) return res.status(401).json({ error: "Unauthorized" });
  const { oldPassword, newPassword } = req.body ?? {};
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Password lama dan baru wajib diisi" });
  }
  if (String(newPassword).length < 4) {
    return res.status(400).json({ error: "Password baru minimal 4 karakter" });
  }
  const [u] = await db.select().from(users).where(eq(users.id, authUser.id));
  if (!u) return res.status(404).json({ error: "User tidak ditemukan" });
  if (u.passwordHash !== hashPassword(String(oldPassword))) {
    return res.status(401).json({ error: "Password lama salah" });
  }
  await db.update(users).set({ passwordHash: hashPassword(String(newPassword)) }).where(eq(users.id, authUser.id));
  return res.json({ ok: true });
});

// Update a user (bos only)
router.patch("/:id", requireBos, async (req, res) => {
  const id = String(req.params.id);
  const { name, role, branchId, phone, email, password } =
    req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (role !== undefined) updates.role = role;
  if (branchId !== undefined) updates.branchId = branchId;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (password) updates.passwordHash = hashPassword(String(password));
  if (Object.keys(updates).length === 0) {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    if (!u) return res.status(404).json({ error: "User tidak ditemukan" });
    return res.json(toProfile(u));
  }
  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "User tidak ditemukan" });
  return res.json(toProfile(updated));
});

// Delete a user (bos only)
router.delete("/:id", requireBos, async (req, res) => {
  await db.delete(users).where(eq(users.id, String(req.params.id)));
  return res.json({ ok: true });
});

export default router;
