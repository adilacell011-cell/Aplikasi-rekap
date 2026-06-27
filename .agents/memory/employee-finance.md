---
name: Employee (karyawan) finance vs nasabah
description: How employee bon/tabungan reuse the customers/savings tables and how salary allocations are applied; store error-swallowing gotcha.
---

# Employee kasbon & tabungan

Employee (karyawan) bon/hutang and tabungan reuse the SAME `customers`/`savings`
tables as nasabah, distinguished by `ownerType` ('nasabah'|'karyawan', default
'nasabah') + `userId`. The store's `loadAll()` splits them: nasabah rows feed the
existing Debts/Savings pages (`debts`/`savings`), karyawan rows feed
`employeeDebts`/`employeeSavings`. Anytime you add a query/page touching customers
or savings, decide which `ownerType` it should see or you'll leak employee records
into nasabah pages (and vice-versa).

Salary allocations: `salary_slips` has `debtPayment`/`savingDeposit`/`savingWithdraw`.
Take-home = `netSalary − debtPayment − savingDeposit + savingWithdraw`. The gaji
**expense stays = netSalary** (allocations are distribution of pay, NOT an expense
reduction) so P&L stays correct. Deleting a slip does NOT auto-reverse the
employee bon/tabungan ledger transactions — by design (ledger behavior).

**Why it matters / gotcha:** `useFinanceStore` actions catch their own errors via
`setStoreError` and do NOT rethrow. So `await addEmployeeBon(...)` etc. never throw
to the caller — a failed ledger post is silent. The slip create + ledger posts are
separate client calls (no backend transaction anywhere in this app — it's
intentionally non-atomic, poll-based). If you need guaranteed atomicity for a
money flow, add a transactional backend endpoint; the current pattern accepts the
small divergence window consistent with the rest of the app.

**How to apply:** validate allocations client-side before submit (balance checks +
take-home must be ≥ 0). Server-side authz for finance mutations is mostly
client-enforced by design (see replit.md); only genuinely admin-only writes
(branch create/delete, settings, salary-slip writes) are bos-gated on the server.
