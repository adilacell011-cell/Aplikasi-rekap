import { Router, type IRouter } from "express";
import {
  db,
  branches,
  branchDeposits,
  banks,
  customers,
  customerTransactions,
  savings,
  savingTransactions,
  voucherRecaps,
  salarySlips,
  attendance,
  settings,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireBos, requireBosOrMandor, type AuthedRequest } from "../middleware/auth";

const router: IRouter = Router();

const now = () => new Date().toISOString();

// --------------------------------------------------------------------------
// Settings (singleton row id = 'general')
// --------------------------------------------------------------------------
async function ensureSettings() {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, "general"));
  if (row) return row;
  const [created] = await db
    .insert(settings)
    .values({ id: "general", fixedBalance: 0, announcement: "", updatedAt: now() })
    .returning();
  return created;
}

router.get("/settings", async (_req, res) => {
  const row = await ensureSettings();
  return res.json({
    fixedBalance: row.fixedBalance ?? 0,
    announcement: row.announcement ?? "",
  });
});

router.patch("/settings", requireBos, async (req, res) => {
  await ensureSettings();
  const updates: Record<string, unknown> = { updatedAt: now() };
  if (req.body?.fixedBalance !== undefined)
    updates.fixedBalance = req.body.fixedBalance;
  if (req.body?.announcement !== undefined)
    updates.announcement = req.body.announcement;
  const [row] = await db
    .update(settings)
    .set(updates)
    .where(eq(settings.id, "general"))
    .returning();
  return res.json({
    fixedBalance: row.fixedBalance ?? 0,
    announcement: row.announcement ?? "",
  });
});

// --------------------------------------------------------------------------
// Branches (+ nested deposits)
// --------------------------------------------------------------------------
router.get("/branches", async (_req, res) => {
  const allBranches = await db.select().from(branches);
  const allDeposits = await db.select().from(branchDeposits);
  const byBranch = new Map<string, any[]>();
  for (const d of allDeposits) {
    const arr = byBranch.get(d.branchId) ?? [];
    arr.push(d);
    byBranch.set(d.branchId, arr);
  }
  const result = allBranches.map((b) => {
    const deposits = (byBranch.get(b.id) ?? []).sort((a, c) =>
      String(a.date).localeCompare(String(c.date)),
    );
    return { ...b, deposits };
  });
  return res.json(result);
});

router.post("/branches", requireBos, async (req, res) => {
  const { name, totalSetor } = req.body ?? {};
  const [created] = await db
    .insert(branches)
    .values({ name, totalSetor: totalSetor ?? null, createdAt: now() })
    .returning();
  return res.status(201).json({ ...created, deposits: [] });
});

router.patch("/branches/:id", async (req, res) => {
  const updates: Record<string, unknown> = {};
  for (const k of [
    "name",
    "capital",
    "physicalCapital",
    "shiftedCapital",
    "totalSetor",
  ]) {
    if (req.body?.[k] !== undefined) updates[k] = req.body[k];
  }
  const [row] = await db
    .update(branches)
    .set(updates)
    .where(eq(branches.id, String(req.params.id)))
    .returning();
  return res.json(row ?? null);
});

router.delete("/branches/:id", requireBos, async (req, res) => {
  await db
    .delete(branchDeposits)
    .where(eq(branchDeposits.branchId, String(req.params.id)));
  await db.delete(branches).where(eq(branches.id, String(req.params.id)));
  return res.json({ ok: true });
});

router.post("/branches/:id/deposits", async (req, res) => {
  const b = req.body ?? {};
  const [created] = await db
    .insert(branchDeposits)
    .values({
      branchId: String(req.params.id),
      totalSetor: b.totalSetor ?? 0,
      sisaSetor: b.sisaSetor ?? 0,
      berhasilDisetor: b.berhasilDisetor ?? 0,
      destination: b.destination ?? null,
      description: b.description ?? null,
      date: b.date ?? now(),
      createdBy: b.createdBy ?? null,
      createdByName: b.createdByName ?? null,
      status: b.status ?? "pending",
    })
    .returning();
  return res.status(201).json(created);
});

router.patch("/branches/:id/deposits/:depId", async (req, res) => {
  const updates: Record<string, unknown> = {};
  for (const k of [
    "totalSetor",
    "sisaSetor",
    "berhasilDisetor",
    "destination",
    "description",
    "status",
    "receivedBy",
    "receivedByName",
    "receivedAt",
    "atmName",
    "completedBy",
    "completedByName",
    "completedAt",
    "editHistory",
  ]) {
    if (req.body?.[k] !== undefined) updates[k] = req.body[k];
  }
  const [row] = await db
    .update(branchDeposits)
    .set(updates)
    .where(eq(branchDeposits.id, String(req.params.depId)))
    .returning();
  return res.json(row ?? null);
});

