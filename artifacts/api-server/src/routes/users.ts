import { Router, type IRouter } from "express";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import { requireBos, toProfile } from "../middleware/auth";

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
    return res.json(u ? toProfile(u) : null);
  }
  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  return res.json(updated ? toProfile(updated) : null);
});

// Delete a user (bos only)
router.delete("/:id", requireBos, async (req, res) => {
  await db.delete(users).where(eq(users.id, String(req.params.id)));
  return res.json({ ok: true });
});

export default router;
