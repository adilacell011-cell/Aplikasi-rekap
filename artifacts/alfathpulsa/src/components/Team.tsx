import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import {
  UserCog, User as UserIcon, Trash2, Store, Plus, Check,
  Phone, Send, X, UserPlus, KeyRound, ChevronDown, ChevronUp, Pencil,
  Eye, EyeOff
} from 'lucide-react';
import { useFinanceStore } from '../hooks/useFinanceStore';
import { useAuthStore } from '../store/authStore';
import { UserProfile } from '../types';
import { checkIsBos } from '../utils/authUtils';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { iosAlert } from '../store/dialogStore';
import { BlockChoice } from './BlockChoice';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Helpers ─────────────────────────────────────────── */
const ROLE_LABEL: Record<string, string> = { bos: 'BOS', mandor: 'MANDOR', karyawan: 'KARYAWAN' };
const ROLE_COLOR: Record<string, string> = {
  bos: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  mandor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  karyawan: 'bg-brand-500/15 text-brand-500 border-brand-500/30',
};

export function Team() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, branchId: myBranchId, role: currentUserRole } = useAuthStore();
  const { branches, addBranch, deleteBranch } = useFinanceStore();
  const [newBranchName, setNewBranchName] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<{ id: string; capital: string; physicalCapital: string } | null>(null);
  const [editingPhone, setEditingPhone] = useState<{ uid: string; phone: string } | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ total: number; success: number; failed: number } | null>(null);
  const isBos = checkIsBos(user, currentUserRole);

  // Password-gated delete state
  const [deletePassModal, setDeletePassModal] = useState<{ type: 'user' | 'branch'; id: string; name: string } | null>(null);
  const [deletePassVal, setDeletePassVal] = useState('');
  const [deletePassError, setDeletePassError] = useState<string | null>(null);
  const [deletePassLoading, setDeletePassLoading] = useState(false);
  const [deletePassVisible, setDeletePassVisible] = useState(false);

  const [resetPassModal, setResetPassModal] = useState<{ userId: string; userName: string } | null>(null);
  const [resetPassVal, setResetPassVal] = useState('');
  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [resetPassError, setResetPassError] = useState<string | null>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{ username: string; password: string; name: string; role: 'bos' | 'mandor' | 'karyawan'; branchId: string }>({
    username: '', password: '', name: '', role: 'karyawan', branchId: ''
  });

  /* ─── Data ──────────────────────────────────────────── */
  const loadUsers = async () => {
    try {
      const data: UserProfile[] = await api.get('/users');
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    loadUsers();
    const id = setInterval(loadUsers, 5000);
    return () => clearInterval(id);
  }, []);

  /* ─── Handlers ──────────────────────────────────────── */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassModal || !resetPassVal.trim()) return;
    if (resetPassVal.length < 4) { setResetPassError('Password minimal 4 karakter'); return; }
    setResetPassLoading(true); setResetPassError(null);
    try {
      await api.patch(`/users/${resetPassModal.userId}`, { password: resetPassVal });
      setResetPassModal(null); setResetPassVal('');
      iosAlert('Berhasil', `Password ${resetPassModal.userName} berhasil direset.`);
    } catch (err) { setResetPassError(err instanceof Error ? err.message : 'Gagal mereset password'); }
    finally { setResetPassLoading(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password || !newUser.name.trim()) return;
    setIsCreating(true); setAddUserError(null);
    try {
      await api.post('/users', {
        username: newUser.username.trim(),
        password: newUser.password,
        name: newUser.name.trim(),
        role: newUser.role,
        branchId: newUser.branchId || null
      });
      const createdName = newUser.name.trim();
      setNewUser({ username: '', password: '', name: '', role: 'karyawan', branchId: '' });
      setShowAddUser(false);
      await loadUsers();
      iosAlert('Anggota Berhasil Ditambahkan ✅', `Akun untuk ${createdName} sudah aktif dan bisa digunakan untuk login.`);
    } catch (err) { setAddUserError(err instanceof Error ? err.message : 'Gagal membuat akun'); }
    finally { setIsCreating(false); }
  };

  const handlePhoneChange = async (uid: string, phone: string) => {
    try { await api.patch(`/users/${uid}`, { phone }); setEditingPhone(null); await loadUsers(); }
    catch (e) { console.error(e); }
  };

  const handleBroadcastTest = async () => {
    const targets = users.filter(u => u.phone);
    if (targets.length === 0) { iosAlert('Tidak Ada Nomor', 'Belum ada nomor WhatsApp terdaftar.'); return; }
    setIsBroadcasting(true);
    setBroadcastStatus({ total: targets.length, success: 0, failed: 0 });
    const message = `*TES BROADCAST ALFATHPulsa*\n\nHalo! Ini adalah pesan tes dari sistem.\nWaktu: ${new Date().toLocaleString('id-ID')}\n_Pesan ini dikirim otomatis._`;
    for (const u of targets) {
      if (!u.phone) continue;
      try {
        const r = await sendWhatsAppMessage(u.phone, message);
        if (r.status === true || r.status === 'true') setBroadcastStatus(p => p ? { ...p, success: p.success + 1 } : null);
        else setBroadcastStatus(p => p ? { ...p, failed: p.failed + 1 } : null);
      } catch { setBroadcastStatus(p => p ? { ...p, failed: p.failed + 1 } : null); }
    }
    setIsBroadcasting(false);
    setTimeout(() => setBroadcastStatus(null), 2000);
  };

  const handleRoleChange = async (uid: string, newRole: 'bos' | 'mandor' | 'karyawan') => {
    try { await api.patch(`/users/${uid}`, { role: newRole }); await loadUsers(); }
    catch (e) { console.error(e); }
  };

  const handleBranchChange = async (uid: string, newBranchId: string) => {
    try { await api.patch(`/users/${uid}`, { branchId: newBranchId || null }); await loadUsers(); }
    catch (e) { console.error(e); }
  };

  const handleDeleteWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassModal || !deletePassVal.trim()) return;
    setDeletePassLoading(true);
    setDeletePassError(null);
    try {
      // Verify password first
      await api.post('/auth/verify-password', { password: deletePassVal });
      // Password OK — execute deletion
      if (deletePassModal.type === 'user') {
        await api.delete(`/users/${deletePassModal.id}`);
        await loadUsers();
      } else {
        await deleteBranch(deletePassModal.id);
      }
      setDeletePassModal(null);
      setDeletePassVal('');
    } catch (err) {
      setDeletePassError(err instanceof Error ? err.message : 'Password salah atau terjadi kesalahan');
    } finally {
      setDeletePassLoading(false);
    }
  };

  const openDeleteModal = (type: 'user' | 'branch', id: string, name: string) => {
    setDeletePassModal({ type, id, name });
    setDeletePassVal('');
    setDeletePassError(null);
    setDeletePassVisible(false);
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = newBranchName.trim().toUpperCase();
    if (!v) return;
    try {
      await addBranch(v);
      setNewBranchName('');
      iosAlert('Cabang Berhasil Ditambahkan ✅', `Cabang "${v}" sudah terdaftar dan siap digunakan.`);
    } catch (err) {
      iosAlert('Gagal Menambahkan Cabang', err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.');
    }
  };

  const handleUpdateBranchCapital = async (branchId: string, capital: string, physicalCapital: string) => {
    const cap = parseInt(capital.replace(/\D/g, ''), 10);
    const phys = parseInt(physicalCapital.replace(/\D/g, ''), 10);
    if (!isNaN(cap)) await useFinanceStore.getState().updateBranchCapital(branchId, cap);
    if (!isNaN(phys)) await useFinanceStore.getState().updateBranchPhysicalCapital(branchId, phys);
    setEditingBranch(null);
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  /* ─── Render ────────────────────────────────────────── */
  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-brand-500" />
    </div>
  );

  return (
    <div className="p-4 space-y-5 pb-32">

      {/* ── Summary strip ──────────────────────────────── */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 shrink-0">
          <UserCog className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">Manajemen Tim & Cabang</p>
          <p className="text-sm font-black text-white mt-0.5 leading-none">{users.length} Anggota · {branches.length} Cabang</p>
        </div>
        {isBos && (
          <button
            onClick={() => { setShowAddUser(v => !v); setAddUserError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              showAddUser
                ? 'bg-white/10 border-white/10 text-white'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
            }`}
          >
            {showAddUser ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            {showAddUser ? 'Batal' : 'Tambah'}
          </button>
        )}
      </div>

      {/* ── Add User Form (collapsible) ─────────────────── */}
      <AnimatePresence>
        {isBos && showAddUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateUser} className="glass-card rounded-2xl border border-emerald-500/20 p-4 space-y-4">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Buat Akun Baru</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Nama Lengkap', key: 'name', placeholder: 'Nama anggota', extra: {} },
                  { label: 'Username', key: 'username', placeholder: 'username', extra: { autoCapitalize: 'none', autoCorrect: 'off' } },
                  { label: 'Password', key: 'password', placeholder: 'Password awal', extra: {} },
                ].map(({ label, key, placeholder, extra }) => (
                  <div key={key} className={`space-y-1.5 ${key === 'name' ? 'col-span-2' : ''}`}>
                    <label className="text-[8px] font-black text-white/60 uppercase tracking-widest ml-0.5">{label}</label>
                    <input
                      type="text"
                      value={(newUser as any)[key]}
                      onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
                      placeholder={placeholder}
                      {...extra}
                      className="w-full px-3 py-2.5 text-xs glass-input border  rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-white font-semibold"
                    />
                  </div>
                ))}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[8px] font-black text-white/60 uppercase tracking-widest ml-0.5">Role</label>
                  <BlockChoice
                    columns={3} size="sm" value={newUser.role}
                    onChange={(v) => setNewUser({ ...newUser, role: v as any })}
                    options={[
                      { value: 'karyawan', label: 'Karyawan' },
                      { value: 'mandor', label: 'Mandor' },
                      { value: 'bos', label: 'Bos' },
                    ]}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[8px] font-black text-white/60 uppercase tracking-widest ml-0.5">Cabang</label>
                  <BlockChoice
                    columns={3} size="sm" value={newUser.branchId}
                    onChange={(v) => setNewUser({ ...newUser, branchId: v })}
                    options={[
                      { value: '', label: newUser.role === 'bos' ? 'Pusat' : 'Tanpa Cabang' },
                      ...branches.map(b => ({ value: b.id, label: b.name })),
                    ]}
                  />
                </div>
              </div>

              {addUserError && (
                <p className="text-[10px] text-rose-400 font-bold text-center bg-rose-500/10 rounded-xl px-3 py-2">{addUserError}</p>
              )}
              <button
                type="submit"
                disabled={isCreating || !newUser.username.trim() || !newUser.password || !newUser.name.trim()}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isCreating ? 'Menyimpan...' : 'Simpan Akun'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Branches ───────────────────────────────────── */}
      <div className="space-y-2">
        {/* Section header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Daftar Cabang</span>
          </div>
          {isBos && (
            <form onSubmit={handleAddBranch} className="flex items-center gap-1.5">
              <input
                type="text" placeholder="Nama cabang baru" value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                autoCorrect="off" autoComplete="off" spellCheck={false} autoCapitalize="characters"
                className="glass-card border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white uppercase tracking-wide placeholder:text-white/60 focus:outline-none focus:border-brand-500 w-36"
              />
              <button
                type="submit" disabled={!newBranchName.trim()}
                className="bg-brand-500 text-white p-1.5 rounded-lg hover:bg-brand-600 disabled:opacity-40 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {branches.length === 0 ? (
          <p className="text-[10px] text-white/60 font-bold text-center py-4 uppercase tracking-widest">Belum ada cabang.</p>
        ) : (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden divide-y divide-asphalt-700/40">
            {branches.map(branch => (
              <div key={branch.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-transparent border border-white/10 flex items-center justify-center text-brand-500 text-[9px] font-black shrink-0">
                    {branch.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-white flex-1 uppercase tracking-tight">{branch.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-brand-500 leading-none">{fmt(branch.capital || 0)}</p>
                      <p className="text-[8px] text-white/60 font-bold leading-none mt-0.5">{fmt(branch.physicalCapital || 0)} fisik</p>
                    </div>
                    {isBos && (
                      <button
                        onClick={() => setEditingBranch(editingBranch?.id === branch.id ? null : { id: branch.id, capital: (branch.capital || 0).toString(), physicalCapital: (branch.physicalCapital || 0).toString() })}
                        className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-brand-500 rounded-lg transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isBos && (
                      <button
                        onClick={() => openDeleteModal('branch', branch.id, branch.name)}
                        className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-rose-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Edit modal inline */}
                <AnimatePresence>
                  {editingBranch?.id === branch.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-white/60 uppercase tracking-widest">Modal Non-Fisik</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border border-brand-500/30 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            value={editingBranch.capital.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            onChange={(e) => setEditingBranch({ ...editingBranch, capital: e.target.value.replace(/\D/g, '') })}
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-white/60 uppercase tracking-widest">Modal Fisik</label>
                          <input
                            type="text"
                            className="w-full bg-transparent border border-brand-500/30 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            value={editingBranch.physicalCapital.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            onChange={(e) => setEditingBranch({ ...editingBranch, physicalCapital: e.target.value.replace(/\D/g, '') })}
                          />
                        </div>
                        <button
                          onClick={() => handleUpdateBranchCapital(branch.id, editingBranch.capital, editingBranch.physicalCapital)}
                          className="col-span-2 py-2 bg-brand-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-all"
                        >
                          Simpan Modal
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Users ──────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <UserIcon className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Anggota Tim</span>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden divide-y divide-asphalt-700/40">
          {users.map((u) => {
            const branchName = u.branchId ? branches.find(b => b.id === u.branchId)?.name : null;
            const isExpanded = expandedUser === u.uid;
            const isEditingThisPhone = editingPhone?.uid === u.uid;
            const isAdmin = u.email === 'alfathpulsa27@gmail.com';

            return (
              <div key={u.uid}>
                {/* Compact row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-[10px] font-black ${
                    u.role === 'bos' ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' :
                    u.role === 'mandor' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                    'bg-brand-500/15 border-brand-500/30 text-brand-500'
                  }`}>
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white leading-none truncate">{u.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${ROLE_COLOR[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                      {branchName ? (
                        <span className="text-[8px] font-bold text-white/60 truncate">{branchName}</span>
                      ) : (
                        <span className="text-[8px] font-bold text-white/60 opacity-50">{u.role === 'bos' ? 'Pusat' : 'Tanpa Cabang'}</span>
                      )}
                      {u.phone && <span className="text-[8px] text-emerald-500 font-bold">· WA ✓</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isBos && (
                      <button
                        onClick={() => { setResetPassModal({ userId: u.uid, userName: u.name }); setResetPassVal(''); setResetPassError(null); }}
                        className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-amber-400 rounded-lg transition-all"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isBos && !isAdmin && (
                      <button
                        onClick={() => openDeleteModal('user', u.uid, u.name)}
                        className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-rose-500 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isBos && (
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : u.uid)}
                        className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white rounded-lg transition-all"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded edit panel */}
                <AnimatePresence>
                  {isExpanded && isBos && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">

                        {/* Role */}
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-white/60 uppercase tracking-widest">Role</label>
                          <BlockChoice
                            columns={3} size="sm" value={u.role}
                            onChange={(v) => handleRoleChange(u.uid, v as any)}
                            disabled={!isBos || isAdmin}
                            options={[
                              { value: 'karyawan', label: 'Karyawan' },
                              { value: 'mandor', label: 'Mandor' },
                              { value: 'bos', label: 'Bos' },
                            ]}
                          />
                        </div>

                        {/* Branch */}
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-white/60 uppercase tracking-widest">Cabang</label>
                          <BlockChoice
                            columns={3} size="sm"
                            value={u.branchId || ''}
                            onChange={(v) => handleBranchChange(u.uid, v)}
                            disabled={!isBos}
                            options={[
                              { value: '', label: u.role === 'bos' ? 'Pusat' : 'Tanpa' },
                              ...branches.map(b => ({ value: b.id, label: b.name })),
                            ]}
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-white/60 uppercase tracking-widest">WhatsApp</label>
                          {isEditingThisPhone ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text" placeholder="62812345678"
                                className="flex-1 px-3 py-2 text-xs bg-transparent border border-brand-500/30 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-white font-bold"
                                value={editingPhone!.phone}
                                onChange={(e) => setEditingPhone({ ...editingPhone!, phone: e.target.value.replace(/\D/g, '') })}
                                autoFocus
                              />
                              <button
                                onClick={() => handlePhoneChange(u.uid, editingPhone!.phone)}
                                className="h-9 px-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-1.5 text-[9px] font-black"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3px]" /> Simpan
                              </button>
                              <button
                                onClick={() => setEditingPhone(null)}
                                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white border border-white/10 rounded-xl transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingPhone({ uid: u.uid, phone: u.phone || '' })}
                              className="w-full flex items-center justify-between px-3 py-2 glass-input rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all border "
                            >
                              <span className={u.phone ? 'text-white' : 'text-white/60'}>
                                {u.phone || 'Belum diatur'}
                              </span>
                              <Phone className="w-3.5 h-3.5 text-white/60" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WhatsApp Broadcast ──────────────────────────── */}
      <div className="glass-card rounded-2xl border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white leading-none">Tes WhatsApp Masal</p>
              <p className="text-[8px] text-white/60 font-bold uppercase tracking-widest mt-0.5">Verifikasi nomor Fonnte</p>
            </div>
          </div>
          {isBroadcasting && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[8px] font-black text-emerald-500 uppercase">Proses...</span>
            </div>
          )}
        </div>

        {broadcastStatus && (
          <div className="flex items-center gap-2 px-3 py-2 bg-transparent rounded-xl border border-white/10">
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px] shrink-0" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wide">
              Berhasil: {broadcastStatus.success} · Gagal: {broadcastStatus.failed}
            </span>
          </div>
        )}

        <button
          onClick={handleBroadcastTest}
          disabled={isBroadcasting}
          className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          Kirim Pesan Tes
        </button>
      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      {/* Password-gated Delete Sheet */}
      {createPortal(
        <AnimatePresence>
          {deletePassModal && (
            <motion.div
              key="delete-pass-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[500] flex items-end justify-center ios-backdrop ios-font pb-[env(safe-area-inset-bottom,0px)]"
              onClick={() => !deletePassLoading && (setDeletePassModal(null), setDeletePassVal(''))}
            >
              <motion.div
                key="delete-pass-panel"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
                className="w-full max-w-md glass-card-strong rounded-b-none rounded-t-[2rem] p-6 pb-8 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">
                        {deletePassModal.type === 'user' ? 'Hapus Anggota' : 'Hapus Cabang'}
                      </h3>
                      <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
                        {deletePassModal.name}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { setDeletePassModal(null); setDeletePassVal(''); }} disabled={deletePassLoading}
                    className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white rounded-xl border border-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Warning */}
                <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <span className="text-rose-400 text-base leading-none mt-0.5">⚠️</span>
                  <p className="text-[11px] text-rose-300 font-semibold leading-relaxed">
                    Tindakan ini <span className="font-black text-rose-400">tidak dapat dibatalkan</span>. Masukkan password Anda untuk konfirmasi penghapusan.
                  </p>
                </div>

                {/* Password form */}
                <form onSubmit={handleDeleteWithPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-widest ml-1">Password Anda</label>
                    <div className="relative">
                      <input
                        type={deletePassVisible ? 'text' : 'password'}
                        value={deletePassVal}
                        onChange={(e) => { setDeletePassVal(e.target.value); setDeletePassError(null); }}
                        placeholder="Masukkan password"
                        autoFocus
                        className="w-full px-4 py-3.5 pr-12 text-sm glass-input rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/40 text-white font-semibold"
                      />
                      <button type="button" onClick={() => setDeletePassVisible(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                        {deletePassVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {deletePassError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3">
                      <p className="text-[11px] text-rose-400 font-bold text-center">🔒 {deletePassError}</p>
                    </div>
                  )}

                  <button type="submit"
                    disabled={deletePassLoading || !deletePassVal.trim()}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                  >
                    {deletePassLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memverifikasi...</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Hapus Permanen</>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {resetPassModal && (
            <motion.div
              key="resetpw-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[500] flex items-end justify-center ios-backdrop ios-font pb-[env(safe-area-inset-bottom,0px)]"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
              onClick={() => !resetPassLoading && setResetPassModal(null)}
            >
              <motion.div
                key="resetpw-panel"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
                className="w-full max-w-md ios-card rounded-b-none rounded-t-[2rem] p-6 pb-8 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <KeyRound className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Reset Password</h3>
                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[180px]">{resetPassModal?.userName}</p>
                    </div>
                  </div>
                  <button onClick={() => setResetPassModal(null)} disabled={resetPassLoading}
                    className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white rounded-xl border border-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-widest ml-1">Password Baru</label>
                    <input
                      type="text" value={resetPassVal}
                      onChange={(e) => setResetPassVal(e.target.value)}
                      placeholder="Min. 4 karakter" autoFocus
                      className="w-full px-4 py-3.5 text-sm glass-input border  rounded-2xl outline-none focus:ring-2 focus:ring-amber-400/50 text-white font-semibold shadow-inner"
                    />
                  </div>
                  {resetPassError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3">
                      <p className="text-[11px] text-rose-400 font-bold text-center">{resetPassError}</p>
                    </div>
                  )}
                  <button type="submit" disabled={resetPassLoading || !resetPassVal.trim()}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-amber-500/20">
                    {resetPassLoading ? 'Menyimpan...' : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