router.delete("/branches/:id/deposits/:depId", requireBos, async (req, res) => {
  await db
    .delete(branchDeposits)
    .where(eq(branchDeposits.id, String(req.params.depId)));
  return res.json({ ok: true });
});

// --------------------------------------------------------------------------
// Banks
// --------------------------------------------------------------------------
router.get("/banks", async (_req, res) => {
  return res.json(await db.select().from(banks));
});

router.post("/banks", async (req, res) => {
  const { bankName, balance, branchId } = req.body ?? {};
  const [created] = await db
    .insert(banks)
    .values({
      bankName,
      balance: balance ?? 0,
      branchId: branchId ?? null,
      createdAt: now(),
      updatedAt: now(),
    })
    .returning();
  return res.status(201).json(created);
});

router.patch("/banks/:id", async (req, res) => {
  const updates: Record<string, unknown> = { updatedAt: now() };
  if (req.body?.balance !== undefined) updates.balance = req.body.balance;
  if (req.body?.bankName !== undefined) updates.bankName = req.body.bankName;
  const [row] = await db
    .update(banks)
    .set(updates)
    .where(eq(banks.id, String(req.params.id)))
    .returning();
  return res.json(row ?? null);
});

router.delete("/banks/:id", async (req, res) => {
  const authUser = (req as AuthedRequest).authUser;
  const [record] = await db.select().from(banks).where(eq(banks.id, String(req.params.id)));
  if (!record) return res.status(404).json({ error: "Data tidak ditemukan" });
  const isBosGlobal = authUser?.role === "bos" && !authUser?.branchId;
  if (!isBosGlobal && record.branchId && authUser?.branchId !== record.branchId) {
    return res.status(403).json({ error: "Hanya bisa hapus rekening cabang sendiri" });
  }
  await db.delete(banks).where(eq(banks.id, String(req.params.id)));
  return res.json({ ok: true });
});

// --------------------------------------------------------------------------
// Debts (customers + transactions => details[])
// --------------------------------------------------------------------------
router.get("/debts", async (_req, res) => {
  const allCustomers = await db.select().from(customers);
  const allTx = await db.select().from(customerTransactions);
  const byCustomer = new Map<string, any[]>();
  for (const t of allTx) {
    const arr = byCustomer.get(t.customerId) ?? [];
    arr.push({
      id: t.id,
      date: t.date,
      amount: t.amount,
      description: t.description ?? "",
      type: t.type,
    });
    byCustomer.set(t.customerId, arr);
  }
  const result = allCustomers.map((c) => ({
    id: c.id,
    personName: c.personName,
    branchId: c.branchId,
    ownerType: c.ownerType ?? "nasabah",
    userId: c.userId ?? undefined,
    createdAt: c.createdAt,
    details: (byCustomer.get(c.id) ?? []).sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    ),
  }));
  return res.json(result);
});

router.post("/debts", async (req, res) => {
  const { personName, branchId, ownerType, userId } = req.body ?? {};
  const [created] = await db
    .insert(customers)
    .values({
      personName,
      branchId: branchId ?? null,
      ownerType: ownerType ?? "nasabah",
      userId: userId ?? null,
      createdAt: now(),
    })
    .returning();
  return res.status(201).json({ ...created, details: [] });
});

router.delete("/debts/:id", async (req, res) => {
  const authUser = (req as AuthedRequest).authUser;
  if (authUser?.role === "bos") {
    return res.status(403).json({ error: "Bos tidak bisa hapus data hutang nasabah" });
  }
  const [record] = await db.select().from(customers).where(eq(customers.id, String(req.params.id)));
  if (!record) return res.status(404).json({ error: "Data tidak ditemukan" });
  if (record.branchId && authUser?.branchId !== record.branchId) {
    return res.status(403).json({ error: "Hanya bisa hapus data cabang sendiri" });
  }
  await db
    .delete(customerTransactions)
    .where(eq(customerTransactions.customerId, String(req.params.id)));
  await db.delete(customers).where(eq(customers.id, String(req.params.id)));
  return res.json({ ok: true });
});

router.post("/debts/:id/details", async (req, res) => {
  const b = req.body ?? {};
  const [created] = await db
    .insert(customerTransactions)
    .values({
      customerId: String(req.params.id),
      amount: b.amount ?? 0,
      description: b.description ?? null,
      type: b.type,
      date: b.date ?? now(),
      createdBy: b.createdBy ?? null,
    })
    .returning();
  return res.status(201).json(created);
});

