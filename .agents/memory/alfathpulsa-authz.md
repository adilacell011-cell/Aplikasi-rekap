---
name: AlfathPulsa authorization model
description: Which API mutations are bos-only vs writable by branch staff (mandor/karyawan), so server-side authz doesn't break UI parity.
---

# AlfathPulsa role/authz model

Roles: `bos` (owner, global), `mandor` (branch supervisor), `karyawan` (branch staff). Bos with no `branchId` is the global owner; bos/staff with a `branchId` act within that branch.

## Server-side authz (api-server finance/users routes)
- **bos-only (`requireBos`)**: create branch (`POST /branches`), delete branch (`DELETE /branches/:id`), settings (`PATCH /settings`), salary-slip writes (`POST|PATCH|DELETE /salary-slips`), and all user management (`POST|PATCH|DELETE /users`).
- **Open to any authenticated user (do NOT lock to bos)**: `PATCH /branches/:id`.

**Why:** `PATCH /branches/:id` updates branch capital fields (capital/physicalCapital/shiftedCapital). Branch staff legitimately call it from the Dashboard — `transferBranchCapital` (handleQuickTransfer) and branch-scoped `updateBranchCapital` (handleSaveFixed when a branchId is set). Locking it to bos breaks mandor/karyawan capital shifts. Branch deposits use nested routes (`/branches/:id/deposits/...`), which are also open.

**How to apply:** When tightening authz on this app, gate by the screen's role: anything only reachable from the bos-only Team/SalarySlips pages (or global Dashboard settings) can be `requireBos`; anything reachable from a branch user's Dashboard must stay open. Role/branch *visibility* filtering is done client-side in the zustand stores (parity with the original Firestore version), not enforced server-side for reads.
