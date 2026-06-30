---
name: AlfathPulsa authorization model
description: Which API mutations are bos-only vs writable by branch staff (mandor/karyawan), so server-side authz doesn't break UI parity.
---

# AlfathPulsa role/authz model

Roles: `bos` (owner, global), `mandor` (branch supervisor), `karyawan` (branch staff). Bos with no `branchId` is the global owner; bos/staff with a `branchId` act within that branch.

## Server-side authz (api-server finance/users routes)
- **bos-only (`requireBos`)**: create branch (`POST /branches`), delete branch (`DELETE /branches/:id`), settings (`PATCH /settings`), salary-slip writes (`POST|PATCH|DELETE /salary-slips`), user management (`POST|PATCH|DELETE /users`), delete branch deposit (`DELETE /branches/:id/deposits/:depId`), delete voucher recap (`DELETE /voucher-recaps/:id`).
- **Banks**: `POST /banks` and `PATCH /banks/:id` open to all auth users (karyawan adds bank to their own branch via branchId from auth state). `DELETE /banks/:id` is branch-scoped: bos-global (no branchId) can delete any; karyawan/mandor can only delete if `bank.branchId === authUser.branchId`.
- **bos/mandor only (`requireBosOrMandor`)**: attendance writes (`POST|PATCH|DELETE /attendance`).
- **Open to any authenticated user (do NOT lock to bos)**: `PATCH /branches/:id`, all deposit/voucher/debt-detail/saving-transaction POSTs and PATCHes.
- **BLOCKED for bos, branch-scoped for karyawan/mandor**: `DELETE /debts/:id` and `DELETE /savings/:id` — bos gets 403; karyawan/mandor may only delete records where `record.branchId === authUser.branchId`.

**Why bos cannot delete debts/savings:** Bos role is "monitor only" for nasabah data. Karyawan manage their own branch's hutang/tabungan nasabah and are the only ones who should remove those records. Bos deleting data would bypass branch ownership.

**Why:** `PATCH /branches/:id` updates branch capital fields. Branch staff call it from Dashboard. Locking to bos breaks mandor/karyawan capital shifts.

**How to apply:** Gate by screen role — bos-only pages (Team, SalarySlips, global settings) use `requireBos`; branch-level operational data (debts, savings, deposits, vouchers) must stay writable by branch staff. Role/branch visibility filtering is done client-side in zustand stores.