router.delete("/debts/:id/details/:detailId", async (req, res) => {
  await db
    .delete(customerTransactions)
    .where(eq(customerTransactions.id, String(req.params.detailId)));
  return res.json({ ok: true });
});

// --------------------------------------------------------------------------
// Savings (+ nested transactions)
// --------------------------------------------------------------------------
router.get("/savings", async (_req, res) => {
  const allSavings = await db.select().from(savings);
  const allTx = await db.select().from(savingTransactions);
  const bySaving = new Map<string, any[]>();
  for (const t of allTx) {
    const arr = bySaving.get(t.savingId) ?? [];
    arr.push({
      id: t.id,
      date: t.date,
      amount: t.amount,
      description: t.description ?? "",
      type: t.type,
      createdBy: t.createdBy ?? "",
      createdByName: t.createdByName ?? "",
    });
    bySaving.set(t.savingId, arr);
  }
  const result = allSavings.map((s) => ({
    id: s.id,
    personName: s.personName,
    phone: s.phone ?? undefined,
    branchId: s.branchId,
    ownerType: s.ownerType ?? "nasabah",
    userId: s.userId ?? undefined,
    createdAt: s.createdAt,
    transactions: (bySaving.get(s.id) ?? []).sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    ),
  }));
  return res.json(result);
});

router.post("/savings", async (req, res) => {
  const { personName, phone, branchId, ownerType, userId } = req.body ?? {};
  const [created] = await db
    .insert(savings)
    .values({
      personName,
      phone: phone ?? null,
      branchId: branchId ?? null,
      ownerType: ownerType ?? "nasabah",
      userId: userId ?? null,
      createdAt: now(),
    })
    .returning();
  return res.status(201).json({ ...created, transactions: [] });
});

router.delete("/savings/:id", async (req, res) => {
  const authUser = (req as AuthedRequest).authUser;
  if (authUser?.role === "bos") {
    return res.status(403).json({ error: "Bos tidak bisa hapus data tabungan nasabah" });
  }
  const [record] = await db.select().from(savings).where(eq(savings.id, String(req.params.id)));
  if (!record) return res.status(404).json({ error: "Data tidak ditemukan" });
  if (record.branchId && authUser?.branchId !== record.branchId) {
    return res.status(403).json({ error: "Hanya bisa hapus data cabang sendiri" });
  }
  await db
    .delete(savingTransactions)
    .where(eq(savingTransactions.savingId, String(req.params.id)));
  await db.delete(savings).where(eq(savings.id, String(req.params.id)));
  return res.json({ ok: true });
});

router.post("/savings/:id/transactions", async (req, res) => {
  const b = req.body ?? {};
  const [created] = await db
    .insert(savingTransactions)
    .values({
      savingId: String(req.params.id),
      amount: b.amount ?? 0,
      description: b.description ?? null,
      type: b.type,
      date: b.date ?? now(),
      createdBy: b.createdBy ?? null,
      createdByName: b.createdByName ?? null,
    })
    .returning();
  return res.status(201).json(created);
});

router.delete("/savings/:id/transactions/:txId", async (req, res) => {
  await db
    .delete(savingTransactions)
    .where(eq(savingTransactions.id, String(req.params.txId)));
  return res.json({ ok: true });
});

// --------------------------------------------------------------------------
// Voucher recaps
// --------------------------------------------------------------------------
router.get("/voucher-recaps", async (_req, res) => {
  const rows = await db.select().from(voucherRecaps);
  rows.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return res.json(rows);
});

router.post("/voucher-recaps", async (req, res) => {
  const b = req.body ?? {};
  const [created] = await db
    .insert(voucherRecaps)
    .values({
      date: b.date,
      adminSiang: b.adminSiang ?? 0,
      adminMalam: b.adminMalam ?? 0,
      voucherSiang: b.voucherSiang ?? 0,
      voucherMalam: b.voucherMalam ?? 0,
      expenseAmount: b.expenseAmount ?? 0,
      expenseDescription: b.expenseDescription ?? null,
      total: b.total ?? 0,
      description: b.description ?? null,
      branchId: b.branchId ?? null,
      status: b.status ?? "reported",
      createdAt: b.createdAt ?? now(),
      createdBy: b.createdBy ?? null,
      createdByName: b.createdByName ?? null,
    })
    .returning();
  return res.status(201).json(created);
});

router.patch("/voucher-recaps/:id", async (req, res) => {
  const updates: Record<string, unknown> = {};
  for (const k of [
    "date",
    "adminSiang",
    "adminMalam",
    "voucherSiang",
    "voucherMalam",
    "expenseAmount",
    "expenseDescription",
    "total",
    "description",
    "branchId",
    "status",
  ]) {
    if (req.body?.[k] !== undefined) updates[k] = req.body[k];
  }
  const [row] = await db
    .update(voucherRecaps)
    .set(updates)
    .where(eq(voucherRecaps.id, String(req.params.id)))
    .returning();
  return res.json(row ?? null);
});

