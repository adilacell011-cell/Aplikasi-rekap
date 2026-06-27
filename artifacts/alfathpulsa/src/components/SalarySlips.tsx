import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { FileText, Plus, Trash2, Check, Clock, User, Calendar, CreditCard, ArrowLeft, Download, Send, Zap, Printer, X, BadgeCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../hooks/useFinanceStore';
import { SalarySlip, UserProfile } from '../types';
import { formatRupiah, formatNumberInput } from '../utils/formatters';
import { checkIsBos } from '../utils/authUtils';
import { ConfirmModal } from './ConfirmModal';
import { SuccessToast } from './SuccessToast';
import { iosAlert } from '../store/dialogStore';

export function SalarySlips() {
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, branchId: currentUserBranchId, isAuthLoaded } = useAuthStore();
  const { branches, getEmployeeDebtBalance, getEmployeeSavingBalance, addEmployeeBon, addEmployeeSaving } = useFinanceStore();
  
  const uid = user?.uid;
  const currentUserName = user?.displayName || 'Pengguna';
  
  const [isAdding, setIsAdding] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Slip gaji berhasil disimpan!');
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dailyRate, setDailyRate] = useState('');
  const [daysOff, setDaysOff] = useState('');
  const [bonus, setBonus] = useState('');
  const [deductions, setDeductions] = useState('');
  // Salary-time allocations against the employee's own bon & tabungan.
  const [debtPayment, setDebtPayment] = useState('');
  const [savingDeposit, setSavingDeposit] = useState('');
  const [savingWithdraw, setSavingWithdraw] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const [viewSlip, setViewSlip] = useState<SalarySlip | null>(null);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const value = e.target.value.replace(/\D/g, '');
    setter(value);
    
    // Explicitly set cursor to the end
    const target = e.target;
    requestAnimationFrame(() => {
      const len = target.value.length;
      target.setSelectionRange(len, len);
    });
  };

  const isBos = checkIsBos(user, role);
  // Only Bos can manage slips. Mandors and Karyawan only see their own.
  const canManageSlips = isBos;
  
  // Bos Pusat (Global) adalah Bos tanpa branchId
  const isGlobalBos = isBos && !currentUserBranchId;

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [showAllHistory, setShowAllHistory] = useState(false);

  const [batchMonth, setBatchMonth] = useState(new Date().getMonth() + 1);
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());

  const loadData = async () => {
    if (!uid) {
      setIsLoading(false);
      return;
    }
    try {
      const allSlips: SalarySlip[] = await api.get('/salary-slips');

      // Scope slips by role: Bos handles all (or branch), others see only their own.
      let scoped = allSlips;
      if (isBos) {
        if (!isGlobalBos) {
          scoped = allSlips.filter(s => s.branchId === currentUserBranchId);
        }
      } else {
        scoped = allSlips.filter(s => s.userId === uid);
      }

      // Filter by month/year if not "showAllHistory"
      let filtered = scoped;
      if (!showAllHistory) {
        filtered = scoped.filter(s => s.month === filterMonth && s.year === filterYear);
      }

      // Sort by year desc, then month desc
      const sortedData = [...filtered].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });
      setSlips(sortedData);

      // Bos also needs the user list to generate slips
      if (isBos) {
        const allUsers: UserProfile[] = await api.get('/users');
        const scopedUsers = isGlobalBos
          ? allUsers
          : allUsers.filter(u => u.branchId === currentUserBranchId);
        setUsers(scopedUsers.filter(u => u.role !== 'bos'));
      }
    } catch (error) {
      console.error('Error loading salary slips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded || !role) return;
    if (!uid) {
      setIsLoading(false);
      return;
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [isBos, isGlobalBos, currentUserBranchId, uid, isAuthLoaded, filterMonth, filterYear, showAllHistory]);

  // Auto-suggest daily rate when user selected (monthly base / 30, still editable)
  useEffect(() => {
    if (selectedUserId) {
      const selectedUser = users.find(u => u.uid === selectedUserId);
      if (selectedUser && selectedUser.baseSalary) {
        setDailyRate(String(Math.round(selectedUser.baseSalary / 30)));
      }
    }
  }, [selectedUserId, users]);

  // Auto-calculate potongan from hari libur (= hari libur x gaji per hari); still editable manually.
  // When hari libur is 0/empty, reset to 0 so no stale deduction lingers (bos can still type a manual amount after).
  useEffect(() => {
    const daily = parseInt(dailyRate.replace(/\D/g, ''), 10) || 0;
    const off = parseInt(daysOff.replace(/\D/g, ''), 10) || 0;
    setDeductions(off > 0 ? String(off * daily) : '0');
  }, [dailyRate, daysOff]);

  const handleBatchGenerate = async () => {
    if (!isBos || users.length === 0) return;
    setIsGeneratingBatch(true);
    
    try {
      let createdCount = 0;
      for (const targetUser of users) {
        // Cek apakah sudah ada slip untuk user ini di bulan/tahun ini
        const exists = slips.find(s => s.userId === targetUser.uid && s.month === batchMonth && s.year === batchYear);
        
        if (!exists) {
          const dim = daysInMonth(batchMonth, batchYear);
          const daily = Math.round((targetUser.baseSalary || 2000000) / 30);
          const salaryBase = daily * dim;
          const branch = branches.find(b => b.id === targetUser.branchId);
          
          await api.post('/salary-slips', {
            userId: targetUser.uid,
            userName: targetUser.name,
            role: targetUser.role,
            branchId: targetUser.branchId || null,
            branchName: branch?.name || null,
            month: batchMonth,
            year: batchYear,
            baseSalary: salaryBase,
            bonus: 0,
            deductions: 0,
            netSalary: salaryBase,
            dailyRate: daily,
            daysOff: 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: uid,
            createdByName: currentUserName
          });
          createdCount++;
        }
      }
      
      if (createdCount > 0) {
        setSuccessMessage("Makan sate di pinggir jalan, rasanya enak bikin ketagihan. Gajian masal sudah dijalankan, karyawan senang dapur pun aman! 🔥");
        setShowSuccess(true);
        await loadData();
      } else {
        iosAlert('Sudah Lengkap', 'Semua karyawan sudah punya slip gaji untuk bulan ini.');
      }
      setIsGeneratingBatch(false);
    } catch (error) {
      console.error("Error batch generating:", error);
      setIsGeneratingBatch(false);
    }
  };

  const handleAddSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !dailyRate || !uid) return;

    // Check for duplicate
    const existing = slips.find(s => s.userId === selectedUserId && s.month === month && s.year === year);
    if (existing) {
      iosAlert('Slip Sudah Ada', `Karyawan ini sudah punya slip gaji untuk periode ${getMonthName(month)} ${year}.`);
      return;
    }

    const userToSalary = users.find(u => u.uid === selectedUserId);
    if (!userToSalary) return;

    const dim = daysInMonth(month, year);
    const dailyVal = parseInt(dailyRate.replace(/\D/g, ''), 10) || 0;
    const offVal = parseInt(daysOff.replace(/\D/g, ''), 10) || 0;
    const baseVal = dailyVal * dim;
    const bonusVal = parseInt(bonus.replace(/\D/g, ''), 10) || 0;
    const dedVal = parseInt(deductions.replace(/\D/g, ''), 10) || 0;
    const netSalary = baseVal + bonusVal - dedVal;

    // Allocations: pay off bon, deposit/withdraw savings (distribution of net pay).
    const debtPayVal = parseInt(debtPayment.replace(/\D/g, ''), 10) || 0;
    const saveDepVal = parseInt(savingDeposit.replace(/\D/g, ''), 10) || 0;
    const saveWdVal = parseInt(savingWithdraw.replace(/\D/g, ''), 10) || 0;

    const empBon = getEmployeeDebtBalance(selectedUserId);
    const empSaving = getEmployeeSavingBalance(selectedUserId);
    if (debtPayVal > empBon) {
      iosAlert('Melebihi Sisa Kasbon', `Sisa kasbon ${userToSalary.name} hanya ${formatRupiah(empBon)}.`);
      return;
    }
    if (saveWdVal > empSaving) {
      iosAlert('Saldo Tabungan Kurang', `Saldo tabungan ${userToSalary.name} hanya ${formatRupiah(empSaving)}.`);
      return;
    }
    if (netSalary - debtPayVal - saveDepVal + saveWdVal < 0) {
      iosAlert('Alokasi Berlebih', 'Total bayar kasbon + tabung melebihi gaji bersih. Uang yang diterima tunai tidak boleh minus.');
      return;
    }

    const branch = branches.find(b => b.id === userToSalary.branchId);
    const bId = userToSalary.branchId || null;
    const periode = `${getMonthName(month)} ${year}`;

    try {
      await api.post('/salary-slips', {
        userId: userToSalary.uid,
        userName: userToSalary.name,
        role: userToSalary.role,
        branchId: userToSalary.branchId || null,
        branchName: branch?.name || null,
        month,
        year,
        baseSalary: baseVal,
        bonus: bonusVal,
        deductions: dedVal,
        netSalary,
        dailyRate: dailyVal,
        daysOff: offVal,
        debtPayment: debtPayVal,
        savingDeposit: saveDepVal,
        savingWithdraw: saveWdVal,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: uid,
        createdByName: currentUserName
      });

      // Apply the allocations to the employee's bon & tabungan ledgers.
      if (debtPayVal > 0) await addEmployeeBon(selectedUserId, userToSalary.name, bId, debtPayVal, `Potong gaji ${periode}`, 'pay');
      if (saveDepVal > 0) await addEmployeeSaving(selectedUserId, userToSalary.name, bId, saveDepVal, `Tabung dari gaji ${periode}`, 'deposit');
      if (saveWdVal > 0) await addEmployeeSaving(selectedUserId, userToSalary.name, bId, saveWdVal, `Tarik tabungan saat gajian ${periode}`, 'withdraw');

      setIsAdding(false);
      setSelectedUserId('');
      setDailyRate('');
      setDaysOff('');
      setBonus('0');
      setDeductions('0');
      setDebtPayment('');
      setSavingDeposit('');
      setSavingWithdraw('');
      setSuccessMessage("Buah manggis di atas peti, dimakan satu manis sekali. Slip gaji sudah rapi, tinggal bayar biar happy! 💰");
      setShowSuccess(true);
      await loadData();
    } catch (error) {
      console.error('Error adding salary slip:', error);
    }
  };

  const handleStatusChange = async (slipId: string, newStatus: 'paid') => {
    try {
      await api.patch(`/salary-slips/${slipId}`, {
        status: newStatus,
        paidAt: new Date().toISOString()
      });
      await loadData();
    } catch (error) {
      console.error('Error updating salary slip status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    
    if (deleteConfirm.id === 'ALL') {
      try {
        const allSlips: SalarySlip[] = await api.get('/salary-slips');
        const toDelete = isGlobalBos
          ? allSlips
          : allSlips.filter(s => s.branchId === currentUserBranchId);
        await Promise.all(toDelete.map(s => api.delete(`/salary-slips/${s.id}`)));
        setDeleteConfirm({ isOpen: false, id: '', name: '' });
        await loadData();
      } catch (error) {
        console.error('Error deleting all salary slips:', error);
      }
      return;
    }

    try {
      await api.delete(`/salary-slips/${deleteConfirm.id}`);
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      await loadData();
    } catch (error) {
      console.error('Error deleting salary slip:', error);
    }
  };

  const getMonthName = (m: number) => {
    return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2000, m - 1, 1));
  };

  // Live preview values for the "Buat Slip Gaji" form (daily-rate model)
  const formDim = daysInMonth(month, year);
  const formDaily = parseInt(dailyRate.replace(/\D/g, ''), 10) || 0;
  const formOff = parseInt(daysOff.replace(/\D/g, ''), 10) || 0;
  const formMonthlyBase = formDaily * formDim;
  const formBonus = parseInt(bonus.replace(/\D/g, ''), 10) || 0;
  const formDed = parseInt(deductions.replace(/\D/g, ''), 10) || 0;
  const formDebtPay = parseInt(debtPayment.replace(/\D/g, ''), 10) || 0;
  const formSaveDep = parseInt(savingDeposit.replace(/\D/g, ''), 10) || 0;
  const formSaveWd = parseInt(savingWithdraw.replace(/\D/g, ''), 10) || 0;
  const formNet = formMonthlyBase + formBonus - formDed;
  const formTakeHome = formNet - formDebtPay - formSaveDep + formSaveWd;
  const selEmpBon = selectedUserId ? getEmployeeDebtBalance(selectedUserId) : 0;
  const selEmpSaving = selectedUserId ? getEmployeeSavingBalance(selectedUserId) : 0;
  const hasAllocation = formDebtPay > 0 || formSaveDep > 0 || formSaveWd > 0;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 bg-asphalt-900 min-h-screen pb-40">
      {/* Mini Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-tight">Slip Gaji</h3>
            <p className="text-[10px] text-asphalt-text-400 font-bold uppercase tracking-widest">{slips.length} Tersedia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageSlips && slips.length > 0 && !isAdding && (
            <button
              onClick={() => setDeleteConfirm({ isOpen: true, id: 'ALL', name: 'SEMUA SLIP GAJI' })}
              className="px-3 py-2 bg-asphalt-800 text-rose-500 border border-asphalt-700/50 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-asphalt-700 transition-all"
            >
              BERSIHKAN
            </button>
          )}
          {canManageSlips && !isAdding && (
             <button
              onClick={() => setIsGeneratingBatch(!isGeneratingBatch)}
              disabled={isLoading || users.length === 0}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${
                isGeneratingBatch ? 'bg-amber-500 text-white shadow-amber-500/20' : 
                (users.length === 0 ? 'bg-asphalt-800 text-asphalt-text-400 border border-asphalt-700 cursor-not-allowed' : 'bg-asphalt-800 text-brand-500 border border-asphalt-700 shadow-brand-500/10')
              }`}
            >
              <Send className="w-4 h-4" />
              {users.length === 0 ? 'TIDAK ADA KARYAWAN' : 'GAJIAN MASAL'}
            </button>
          )}
          {canManageSlips && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              BUAT
            </button>
          )}
        </div>
      </div>

      {isBos && isGeneratingBatch && !isAdding && (
        <div className="bg-asphalt-800 rounded-[2.5rem] p-7 shadow-2xl border border-amber-500/30 animate-in fade-in slide-in-from-top duration-500">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-500" />
              Gajian Masal Karyawan
            </h3>
            <button onClick={() => setIsGeneratingBatch(false)} className="text-asphalt-text-400 p-2"><ArrowLeft className="w-5 h-5" /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Pilih Bulan</label>
              <select
                value={batchMonth}
                onChange={(e) => setBatchMonth(parseInt(e.target.value))}
                className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-white font-bold outline-none uppercase tracking-widest"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{getMonthName(m).toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Pilih Tahun</label>
              <select
                value={batchYear}
                onChange={(e) => setBatchYear(parseInt(e.target.value))}
                className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-white font-bold outline-none uppercase tracking-widest"
              >
                {[batchYear - 1, batchYear, batchYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[11px] text-asphalt-text-400 font-medium mb-6 px-1">
            Fitur ini akan membuat draf slip gaji untuk <span className="text-white font-bold">{users.length} karyawan</span> yang belum memiliki slip di bulan {getMonthName(batchMonth)} {batchYear}.
          </p>

          <button
            onClick={handleBatchGenerate}
            disabled={isLoading}
            className="w-full py-4.5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? 'MEMPROSES...' : '🔥 GENERATE SEMUA SLIP'}
          </button>
        </div>
      )}

      {isAdding && (
        <div className="bg-asphalt-800 rounded-[2.5rem] p-7 shadow-2xl border border-asphalt-700 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Buat Slip Gaji</h3>
            <button onClick={() => setIsAdding(false)} className="text-asphalt-text-400 p-2"><ArrowLeft className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleAddSlip} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Pilih Anggota</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none uppercase tracking-widest"
                >
                  <option value="">-- Pilih Karyawan/Mandor --</option>
                  {users.map(u => (
                    <option key={u.uid} value={u.uid}>{(u.name || 'TANPA NAMA').toUpperCase()} ({(u.role || 'ROLE').toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Bulan</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-white font-bold outline-none uppercase tracking-widest"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{getMonthName(m).toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Tahun</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-white font-bold outline-none uppercase tracking-widest"
                  >
                    {[year - 1, year, year + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Gaji Per Hari</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-asphalt-text-400 text-xs font-black">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full pl-12 pr-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-white font-black outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                    value={formatNumberInput(dailyRate)}
                    onChange={(e) => handleNumericInput(e, setDailyRate)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Hari Libur</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="w-full pl-5 pr-14 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-rose-500 font-black outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                      value={daysOff}
                      onChange={(e) => handleNumericInput(e, setDaysOff)}
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-asphalt-text-400 text-[10px] font-black uppercase tracking-widest">Hari</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Bonus</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-emerald-500 font-black outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                    value={formatNumberInput(bonus)}
                    onChange={(e) => handleNumericInput(e, setBonus)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Potongan (Otomatis Dari Hari Libur)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-rose-500 font-black outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                  value={formatNumberInput(deductions)}
                  onChange={(e) => handleNumericInput(e, setDeductions)}
                />
              </div>
            </div>

            {selectedUserId && (
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-asphalt-900/40 border border-rose-500/20 rounded-2xl p-3 shadow-inner">
                    <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest opacity-70">Sisa Kasbon</p>
                    <p className="text-sm font-black text-rose-500">{formatRupiah(selEmpBon)}</p>
                  </div>
                  <div className="flex-1 bg-asphalt-900/40 border border-brand-500/20 rounded-2xl p-3 shadow-inner">
                    <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest opacity-70">Saldo Tabungan</p>
                    <p className="text-sm font-black text-brand-500">{formatRupiah(selEmpSaving)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Bayar Kasbon</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-rose-500 font-black outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                      value={formatNumberInput(debtPayment)}
                      onChange={(e) => handleNumericInput(e, setDebtPayment)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Tabung (Setor)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-brand-500 font-black outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                      value={formatNumberInput(savingDeposit)}
                      onChange={(e) => handleNumericInput(e, setSavingDeposit)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Ambil Tabungan</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl text-sm text-brand-500 font-black outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                      value={formatNumberInput(savingWithdraw)}
                      onChange={(e) => handleNumericInput(e, setSavingWithdraw)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <div className="bg-asphalt-900/40 border border-asphalt-700 rounded-2xl p-4 shadow-inner space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-asphalt-text-400 uppercase tracking-widest">Jumlah Hari {getMonthName(month)} {year}</span>
                  <span className="text-[11px] font-black text-white">{formDim} Hari</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-asphalt-text-400 uppercase tracking-widest">Gaji Pokok Sebulan</span>
                  <span className="text-[11px] font-black text-white">{formatRupiah(formMonthlyBase)}</span>
                </div>
                {formOff > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-asphalt-text-400 uppercase tracking-widest">Potongan {formOff} Hari Libur</span>
                    <span className="text-[11px] font-black text-rose-500">- {formatRupiah(formOff * formDaily)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-asphalt-700/60">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{hasAllocation ? 'Gaji Bersih' : 'Estimasi Diterima'}</span>
                  <span className="text-sm font-black text-emerald-500">{formatRupiah(formNet)}</span>
                </div>
                {formDebtPay > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-asphalt-text-400 uppercase tracking-widest">Bayar Kasbon</span>
                    <span className="text-[11px] font-black text-rose-500">- {formatRupiah(formDebtPay)}</span>
                  </div>
                )}
                {formSaveDep > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-asphalt-text-400 uppercase tracking-widest">Tabung</span>
                    <span className="text-[11px] font-black text-brand-500">- {formatRupiah(formSaveDep)}</span>
                  </div>
                )}
                {formSaveWd > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-asphalt-text-400 uppercase tracking-widest">Ambil Tabungan</span>
                    <span className="text-[11px] font-black text-brand-500">+ {formatRupiah(formSaveWd)}</span>
                  </div>
                )}
                {hasAllocation && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-asphalt-700/60">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Diterima Tunai</span>
                    <span className={`text-base font-black ${formTakeHome < 0 ? 'text-rose-500' : 'text-brand-500'}`}>{formatRupiah(formTakeHome)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-4.5 bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-500/20"
              >
                SIMPAN SLIP GAJI
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slips List */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Riwayat Gaji</h3>
            </div>
            <button 
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="text-[9px] font-black text-brand-500 uppercase tracking-widest bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20"
            >
              {showAllHistory ? 'Tampilkan Berdasarkan Filter' : 'Tampilkan Semua'}
            </button>
          </div>

          {!showAllHistory && (
             <div className="bg-asphalt-800 p-4 rounded-2xl border border-asphalt-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex-1 space-y-1">
                <span className="text-[8px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Bulan</span>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                  className="w-full bg-asphalt-900 border border-asphalt-700/50 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none uppercase"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[8px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Tahun</span>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  className="w-full bg-asphalt-900 border border-asphalt-700/50 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none capitalize"
                >
                  {[filterYear - 1, filterYear, filterYear + 1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slips.length === 0 ? (
            <div className="col-span-full bg-asphalt-800 rounded-[2.5rem] p-10 text-center border border-asphalt-700/50">
              <FileText className="w-12 h-12 text-asphalt-900 mx-auto mb-4" />
              <p className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest">Belum ada slip gaji tersedia.</p>
            </div>
          ) : (
            slips.map((slip) => (
              <SlipCard 
                key={slip.id} 
                slip={slip} 
                getMonthName={getMonthName} 
                onView={() => setViewSlip(slip)} 
              />
            ))
          )}
        </div>
      </div>

      {viewSlip && (
        <SlipDocument
          slip={viewSlip}
          isBos={isBos}
          getMonthName={getMonthName}
          onClose={() => setViewSlip(null)}
          onPay={async () => { await handleStatusChange(viewSlip.id, 'paid'); setViewSlip(null); }}
          onDelete={() => {
            setDeleteConfirm({ isOpen: true, id: viewSlip.id, name: `${viewSlip.userName} (${getMonthName(viewSlip.month)})` });
            setViewSlip(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Hapus Slip Gaji"
        message={`Apakah Anda yakin ingin menghapus slip gaji ${deleteConfirm.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
      {showSuccess && <SuccessToast show={showSuccess} message={successMessage} onClose={() => setShowSuccess(false)} />}
    </div>
  );
}

function SlipCard({
  slip,
  getMonthName,
  onView,
}: {
  slip: SalarySlip,
  getMonthName: (m: number) => string,
  onView: () => void,
}) {
  const isPaid = slip.status === 'paid';

  return (
    <button
      onClick={onView}
      className="text-left w-full bg-asphalt-800 rounded-3xl border border-asphalt-700/50 shadow-xl overflow-hidden group active:scale-[0.98] transition-all"
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/10 shrink-0 ${
              isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {isPaid ? <Check className="w-5 h-5 stroke-[3px]" /> : <Clock className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{slip.userName || 'Karyawan'}</h4>
              <p className="text-[9px] text-asphalt-text-400 font-bold uppercase tracking-widest mt-0.5">
                {getMonthName(slip.month)} {slip.year}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border shrink-0 ${
            isPaid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            {isPaid ? 'LUNAS' : 'PENDING'}
          </span>
        </div>

        <div className="mt-4 bg-asphalt-900/40 p-4 rounded-2xl border border-asphalt-700 shadow-inner flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[7px] text-asphalt-text-400 uppercase font-black tracking-widest mb-1 opacity-60">Gaji Bersih Diterima</p>
            <p className="text-base font-black text-emerald-500 truncate">{formatRupiah(slip.netSalary)}</p>
          </div>
          <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest flex items-center gap-1 shrink-0">
            Lihat Slip <ArrowLeft className="w-3 h-3 rotate-180" />
          </span>
        </div>
      </div>
    </button>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black text-asphalt-text-400 uppercase tracking-widest mb-1 opacity-70">{label}</p>
      <p className="text-[11px] font-black text-white leading-tight break-words">{value}</p>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="px-4 pt-3 pb-2 bg-asphalt-800/50">
      <p className="text-[8px] font-black text-asphalt-text-400 uppercase tracking-[0.2em]">{title}</p>
    </div>
  );
}

function SlipRow({ label, value, valueClass, bold, last }: { label: string; value: string; valueClass?: string; bold?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 gap-3 ${last ? '' : 'border-b border-asphalt-700/40'} ${bold ? 'bg-asphalt-800/40' : ''}`}>
      <span className={`text-[10px] uppercase tracking-wide ${bold ? 'font-black text-white' : 'font-bold text-asphalt-text-400'}`}>{label}</span>
      <span className={`text-[11px] font-black text-right ${valueClass || 'text-white'}`}>{value}</span>
    </div>
  );
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function terbilang(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return 'Nol Rupiah';
  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const toWords = (x: number): string => {
    if (x < 12) return satuan[x];
    if (x < 20) return toWords(x - 10) + ' belas';
    if (x < 100) return toWords(Math.floor(x / 10)) + ' puluh' + (x % 10 ? ' ' + toWords(x % 10) : '');
    if (x < 200) return 'seratus' + (x - 100 ? ' ' + toWords(x - 100) : '');
    if (x < 1000) return toWords(Math.floor(x / 100)) + ' ratus' + (x % 100 ? ' ' + toWords(x % 100) : '');
    if (x < 2000) return 'seribu' + (x - 1000 ? ' ' + toWords(x - 1000) : '');
    if (x < 1_000_000) return toWords(Math.floor(x / 1000)) + ' ribu' + (x % 1000 ? ' ' + toWords(x % 1000) : '');
    if (x < 1_000_000_000) return toWords(Math.floor(x / 1_000_000)) + ' juta' + (x % 1_000_000 ? ' ' + toWords(x % 1_000_000) : '');
    if (x < 1_000_000_000_000) return toWords(Math.floor(x / 1_000_000_000)) + ' miliar' + (x % 1_000_000_000 ? ' ' + toWords(x % 1_000_000_000) : '');
    return toWords(Math.floor(x / 1_000_000_000_000)) + ' triliun' + (x % 1_000_000_000_000 ? ' ' + toWords(x % 1_000_000_000_000) : '');
  };
  const words = toWords(n).trim().replace(/\s+/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1) + ' Rupiah';
}

function SlipDocument({
  slip,
  isBos,
  getMonthName,
  onClose,
  onPay,
  onDelete,
}: {
  slip: SalarySlip,
  isBos: boolean,
  getMonthName: (m: number) => string,
  onClose: () => void,
  onPay: () => void | Promise<void>,
  onDelete: () => void,
}) {
  const isPaid = slip.status === 'paid';
  const [processing, setProcessing] = useState(false);
  const totalPendapatan = slip.baseSalary + slip.bonus;
  const dim = daysInMonth(slip.month, slip.year);
  const daily = slip.dailyRate && slip.dailyRate > 0 ? slip.dailyRate : (dim ? Math.round(slip.baseSalary / dim) : 0);
  const off = slip.daysOff && slip.daysOff > 0 ? slip.daysOff : (daily ? Math.round(slip.deductions / daily) : 0);
  const debtPay = slip.debtPayment || 0;
  const saveDep = slip.savingDeposit || 0;
  const saveWd = slip.savingWithdraw || 0;
  const hasAlloc = debtPay > 0 || saveDep > 0 || saveWd > 0;
  const takeHome = slip.netSalary - debtPay - saveDep + saveWd;
  const fmtDate = (iso?: string) =>
    iso ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso)) : '-';

  return (
    <div className="fixed inset-0 z-[110] ios-backdrop flex flex-col" onClick={onClose}>
      <div className="flex-1 overflow-y-auto px-4 py-6 flex items-start justify-center">
        <div
          className="slip-print-area w-full max-w-md bg-asphalt-800 rounded-[2rem] border border-asphalt-700 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-1.5 w-full bg-brand-500"></div>

          {/* Header */}
          <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="menu-tile w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="menu-tile-icon w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tighter leading-none">AlfathPulsa</h3>
                <p className="text-[8px] text-asphalt-text-400 font-bold uppercase tracking-[0.2em] mt-1">Agen BRILink &amp; Pulsa</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-brand-500 uppercase tracking-[0.2em]">Slip Gaji</p>
              <p className="text-[10px] font-black text-white uppercase tracking-tight mt-0.5">{getMonthName(slip.month)} {slip.year}</p>
            </div>
          </div>

          <div className="mx-6 border-t border-dashed border-asphalt-700"></div>

          {/* Employee meta */}
          <div className="px-6 py-5 grid grid-cols-2 gap-x-4 gap-y-4">
            <MetaItem label="Nama Karyawan" value={slip.userName || '-'} />
            <MetaItem label="Jabatan" value={(slip.role || '-').toUpperCase()} />
            <MetaItem label="Cabang" value={slip.branchName || 'Pusat'} />
            <MetaItem label="Periode" value={`${getMonthName(slip.month)} ${slip.year}`} />
          </div>

          {/* Earnings & deductions */}
          <div className="mx-6 rounded-2xl bg-asphalt-900/40 border border-asphalt-700 shadow-inner overflow-hidden">
            <SectionHead title="Pendapatan" />
            <SlipRow label="Gaji / Hari" value={formatRupiah(daily)} />
            <SlipRow label={`Jumlah Hari (${getMonthName(slip.month)})`} value={`${dim} hari`} />
            <SlipRow label="Gaji Pokok" value={formatRupiah(slip.baseSalary)} bold />
            <SlipRow label="Bonus / Tunjangan" value={`+ ${formatRupiah(slip.bonus)}`} valueClass="text-emerald-500" />
            <SlipRow label="Total Pendapatan" value={formatRupiah(totalPendapatan)} bold />
            <SectionHead title="Potongan" />
            <SlipRow label={off > 0 ? `Potongan (${off} hari libur)` : 'Potongan'} value={`- ${formatRupiah(slip.deductions)}`} valueClass="text-rose-500" last />
          </div>

          {/* Net pay */}
          <div className="mx-6 mt-5 rounded-2xl border-2 border-brand-500/30 bg-brand-500/5 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-black text-asphalt-text-400 uppercase tracking-[0.2em]">Gaji Bersih</p>
                <p className="text-[8px] font-bold text-asphalt-text-400 uppercase tracking-widest opacity-70">Take Home Pay</p>
              </div>
              <p className="text-xl font-black text-emerald-500 text-right">{formatRupiah(slip.netSalary)}</p>
            </div>
            <p className="mt-3 pt-3 border-t border-asphalt-700/60 text-[9px] font-bold text-asphalt-text-400 italic leading-relaxed">
              Terbilang: <span className="text-white not-italic font-black">{terbilang(slip.netSalary)}</span>
            </p>
          </div>

          {/* Alokasi gaji (kasbon & tabungan karyawan) */}
          {hasAlloc && (
            <div className="mx-6 mt-5 rounded-2xl bg-asphalt-900/40 border border-asphalt-700 shadow-inner overflow-hidden">
              <SectionHead title="Alokasi Gaji" />
              <SlipRow label="Gaji Bersih" value={formatRupiah(slip.netSalary)} bold />
              {debtPay > 0 && <SlipRow label="Bayar Kasbon" value={`- ${formatRupiah(debtPay)}`} valueClass="text-rose-500" />}
              {saveDep > 0 && <SlipRow label="Tabungan (Setor)" value={`- ${formatRupiah(saveDep)}`} valueClass="text-brand-500" />}
              {saveWd > 0 && <SlipRow label="Ambil Tabungan" value={`+ ${formatRupiah(saveWd)}`} valueClass="text-brand-500" />}
              <SlipRow label="Diterima Tunai" value={formatRupiah(takeHome)} bold last />
            </div>
          )}

          {/* Status */}
          <div className="px-6 py-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isPaid ? <BadgeCheck className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
              <span className={`text-[9px] font-black uppercase tracking-widest ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isPaid ? 'Lunas Dibayarkan' : 'Belum Dibayar'}
              </span>
            </div>
            <span className="text-[9px] font-bold text-asphalt-text-400 text-right">
              {isPaid ? `Dibayar ${fmtDate(slip.paidAt)}` : `Diterbitkan ${fmtDate(slip.createdAt)}`}
            </span>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="border-t border-dashed border-asphalt-700 pt-4">
              <p className="text-[8px] text-asphalt-text-400 font-medium leading-relaxed text-center">
                Slip gaji ini diterbitkan secara digital oleh <span className="font-black text-brand-500">AlfathPulsa</span> dan sah tanpa tanda tangan basah.
                {slip.createdByName ? <> Diproses oleh <span className="font-bold text-white">{slip.createdByName}</span>.</> : null}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="slip-no-print bg-asphalt-800/95 backdrop-blur border-t border-asphalt-700 px-4 py-3 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="px-4 py-3 rounded-2xl bg-asphalt-900 border border-asphalt-700 text-asphalt-text-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"
        >
          <X className="w-4 h-4" /> Tutup
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 px-4 py-3 rounded-2xl bg-asphalt-900 border border-asphalt-700 text-brand-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak / PDF
        </button>
        {isBos && !isPaid && (
          <button
            onClick={async () => { setProcessing(true); try { await onPay(); } finally { setProcessing(false); } }}
            disabled={processing}
            className="px-4 py-3 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3px]" /> {processing ? 'Memproses…' : 'Bayar'}
          </button>
        )}
        {isBos && (
          <button
            onClick={onDelete}
            disabled={processing}
            className="px-3 py-3 rounded-2xl bg-asphalt-900 border border-asphalt-700 text-rose-500 active:scale-95 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
