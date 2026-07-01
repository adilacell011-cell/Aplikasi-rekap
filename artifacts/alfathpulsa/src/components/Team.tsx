import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { Shield, UserCog, User as UserIcon, Trash2, Store, Plus, Check, Phone, Send, X, UserPlus, KeyRound } from 'lucide-react';
import { useFinanceStore } from '../hooks/useFinanceStore';
import { useAuthStore } from '../store/authStore';
import { UserProfile } from '../types';
import { checkIsBos } from '../utils/authUtils';
import { ConfirmModal } from './ConfirmModal';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { iosAlert } from '../store/dialogStore';
import { BlockChoice } from './BlockChoice';
import { motion, AnimatePresence } from 'motion/react';

export function Team() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, branchId, role: currentUserRole } = useAuthStore();
  const { branches, addBranch, deleteBranch } = useFinanceStore();
  const [newBranchName, setNewBranchName] = useState('');
  
  const [editingBranch, setEditingBranch] = useState<{ id: string; capital: string; physicalCapital: string } | null>(null);
  const [editingPhone, setEditingPhone] = useState<{ uid: string; phone: string } | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ total: number; success: number; failed: number } | null>(null);

  const isBos = checkIsBos(user, currentUserRole);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'user' | 'branch'; id: string; name: string }>({
    isOpen: false,
    type: 'user',
    id: '',
    name: ''
  });

  const [resetPassModal, setResetPassModal] = useState<{ userId: string; userName: string } | null>(null);
  const [resetPassVal, setResetPassVal] = useState('');
  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [resetPassError, setResetPassError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassModal || !resetPassVal.trim()) return;
    if (resetPassVal.length < 4) {
      setResetPassError('Password minimal 4 karakter');
      return;
    }
    setResetPassLoading(true);
    setResetPassError(null);
    try {
      await api.patch(`/users/${resetPassModal.userId}`, { password: resetPassVal });
      setResetPassModal(null);
      setResetPassVal('');
      iosAlert('Berhasil', `Password ${resetPassModal.userName} berhasil direset.`);
    } catch (err) {
      setResetPassError(err instanceof Error ? err.message : 'Gagal mereset password');
    } finally {
      setResetPassLoading(false);
    }
  };

  const [showAddUser, setShowAddUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{ username: string; password: string; name: string; role: 'bos' | 'mandor' | 'karyawan'; branchId: string }>({
    username: '',
    password: '',
    name: '',
    role: 'karyawan',
    branchId: ''
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password || !newUser.name.trim()) return;
    setIsCreating(true);
    setAddUserError(null);
    try {
      await api.post('/users', {
        username: newUser.username.trim(),
        password: newUser.password,
        name: newUser.name.trim(),
        role: newUser.role,
        branchId: newUser.branchId || null
      });
      setNewUser({ username: '', password: '', name: '', role: 'karyawan', branchId: '' });
      setShowAddUser(false);
      await loadUsers();
    } catch (error) {
      setAddUserError(error instanceof Error ? error.message : 'Gagal membuat akun');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyEmails = () => {
    const emails = users
      .filter(u => u.role === 'karyawan' || u.role === 'mandor')
      .map(u => u.email)
      .filter(Boolean)
      .join(', ');
    navigator.clipboard.writeText(emails);
    iosAlert('Tersalin', 'Daftar email berhasil disalin ke clipboard.');
  };

  const loadUsers = async () => {
    try {
      const data: UserProfile[] = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePhoneChange = async (uid: string, phone: string) => {
    try {
      await api.patch(`/users/${uid}`, { phone });
      setEditingPhone(null);
      await loadUsers();
    } catch (error) {
      console.error('Error updating phone:', error);
    }
  };
  
  const handleBroadcastTest = async () => {
    const targets = users.filter(u => u.phone);
    if (targets.length === 0) {
      iosAlert('Tidak Ada Nomor', 'Tidak ada nomor WhatsApp yang terdaftar.');
      return;
    }

    setIsBroadcasting(true);
    setBroadcastStatus({ total: targets.length, success: 0, failed: 0 });

    const message = `*TES BROADCAST ALFATHPulsa*\n\n` +
      `Halo! Ini adalah pesan tes dari sistem ALFATHPulsa untuk memastikan nomor Anda sudah terdaftar dengan benar.\n\n` +
      `Waktu: ${new Date().toLocaleString('id-ID')}\n` +
      `_Pesan ini dikirim secara otomatis._`;

    for (const user of targets) {
      try {
        if (user.phone) {
          const result = await sendWhatsAppMessage(user.phone, message);
          if (result.status === true || result.status === 'true') {
            setBroadcastStatus(prev => prev ? { ...prev, success: prev.success + 1 } : null);
          } else {
            console.error(`Fonnte rejected message to ${user.name}:`, result);
            setBroadcastStatus(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
          }
        }
      } catch (error: any) {
        console.error(`Failed to send to ${user.name}:`, error);
        setBroadcastStatus(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
      }
    }

    setIsBroadcasting(false);
    setTimeout(() => setBroadcastStatus(null), 5000);
  };

  const handleRoleChange = async (uid: string, newRole: 'bos' | 'mandor' | 'karyawan') => {
    try {
      await api.patch(`/users/${uid}`, { role: newRole });
      await loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleBranchChange = async (uid: string, newBranchId: string) => {
    try {
      await api.patch(`/users/${uid}`, { branchId: newBranchId || null });
      await loadUsers();
    } catch (error) {
      console.error('Error updating branch:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      if (deleteConfirm.type === 'user') {
        await api.delete(`/users/${deleteConfirm.id}`);
        await loadUsers();
      } else {
        await deleteBranch(deleteConfirm.id);
      }
      setDeleteConfirm({ isOpen: false, type: 'user', id: '', name: '' });
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBranchName.trim().toUpperCase();
    if (trimmed) {
      addBranch(trimmed);
      setNewBranchName('');
    }
  };

  const handleUpdateBranchCapital = async (branchId: string, capital: string, physicalCapital: string) => {
    const capVal = parseInt(capital.replace(/\D/g, ''), 10);
    const physVal = parseInt(physicalCapital.replace(/\D/g, ''), 10);
    
    if (!isNaN(capVal)) {
      await useFinanceStore.getState().updateBranchCapital(branchId, capVal);
    }
    if (!isNaN(physVal)) {
      await useFinanceStore.getState().updateBranchPhysicalCapital(branchId, physVal);
    }
    setEditingBranch(null);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-7 bg-asphalt-900 min-h-screen pb-32">
      {/* Header */}
      <div className="bg-asphalt-800 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group border border-asphalt-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-brand-500/20 transition-all duration-1000"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-asphalt-900 flex items-center justify-center border border-white/10 shadow-lg text-brand-500">
              <UserCog className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-asphalt-text-400 leading-none">Manajemen</h3>
              <p className="text-sm font-black text-white mt-1 uppercase tracking-tight leading-none">Tim & Cabang</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tighter text-white">
              {users.length} <span className="text-asphalt-text-400 text-lg">Anggota</span> | {branches.length} <span className="text-asphalt-text-400 text-lg">Cabang</span>
            </p>
            <p className="text-[10px] text-brand-400 font-black uppercase tracking-[0.15em] mt-2">
              Atur jabatan, penempatan cabang, dan modal operasional.
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast Test Section */}
      <div className="bg-asphalt-800 rounded-[2.5rem] p-7 shadow-2xl border border-asphalt-700/50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Tes WhatsApp</h3>
              <p className="text-[10px] text-asphalt-text-400 font-black uppercase tracking-widest mt-0.5 leading-none">Verifikasi Nomor Bot</p>
            </div>
          </div>
          {isBroadcasting && (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase">Proses...</span>
            </div>
          )}
        </div>
        
        <p className="text-[10px] text-asphalt-text-400 leading-relaxed font-medium uppercase tracking-widest px-1">
          Tes apakah semua nomor sudah bisa menerima pesan dari sistem Fonnte.
        </p>

        {broadcastStatus && (
          <div className="bg-asphalt-900 p-4 rounded-2xl border border-asphalt-700 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                Berhasil: {broadcastStatus.success} | Gagal: {broadcastStatus.failed}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleBroadcastTest}
          disabled={isBroadcasting}
          className="w-full py-4.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          KIRIM PESAN TES MASAL
        </button>
      </div>

      {/* Branch Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Daftar Cabang</h3>
          </div>
          {isBos && (
            <form onSubmit={handleAddBranch} className="flex items-center gap-2">
               <input 
                 type="text" 
                 placeholder="Nama cabang baru" 
                 value={newBranchName}
                 onChange={(e) => setNewBranchName(e.target.value)}
                 autoCorrect="off"
                 autoComplete="off"
                 spellCheck={false}
                 autoCapitalize="characters"
                 className="bg-asphalt-800 border border-asphalt-700/50 rounded-xl px-3 py-2 text-[10px] font-black text-white uppercase tracking-widest placeholder:text-asphalt-text-400 focus:outline-none focus:border-brand-500 transition-all shadow-inner w-40 md:w-48"
               />
               <button 
                 type="submit" 
                 disabled={!newBranchName.trim()}
                 className="bg-brand-500 text-white p-2 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all shadow-lg active:scale-95"
               >
                 <Plus className="w-4 h-4" />
               </button>
            </form>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.length === 0 ? (
            <div className="p-10 text-center col-span-full">
              <Store className="w-10 h-10 text-asphalt-800 mx-auto mb-3" />
              <p className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest">Belum ada cabang terdaftar.</p>
            </div>
          ) : (
            branches.map(branch => (
              <div key={branch.id} className="bg-asphalt-800 rounded-[2.5rem] shadow-2xl border border-asphalt-700/50 overflow-hidden p-5 flex flex-col gap-4 hover:bg-asphalt-900/20 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-asphalt-900 border border-asphalt-700 flex items-center justify-center text-brand-500 text-xs font-black shadow-inner">
                      {branch.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-tight">{branch.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBos && (
                      <button
                        onClick={() => setEditingBranch({ 
                          id: branch.id, 
                          capital: (branch.capital || 0).toString(),
                          physicalCapital: (branch.physicalCapital || 0).toString()
                        })}
                        className="w-10 h-10 flex items-center justify-center text-asphalt-text-400 hover:text-brand-500 hover:bg-brand-500/10 rounded-xl transition-all"
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                    )}
                    {isBos && (
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'branch', id: branch.id, name: branch.name })}
                        className="w-10 h-10 flex items-center justify-center text-asphalt-text-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-asphalt-900/40 p-3 rounded-2xl border border-asphalt-700/50">
                    <p className="text-[8px] text-asphalt-text-400 uppercase font-black tracking-widest mb-1">Modal Non-Fisik</p>
                    {editingBranch?.id === branch.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="w-full bg-asphalt-800 border border-brand-500/30 rounded-lg px-2 py-1 text-xs font-black text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          value={editingBranch.capital.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          onChange={(e) => setEditingBranch({ ...editingBranch, capital: e.target.value.replace(/\D/g, '') })}
                          autoFocus
                        />
                        <button 
                          onClick={() => handleUpdateBranchCapital(branch.id, editingBranch.capital, editingBranch.physicalCapital)} 
                          className="p-1 bg-brand-500 text-white rounded-lg shadow-lg active:scale-90 transition-all"
                        >
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-black text-brand-500 tracking-tight">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(branch.capital || 0)}
                      </p>
                    )}
                  </div>

                  <div className="bg-asphalt-900/40 p-3 rounded-2xl border border-asphalt-700/50 relative overflow-hidden">
                    <p className="text-[8px] text-asphalt-text-400 uppercase font-black tracking-widest mb-1">Modal Fisik</p>
                    {editingBranch?.id === branch.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-asphalt-800 border border-brand-500/30 rounded-lg px-2 py-1 text-xs font-black text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          value={editingBranch.physicalCapital.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          onChange={(e) => setEditingBranch({ ...editingBranch, physicalCapital: e.target.value.replace(/\D/g, '') })}
                        />
                        <button 
                          onClick={() => handleUpdateBranchCapital(branch.id, editingBranch.capital, editingBranch.physicalCapital)} 
                          className="p-1 bg-brand-500 text-white rounded-lg shadow-lg active:scale-90 transition-all"
                        >
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-black text-emerald-500 tracking-tight">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(branch.physicalCapital || 0)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Anggota Tim</h3>
          </div>
          {isBos && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowAddUser(v => !v); setAddUserError(null); }}
                className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" /> Tambah Akun
              </button>
              <button
                onClick={handleCopyEmails}
                className="text-[9px] font-black text-brand-500 uppercase tracking-widest px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-xl hover:bg-brand-500/20 transition-all"
              >
                Copy Semua Email
              </button>
            </div>
          )}
        </div>

        {isBos && showAddUser && (
          <form onSubmit={handleCreateUser} className="bg-asphalt-800 rounded-[2.5rem] shadow-2xl border border-emerald-500/30 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Buat Akun Baru</h3>
              </div>
              <button type="button" onClick={() => setShowAddUser(false)} className="w-9 h-9 flex items-center justify-center text-asphalt-text-400 hover:text-white rounded-xl border border-asphalt-700 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nama anggota"
                  className="w-full px-5 py-4 text-xs bg-asphalt-900 border border-asphalt-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-white font-black shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="username"
                  className="w-full px-5 py-4 text-xs bg-asphalt-900 border border-asphalt-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-white font-black shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Password</label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Password awal"
                  className="w-full px-5 py-4 text-xs bg-asphalt-900 border border-asphalt-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-white font-black shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Role</label>
                <BlockChoice
                  columns={3}
                  value={newUser.role}
                  onChange={(v) => setNewUser({ ...newUser, role: v as any })}
                  options={[
                    { value: 'karyawan', label: 'KARYAWAN' },
                    { value: 'mandor', label: 'MANDOR' },
                    { value: 'bos', label: 'BOS' },
                  ]}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Penempatan Cabang</label>
                <BlockChoice
                  columns={2}
                  value={newUser.branchId}
                  onChange={(v) => setNewUser({ ...newUser, branchId: v })}
                  options={[
                    { value: '', label: newUser.role === 'bos' ? 'PUSAT (GLOBAL)' : 'TANPA CABANG' },
                    ...branches.map(b => ({ value: b.id, label: b.name.toUpperCase() })),
                  ]}
                />
              </div>
            </div>

            {addUserError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3">
                <p className="text-[10px] text-rose-400 font-bold text-center uppercase tracking-wider">{addUserError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating || !newUser.username.trim() || !newUser.password || !newUser.name.trim()}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-lg text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'MENYIMPAN...' : 'Simpan Akun'}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => (
            <div key={user.uid} className="bg-asphalt-800 rounded-[2.5rem] shadow-2xl border border-asphalt-700/50 overflow-hidden p-6 flex flex-col gap-6 hover:bg-asphalt-900/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10 ${
                    user.role === 'bos' ? 'bg-purple-500/10 text-purple-500' :
                    user.role === 'mandor' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-brand-500/10 text-brand-500'
                  }`}>
                    {user.role === 'bos' ? <Shield className="w-7 h-7" /> : <UserIcon className="w-7 h-7" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-white uppercase tracking-tight truncate">{user.name}</h3>
                    <p className="text-[10px] text-asphalt-text-400 font-bold tracking-widest uppercase truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isBos && (
                      <button
                        onClick={() => { setResetPassModal({ userId: user.uid, userName: user.name }); setResetPassVal(''); setResetPassError(null); }}
                        className="w-11 h-11 flex items-center justify-center text-asphalt-text-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all border border-asphalt-700"
                        title="Reset Password"
                      >
                        <KeyRound className="w-4.5 h-4.5" />
                      </button>
                    )}
                    {isBos && user.email !== 'alfathpulsa27@gmail.com' && (
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, type: 'user', id: user.uid, name: user.name })}
                        className="w-11 h-11 flex items-center justify-center text-asphalt-text-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-asphalt-700"
                        title="Hapus Tim"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {(user.role === 'karyawan' || user.role === 'mandor' || user.role === 'bos') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-18 pr-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Role</label>
                      <BlockChoice
                        columns={3}
                        size="sm"
                        value={user.role}
                        onChange={(v) => handleRoleChange(user.uid, v as any)}
                        disabled={!isBos || user.email === 'alfathpulsa27@gmail.com'}
                        options={[
                          { value: 'karyawan', label: 'KARYAWAN' },
                          { value: 'mandor', label: 'MANDOR' },
                          { value: 'bos', label: 'BOS' },
                        ]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Penempatan Cabang</label>
                      <BlockChoice
                        columns={2}
                        size="sm"
                        value={user.branchId || ''}
                        onChange={(v) => handleBranchChange(user.uid, v)}
                        disabled={!isBos}
                        options={[
                          { value: '', label: user.role === 'bos' ? 'PUSAT (GLOBAL)' : 'TANPA CABANG' },
                          ...branches.map(b => ({ value: b.id, label: b.name.toUpperCase() })),
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">WhatsApp (Fonnte)</label>
                      <div className="flex items-center gap-3">
                        {editingPhone?.uid === user.uid ? (
                          <>
                            <input
                              type="text"
                              placeholder="62812345678"
                              className="flex-1 px-5 py-4 text-xs bg-asphalt-900 border border-brand-500/30 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-white font-black shadow-inner"
                              value={editingPhone.phone}
                              onChange={(e) => setEditingPhone({ ...editingPhone, phone: e.target.value.replace(/\D/g, '') })}
                              autoFocus
                            />
                            <button
                              onClick={() => handlePhoneChange(user.uid, editingPhone.phone)}
                              className="h-14 w-14 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg active:scale-90 flex items-center justify-center shrink-0"
                            >
                              <Check className="w-6 h-6 stroke-[3px]" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingPhone({ uid: user.uid, phone: user.phone || '' })}
                            className="flex-1 flex items-center justify-between px-5 py-4 bg-asphalt-900 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-asphalt-700 transition-all group border border-asphalt-700 shadow-inner"
                          >
                            <span className={user.phone ? 'text-white' : 'text-asphalt-text-400 italic'}>
                              {user.phone || 'BELUM DIATUR'}
                            </span>
                            <Phone className="w-4 h-4 text-asphalt-text-400 group-hover:text-brand-500 transition-colors" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.type === 'user' ? 'Hapus Anggota' : 'Hapus Cabang'}
        message={`Apakah Anda yakin ingin menghapus ${deleteConfirm.type === 'user' ? 'anggota' : 'cabang'} ${deleteConfirm.name}? Data yang dihapus tidak dapat dikembalikan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: 'user', id: '', name: '' })}
      />
    </div>

    {/* Reset Password Modal — portal to escape will-change:transform container */}
    {createPortal(
      <AnimatePresence>
        {resetPassModal && (
          <motion.div
            key="resetpw-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[500] flex items-end justify-center ios-backdrop ios-font pb-[env(safe-area-inset-bottom,0px)]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={() => !resetPassLoading && setResetPassModal(null)}
          >
            <motion.div
              key="resetpw-panel"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
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
                    <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[160px]">{resetPassModal?.userName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setResetPassModal(null)}
                  disabled={resetPassLoading}
                  className="w-9 h-9 flex items-center justify-center text-asphalt-text-400 hover:text-white rounded-xl border border-asphalt-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-asphalt-text-400 font-medium uppercase tracking-widest leading-relaxed px-1">
                Set password baru untuk karyawan ini. Password lama akan langsung diganti.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <input
                    type="text"
                    value={resetPassVal}
                    onChange={(e) => setResetPassVal(e.target.value)}
                    placeholder="Min. 4 karakter"
                    autoFocus
                    className="w-full px-4 py-3.5 text-sm bg-asphalt-900 border border-asphalt-700 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-white font-semibold shadow-inner"
                  />
                </div>

                {resetPassError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3">
                    <p className="text-[11px] text-rose-400 font-bold text-center">{resetPassError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetPassLoading || !resetPassVal.trim()}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  {resetPassLoading ? 'MENYIMPAN...' : 'RESET PASSWORD'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
  );
}