router.delete("/voucher-recaps/:id", requireBos, async (req, res) => {
  await db.delete(voucherRecaps).where(eq(voucherRecaps.id, String(req.params.id)));
  return res.json({ ok: true });
});

// --------------------------------------------------------------------------
// Salary slips
// --------------------------------------------------------------------------
router.get("/salary-slips", async (_req, res) => {
  return res.json(await db.select().from(salarySlips));
});

router.post("/salary-slips", requireBos, async (req, res) => {
  const b = req.body ?? {};
  const [created] = await db
    .insert(salarySlips)
    .values({
      userId: b.userId,
      userName: b.userName ?? null,
      role: b.role ?? null,
      branchId: b.branchId ?? null,
      branchName: b.branchName ?? null,
      month: b.month ?? null,
      year: b.year ?? null,
      baseSalary: b.baseSalary ?? 0,
      bonus: b.bonus ?? 0,
      deductions: b.deductions ?? 0,
      netSalary: b.netSalary ?? 0,
      dailyRate: b.dailyRate ?? 0,
      daysOff: b.daysOff ?? 0,
      debtPayment: b.debtPayment ?? 0,
      savingDeposit: b.savingDeposit ?? 0,
      savingWithdraw: b.savingWithdraw ?? 0,
      status: b.status ?? "pending",
      createdAt: b.createdAt ?? now(),
      paidAt: b.paidAt ?? null,
      createdBy: b.createdBy ?? null,
      createdByName: b.createdByName ?? null,
    })
    .returning();
  return res.status(201).json(created);
});

router.patch("/salary-slips/:id", requireBos, async (req, res) => {
  const updates: Record<string, unknown> = {};
  for (const k of [
    "userName",
    "role",
    "branchId",
    "branchName",
    "month",
    "year",
    "baseSalary",
    "bonus",
    "deductions",
    "netSalary",
    "dailyRate",
    "daysOff",
    "debtPayment",
    "savingDeposit",
    "savingWithdraw",
    "status",
    "paidAt",
  ]) {
    if (req.body?.[k] !== undefined) updates[k] = req.body[k];
  }
  const [row] = await db
    .update(salarySlips)
    .set(updates)
    .where(eq(salarySlips.id, String(req.params.id)))
    .returning();
  return res.json(row ?? null);
});

router.delete("/salary-slips/:id", requireBos, async (req, res) => {
  await db.delete(salarySlips).where(eq(salarySlips.id, String(req.params.id)));
  return res.json({ ok: true });
});

// --------------------------------------------------------------------------
// Attendance (absensi hari libur karyawan)
// --------------------------------------------------------------------------
router.get("/attendance", async (req, res) => {
  const { userId, month, year } = req.query as Record<string, string>;
  let rows = await db.select().from(attendance);
  if (userId) rows = rows.filter((r) => r.userId === userId);
  if (month && year) {
    const prefix = `${year}-${String(Number(month)).padStart(2, "0")}`;
    rows = rows.filter((r) => String(r.date).startsWith(prefix));
  } else if (year) {
    rows = rows.filter((r) => String(r.date).startsWith(year));
  }
  return res.json(rows);
});

router.post("/attendance", requireBos, async (req, res) => {
  const b = req.body ?? {};
  if (!b.userId || !b.date) return res.status(400).json({ error: "userId and date required" });
  const [created] = await db
    .insert(attendance)
    .values({
      userId: b.userId,
      userName: b.userName ?? null,
      branchId: b.branchId ?? null,
      date: b.date,
      status: b.status ?? "libur",
      notes: b.notes ?? null,
      createdAt: now(),
      createdBy: b.createdBy ?? null,
      createdByName: b.createdByName ?? null,
    })
    .returning();
  return res.status(201).json(created);
});

router.patch("/attendance/:id", requireBos, async (req, res) => {
  const updates: Record<string, unknown> = {};
  for (const k of ["status", "notes"]) {
    if (req.body?.[k] !== undefined) updates[k] = req.body[k];
  }
  const [row] = await db
    .update(attendance)
    .set(updates)
    .where(eq(attendance.id, String(req.params.id)))
    .returning();
  return res.json(row ?? null);
});

router.delete("/attendance/:id", requireBos, async (req, res) => {
  await db.delete(attendance).where(eq(attendance.id, String(req.params.id)));
  return res.json({ ok: true });
});

export default router;
