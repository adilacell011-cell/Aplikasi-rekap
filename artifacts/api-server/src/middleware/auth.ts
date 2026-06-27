import type { Request, Response, NextFunction } from "express";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export type DbUser = typeof users.$inferSelect;

export interface AuthedRequest extends Request {
  authUser?: DbUser;
}

export function toProfile(u: DbUser) {
  return {
    uid: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    branchId: u.branchId,
    phone: u.phone,
    baseSalary: u.baseSalary,
    createdAt: u.createdAt,
  };
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload?.uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(users).where(eq(users.id, payload.uid));
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthedRequest).authUser = user;
  next();
}

export function requireBos(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthedRequest).authUser;
  if (user?.role !== "bos") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
