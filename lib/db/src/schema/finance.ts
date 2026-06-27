import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Notes:
// - Date/timestamp-like fields are stored as ISO strings (text) to exactly
//   match the prior Firestore behavior (frontend uses new Date(str) /
//   toISOString()).
// - Monetary values use doublePrecision; rupiah integers stay exact within
//   the JS safe-integer range and serialize as plain numbers.
// - branchId columns are plain uuids (no FK constraints) to avoid cascade /
//   ordering complexity for this small single-org dataset.
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  email: text("email"),
  name: text("name").notNull(),
  role: text("role").notNull().default("karyawan"),
  branchId: uuid("branch_id"),
  phone: text("phone"),
  baseSalary: doublePrecision("base_salary"),
  createdAt: text("created_at").notNull(),
});

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  capital: doublePrecision("capital").default(0),
  physicalCapital: doublePrecision("physical_capital").default(0),
  shiftedCapital: doublePrecision("shifted_capital").default(0),
  totalSetor: doublePrecision("total_setor"),
  createdAt: text("created_at").notNull(),
});

export const branchDeposits = pgTable("branch_deposits", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").notNull(),
  totalSetor: doublePrecision("total_setor").notNull().default(0),
  sisaSetor: doublePrecision("sisa_setor").notNull().default(0),
  berhasilDisetor: doublePrecision("berhasil_disetor").notNull().default(0),
  destination: text("destination"),
  description: text("description"),
  date: text("date").notNull(),
  createdBy: text("created_by"),
  createdByName: text("created_by_name"),
  status: text("status").default("pending"),
  receivedBy: text("received_by"),
  receivedByName: text("received_by_name"),
  receivedAt: text("received_at"),
  atmName: text("atm_name"),
  completedBy: text("completed_by"),
  completedByName: text("completed_by_name"),
  completedAt: text("completed_at"),
  editHistory: jsonb("edit_history").$type<
    {
      previousAmount: number;
      editedAt: string;
      editedBy: string;
      editedByName: string;
    }[]
  >(),
});

export const banks = pgTable("banks", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankName: text("bank_name").notNull(),
  balance: doublePrecision("balance").notNull().default(0),
  branchId: uuid("branch_id"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  personName: text("person_name").notNull(),
  branchId: uuid("branch_id"),
  createdAt: text("created_at").notNull(),
});

export const customerTransactions = pgTable("customer_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  date: text("date").notNull(),
  createdBy: text("created_by"),
});

export const savings = pgTable("savings", {
  id: uuid("id").primaryKey().defaultRandom(),
  personName: text("person_name").notNull(),
  phone: text("phone"),
  branchId: uuid("branch_id"),
  createdAt: text("created_at").notNull(),
});

export const savingTransactions = pgTable("saving_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  savingId: uuid("saving_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  date: text("date").notNull(),
  createdBy: text("created_by"),
  createdByName: text("created_by_name"),
});

export const voucherRecaps = pgTable("voucher_recaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull(),
  adminSiang: doublePrecision("admin_siang").default(0),
  adminMalam: doublePrecision("admin_malam").default(0),
  voucherSiang: doublePrecision("voucher_siang").default(0),
  voucherMalam: doublePrecision("voucher_malam").default(0),
  expenseAmount: doublePrecision("expense_amount").default(0),
  expenseDescription: text("expense_description"),
  total: doublePrecision("total").default(0),
  description: text("description"),
  branchId: uuid("branch_id"),
  status: text("status").default("reported"),
  createdAt: text("created_at"),
  createdBy: text("created_by"),
  createdByName: text("created_by_name"),
});

export const salarySlips = pgTable("salary_slips", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  userName: text("user_name"),
  role: text("role"),
  branchId: uuid("branch_id"),
  branchName: text("branch_name"),
  month: integer("month"),
  year: integer("year"),
  baseSalary: doublePrecision("base_salary").default(0),
  bonus: doublePrecision("bonus").default(0),
  deductions: doublePrecision("deductions").default(0),
  netSalary: doublePrecision("net_salary").default(0),
  dailyRate: doublePrecision("daily_rate").default(0),
  daysOff: integer("days_off").default(0),
  status: text("status").default("pending"),
  createdAt: text("created_at"),
  paidAt: text("paid_at"),
  createdBy: text("created_by"),
  createdByName: text("created_by_name"),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey().default("general"),
  fixedBalance: doublePrecision("fixed_balance").default(0),
  announcement: text("announcement").default(""),
  updatedAt: text("updated_at"),
});
