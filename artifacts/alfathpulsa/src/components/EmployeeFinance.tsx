import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Wallet, Receipt, PiggyBank, Plus, Minus, ArrowLeft, ArrowDownCircle,
  ArrowUpCircle, Trash2, ChevronDown, User as UserIcon, Users,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../hooks/useFinanceStore';
import { UserProfile } from '../types';
import { formatRupiah, formatNumberInput } from '../utils/formatters';
import { checkIsBos } from '../utils/authUtils';
import { SuccessToast } from './SuccessToast';
import { iosAlert, iosConfirm } from '../store/dialogStore';

type ActionKind = 'bon-add' | 'bon-pay' | 'save-deposit' | 'save-withdraw';

const ACTION_LABEL: Record<ActionKind, string> = {
  'bon-add': 'Tambah Kasbon',
  'bon-pay': 'Bayar Kasbon',
  'save-deposit': 'Setor Tabungan',
  'save-withdraw': 'Tarik Tabungan',
};

export function EmployeeFinance() {
  const { user, role, branchId: currentBranchId, isAuthLoaded } = useAuthStore();
  const {
    employeeDebts, employeeSavings,
    addEmployeeBon, addEmployeeSaving,
    deleteEmployeeBonDetail, deleteEmployeeSavingTransaction,
    getEmployeeDebtBalance, getEmployeeSavingBalance,
    getPersonTotalDebt, getPersonTotalSavings,
  } = useFinanceStore();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [action, setAction] = useState<{ userId: string; kind: ActionKind } | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isBos = checkIsBos(user, role);
  const isGlobalBos = isBos && !currentBranchId;
  const canManage = role === 'bos' || role === 'mandor';

  const loadUsers = async () => {
    try {
      const allUsers: UserProfile[] = await api.get('/users');
      const scoped = isGlobalBos ? allUsers : allUsers.filter(u => u.branchId === currentBranchId);
      setUsers(scoped.filter(u => u.role !== 'bos'));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded || !role) return;
    loadUsers();
    const interval = setInterval(loadUsers, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoaded, role, currentBranchId, isGlobalBos]);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value.replace(/\D/g, ''));
  };

  const openAction = (userId: string, kind: ActionKind) => {
    setAction({ userId, kind });
    setAmount('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action) return;
    const value = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    if (value <= 0) {
      iosAlert('Nominal Kosong', 'Masukkan nominal yang valid terlebih dahulu.');
      return;
    }
    const target = users.find(u => u.uid === action.userId);
    if (!target) return;

    const bonBalance = getEmployeeDebtBalance(action.userId);
    const saveBalance = getEmployeeSavingBalance(action.userId);

    if (action.kind === 'bon-pay' && value > bonBalance) {
      iosAlert('Melebihi Sisa Kasbon', `Sisa kasbon ${target.name} hanya ${formatRupiah(bonBalance)}.`);
      return;
    }
    if (action.kind === 'save-withdraw' && value > saveBalance) {
      iosAlert('Saldo Tidak Cukup', `Saldo tabungan ${target.name} hanya ${formatRupiah(saveBalance)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const bId = target.branchId || null;
      if (action.kind === 'bon-add') {
        await addEmployeeBon(action.userId, target.name, bId, value, description || 'Kasbon karyawan', 'add');
      } else if (action.kind === 'bon-pay') {
        await addEmployeeBon(action.userId, target.name, bId, value, description || 'Pembayaran kasbon', 'pay');
      } else if (action.kind === 'save-deposit') {
        await addEmployeeSaving(action.userId, target.name, bId, value, description || 'Setor tabungan', 'deposit');
      } else {
        await addEmployeeSaving(action.userId, target.name, bId, value, description || 'Tarik tabungan', 'withdraw');
      }
      setSuccessMessage(`${ACTION_LABEL[action.kind]} ${target.name} berhasil dicatat.`);
      setShowSuccess(true);
      setAction(null);
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting employee finance action:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (
    kind: 'bon' | 'save',
    personId: string,
    entryId: string,
  ) => {
    const ok = await iosConfirm({
      title: 'Hapus Catatan',
      message: 'Yakin ingin menghapus catatan ini? Saldo akan dihitung ulang.',
      confirmText: 'Hapus',
      confirmVariant: 'danger',
    });
    if (!ok) return;
    if (kind === 'bon') await deleteEmployeeBonDetail(personId, entryId);
    else await deleteEmployeeSavingTransaction(personId, entryId);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="p-8 text-center text-asphalt-text-400 text-xs font-bold uppercase tracking-widest">
        Halaman ini hanya untuk Bos & Mandor.
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 bg-asphalt-900 min-h-screen pb-40">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-500">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-tight">Kasbon &amp; Tabungan Karyawan</h3>
          <p className="text-[10px] text-asphalt-text-400 font-bold uppercase tracking-widest">{users.length} Karyawan</p>
        </div>
      </div>

      <p className="text-[11px] text-asphalt-text-400 font-medium px-1 leading-relaxed">
        Catatan kasbon (hutang) dan tabungan untuk karyawan, terpisah dari nasabah. Saldo di sini otomatis ikut terpotong saat membuat slip gaji.
      </p>

      {users.length === 0 ? (
        <div className="bg-asphalt-800 rounded-2xl py-10 px-4 text-center border border-asphalt-700/50">
          <Users className="w-12 h-12 text-asphalt-900 mx-auto mb-4" />
          <p className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest">Belum ada karyawan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => {
            const bon = getEmployeeDebtBalance(u.uid);
            const save = getEmployeeSavingBalance(u.uid);
            const debtRecord = employeeDebts.find(d => d.userId === u.uid);
            const saveRecord = employeeSavings.find(s => s.userId === u.uid);
            const expanded = expandedId === u.uid;

            const history = [
              ...(debtRecord?.details ?? []).map(d => ({
                id: d.id, kind: 'bon' as const, personId: debtRecord!.id,
                amount: Number(d.amount) || 0, description: d.description,
                isPositive: d.type === 'add', date: (d as any).date,
                label: d.type === 'add' ? 'Kasbon' : 'Bayar Kasbon',
              })),
              ...(saveRecord?.transactions ?? []).map(t => ({
                id: t.id, kind: 'save' as const, personId: saveRecord!.id,
                amount: Number(t.amount) || 0, description: t.description,
                isPositive: t.type === 'deposit', date: (t as any).date,
                label: t.type === 'deposit' ? 'Setor Tabungan' : 'Tarik Tabungan',
              })),
            ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

            return (
              <div key={u.uid} className="bg-asphalt-800 rounded-2xl border border-asphalt-700/50 shadow-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : u.uid)}
                  className="w-full p-5 flex items-center gap-3 text-left active:scale-[0.99] transition-all"
                >
                  <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{u.name || 'Tanpa Nama'}</h4>
                    <p className="text-[9px] text-asphalt-text-400 font-bold uppercase tracking-widest mt-0.5">{(u.role || 'role').toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-[7px] font-black text-rose-500 uppercase tracking-widest opacity-70">Kasbon</p>
                      <p className="text-[11px] font-black text-rose-500">{formatRupiah(bon)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] font-black text-brand-500 uppercase tracking-widest opacity-70">Tabungan</p>
                      <p className="text-[11px] font-black text-brand-500">{formatRupiah(save)}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-asphalt-text-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {expanded && (
                  <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <ActionBtn icon={<Plus className="w-4 h-4" />} label="Tambah Kasbon" color="rose" onClick={() => openAction(u.uid, 'bon-add')} />
                      <ActionBtn icon={<Minus className="w-4 h-4" />} label="Bayar Kasbon" color="rose" onClick={() => openAction(u.uid, 'bon-pay')} />
                      <ActionBtn icon={<ArrowDownCircle className="w-4 h-4" />} label="Setor Tabungan" color="brand" onClick={() => openAction(u.uid, 'save-deposit')} />
                      <ActionBtn icon={<ArrowUpCircle className="w-4 h-4" />} label="Tarik Tabungan" color="brand" onClick={() => openAction(u.uid, 'save-withdraw')} />
                    </div>

                    {/* Inline action form */}
                    {action && action.userId === u.uid && (
                      <form onSubmit={handleSubmit} className="bg-asphalt-900/50 border border-asphalt-700 rounded-2xl p-4 space-y-3 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{ACTION_LABEL[action.kind]}</span>
                          <button type="button" onClick={() => setAction(null)} className="text-asphalt-text-400 p-1"><ArrowLeft className="w-4 h-4" /></button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-asphalt-text-400 text-xs font-black">Rp</span>
                          <input
                            type="text" inputMode="numeric" autoFocus placeholder="0"
                            className="w-full pl-11 pr-4 py-3 bg-asphalt-900 border border-asphalt-700 rounded-xl text-sm text-white font-black outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                            value={formatNumberInput(amount)}
                            onChange={handleNumericInput}
                          />
                        </div>
                        <input
                          type="text" placeholder="Keterangan (opsional)"
                          className="w-full px-4 py-3 bg-asphalt-900 border border-asphalt-700 rounded-xl text-xs text-white font-bold outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <button
                          type="submit" disabled={submitting}
                          className="w-full py-3 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {submitting ? 'Menyimpan…' : 'Simpan'}
                        </button>
                      </form>
                    )}

                    {/* History */}
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-asphalt-text-400 uppercase tracking-[0.2em] px-1">Riwayat</p>
                      {history.length === 0 ? (
                        <p className="text-[10px] text-asphalt-text-400 font-bold px-1 py-2">Belum ada catatan.</p>
                      ) : (
                        history.map((h) => (
                          <div key={`${h.kind}-${h.id}`} className="flex items-center gap-3 bg-asphalt-900/40 border border-asphalt-700/60 rounded-xl px-3 py-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${h.kind === 'bon' ? 'bg-rose-500/10 text-rose-500' : 'bg-brand-500/10 text-brand-500'}`}>
                              {h.kind === 'bon' ? <Receipt className="w-3.5 h-3.5" /> : <PiggyBank className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-white truncate">{h.description || h.label}</p>
                              <p className="text-[8px] text-asphalt-text-400 font-bold uppercase tracking-widest">{h.label}</p>
                            </div>
                            <span className={`text-[11px] font-black shrink-0 ${h.isPositive ? (h.kind === 'bon' ? 'text-rose-500' : 'text-brand-500') : 'text-asphalt-text-400'}`}>
                              {h.isPositive ? '+' : '-'} {formatRupiah(h.amount)}
                            </span>
                            <button onClick={() => handleDeleteEntry(h.kind, h.personId, h.id)} className="text-rose-500 p-1 shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showSuccess && <SuccessToast show={showSuccess} message={successMessage} onClose={() => setShowSuccess(false)} />}
    </div>
  );
}

function ActionBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: 'rose' | 'brand'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border active:scale-95 transition-all ${
        color === 'rose'
          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          : 'bg-brand-500/10 text-brand-500 border-brand-500/20'
      }`}
    >
      {icon} {label}
    </button>
  );
}
