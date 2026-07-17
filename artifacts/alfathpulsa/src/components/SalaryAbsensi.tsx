import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import {
  FileText, Plus, Trash2, Check, Clock, Calendar, ArrowLeft,
  Zap, Printer, X, BadgeCheck, CalendarDays, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../hooks/useFinanceStore';
import { SalarySlip, UserProfile } from '../types';
import { formatRupiah, formatNumberInput } from '../utils/formatters';
import { checkIsBos } from '../utils/authUtils';
import { ConfirmModal } from './ConfirmModal';
import { SuccessToast } from './SuccessToast';
import { iosAlert } from '../store/dialogStore';
import { DropdownPicker } from './DropdownPicker';

// ─── Shared helpers ────────────────────────────────────────────────────────────
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

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAY_NAMES = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function getMonthName(m: number) {
  return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2000, m - 1, 1));
}

interface AttendanceRecord {
  id: string; userId: string; userName: string | null; branchId: string | null;
  date: string; status: 'libur' | 'izin'; notes: string | null;
  createdAt: string; createdBy: string | null; createdByName: string | null;
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function HorizontalEmployeePicker({ users, selectedId, onChange }: { users: UserProfile[]; selectedId: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
      {users.map(u => (
        <button
          key={u.uid}
          type="button"
          onClick={() => onChange(u.uid)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            selectedId === u.uid
              ? 'bg-[#7C8CFF] text-white shadow-lg shadow-[#7C8CFF]/30'
              : 'glass-sm text-white/70 hover:text-white'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
            selectedId === u.uid ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
          }`}>
            {(u.name || 'K')[0].toUpperCase()}
          </span>
          {u.name || 'Karyawan'}
        </button>
      ))}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[11px] font-black text-white leading-tight break-words">{value}</p>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="px-4 pt-3 pb-2 bg-white/5">
      <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">{title}</p>
    </div>
  );
}

function SlipRow({ label, value, valueClass, bold, last }: { label: string; value: string; valueClass?: string; bold?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 gap-3 ${last ? '' : 'border-b border-white/10'} ${bold ? 'bg-white/5' : ''}`}>
      <span className={`text-[10px] uppercase tracking-wide ${bold ? 'font-black text-white' : 'font-bold text-white/55'}`}>{label}</span>
      <span className={`text-[11px] font-black text-right ${valueClass || 'text-white'}`}>{value}</span>
    </div>
  );
}

function SlipCard({ slip, onView }: { slip: SalarySlip; onView: () => void }) {
  const isPaid = slip.status === 'paid';
  return (
    <button
      onClick={onView}
      className="text-left w-full glass-card rounded-3xl overflow-hidden group active:scale-[0.98] transition-all"
      style={{ borderRadius: '1.5rem' }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/10 shrink-0 ${
              isPaid ? 'bg-[#4ADE9A]/10 text-[#4ADE9A]' : 'bg-[#FFB020]/10 text-[#FFB020]'
            }`}>
              {isPaid ? <Check className="w-5 h-5 stroke-[3px]" /> : <Clock className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{slip.userName || 'Karyawan'}</h4>
              <p className="text-[9px] text-white/55 font-bold uppercase tracking-widest mt-0.5">
                {getMonthName(slip.month)} {slip.year}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border shrink-0 ${
            isPaid ? 'bg-[#4ADE9A]/10 text-[#4ADE9A] border-[#4ADE9A]/20' : 'bg-[#FFB020]/10 text-[#FFB020] border-[#FFB020]/20'
          }`}>
            {isPaid ? 'LUNAS' : 'PENDING'}
          </span>
        </div>
        <div className="mt-4 bg-white/8 p-4 rounded-2xl border border-white/10 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[7px] text-white/50 uppercase font-black tracking-widest mb-1">Gaji Bersih Diterima</p>
            <p className="text-base font-black text-[#4ADE9A] truncate">{formatRupiah(slip.netSalary)}</p>
          </div>
          <span className="text-[8px] font-black text-[#7C8CFF] uppercase tracking-widest flex items-center gap-1 shrink-0">
            Lihat Slip <ArrowLeft className="w-3 h-3 rotate-180" />
          </span>
        </div>
      </div>
    </button>
  );
}

function SlipDocument({ slip, isBos, onClose, onPay, onDelete }: {
  slip: SalarySlip; isBos: boolean; onClose: () => void;
  onPay: () => void | Promise<void>; onDelete: () => void;
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

  return createPortal(
    <div className="fixed inset-0 z-[110] ios-backdrop flex flex-col" onClick={onClose}>
      <div className="flex-1 overflow-y-auto px-4 py-6 flex items-start justify-center">
        <div
          className="slip-print-area w-full max-w-md glass-card-strong rounded-[2rem] overflow-hidden animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
          style={{ borderRadius: '2rem' }}
        >
          <div className="h-1.5 w-full bg-[#7C8CFF]"></div>

          <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="menu-tile w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="menu-tile-icon w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tighter leading-none">AlfathPulsa</h3>
                <p className="text-[8px] text-white/50 font-bold uppercase tracking-[0.2em] mt-1">Agen BRILink &amp; Pulsa</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-[#7C8CFF] uppercase tracking-[0.2em]">Slip Gaji</p>
              <p className="text-[10px] font-black text-white uppercase tracking-tight mt-0.5">{getMonthName(slip.month)} {slip.year}</p>
            </div>
          </div>

          <div className="mx-6 border-t border-dashed border-white/15"></div>

          <div className="px-6 py-5 grid grid-cols-2 gap-x-4 gap-y-4">
            <MetaItem label="Nama Karyawan" value={slip.userName || '-'} />
            <MetaItem label="Jabatan" value={(slip.role || '-').toUpperCase()} />
            <MetaItem label="Cabang" value={slip.branchName || 'Pusat'} />
            <MetaItem label="Periode" value={`${getMonthName(slip.month)} ${slip.year}`} />
          </div>

          <div className="mx-6 rounded-2xl bg-white/8 border border-white/12 overflow-hidden">
            <SectionHead title="Pendapatan" />
            <SlipRow label={`Jumlah Hari (${getMonthName(slip.month)})`} value={`${dim} hari`} />
            <SlipRow label="Gaji Pokok" value={formatRupiah(slip.baseSalary)} bold />
            <SlipRow label="Bonus / Tunjangan" value={`+ ${formatRupiah(slip.bonus)}`} valueClass="text-[#4ADE9A]" />
            <SlipRow label="Total Pendapatan" value={formatRupiah(totalPendapatan)} bold />
            <SectionHead title="Potongan" />
            <SlipRow label={off > 0 ? `Potongan (${off} hari libur)` : 'Potongan'} value={`- ${formatRupiah(slip.deductions)}`} valueClass="text-rose-400" last />
          </div>

          <div className="mx-6 mt-5 rounded-2xl border-2 border-[#7C8CFF]/30 bg-[#7C8CFF]/8 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">Gaji Bersih</p>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Take Home Pay</p>
              </div>
              <p className="text-xl font-black text-[#4ADE9A] text-right">{formatRupiah(slip.netSalary)}</p>
            </div>
            <p className="mt-3 pt-3 border-t border-white/10 text-[9px] font-bold text-white/50 italic leading-relaxed">
              Terbilang: <span className="text-white not-italic font-black">{terbilang(slip.netSalary)}</span>
            </p>
          </div>

          {hasAlloc && (
            <div className="mx-6 mt-5 rounded-2xl bg-white/8 border border-white/12 overflow-hidden">
              <SectionHead title="Alokasi Gaji" />
              <SlipRow label="Gaji Bersih" value={formatRupiah(slip.netSalary)} bold />
              {debtPay > 0 && <SlipRow label="Bayar Kasbon" value={`- ${formatRupiah(debtPay)}`} valueClass="text-rose-400" />}
              {saveDep > 0 && <SlipRow label="Tabungan (Setor)" value={`- ${formatRupiah(saveDep)}`} valueClass="text-[#7C8CFF]" />}
              {saveWd > 0 && <SlipRow label="Ambil Tabungan" value={`+ ${formatRupiah(saveWd)}`} valueClass="text-[#7C8CFF]" />}
              <SlipRow label="Diterima Tunai" value={formatRupiah(takeHome)} bold last />
            </div>
          )}

          <div className="px-6 py-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isPaid ? <BadgeCheck className="w-4 h-4 text-[#4ADE9A]" /> : <Clock className="w-4 h-4 text-[#FFB020]" />}
              <span className={`text-[9px] font-black uppercase tracking-widest ${isPaid ? 'text-[#4ADE9A]' : 'text-[#FFB020]'}`}>
                {isPaid ? 'Lunas Dibayarkan' : 'Belum Dibayar'}
              </span>
            </div>
            <span className="text-[9px] font-bold text-white/50 text-right">
              {isPaid ? `Dibayar ${fmtDate(slip.paidAt)}` : `Diterbitkan ${fmtDate(slip.createdAt)}`}
            </span>
          </div>

          <div className="px-6 pb-6">
            <div className="border-t border-dashed border-white/15 pt-4">
              <p className="text-[8px] text-white/40 font-medium leading-relaxed text-center">
                Slip gaji ini diterbitkan secara digital oleh <span className="font-black text-[#7C8CFF]">AlfathPulsa</span> dan sah tanpa tanda tangan basah.
                {slip.createdByName ? <> Diproses oleh <span className="font-bold text-white">{slip.createdByName}</span>.</> : null}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="slip-no-print glass-nav px-4 py-3 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="px-4 py-3 rounded-2xl glass-sm text-white/70 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"
        >
          <X className="w-4 h-4" /> Tutup
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 px-4 py-3 rounded-2xl glass-sm text-[#7C8CFF] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak / PDF
        </button>
        {isBos && !isPaid && (
          <button
            onClick={async () => { setProcessing(true); try { await onPay(); } finally { setProcessing(false); } }}
            disabled={processing}
            className="px-4 py-3 rounded-2xl bg-[#7C8CFF] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#7C8CFF]/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3px]" /> {processing ? 'Memproses…' : 'Bayar'}
          </button>
        )}
        {isBos && (
          <button onClick={onDelete} disabled={processing}
            className="px-3 py-3 rounded-2xl glass-sm text-rose-400 active:scale-95 transition-all disabled:opacity-50">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Salary Tab ───────────────────────────────────────────────────────────────
function SalaryTab() {
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, branchId: currentUserBranchId, isAuthLoaded } = useAuthStore();
  const { branches, getEmployeeDebtBalance, getEmployeeSavingBalance, addEmployeeBon, addEmployeeSaving } = useFinanceStore();

  const uid = user?.uid;
  const currentUserName = user?.displayName || 'Pengguna';
  const isBos = checkIsBos(user, role);
  const canManageSlips = isBos;
  const isGlobalBos = isBos && !currentUserBranchId;

  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Slip gaji berhasil disimpan!');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dailyRate, setDailyRate] = useState('');
  const [daysOff, setDaysOff] = useState('');
  const [bonus, setBonus] = useState('');
  const [deductions, setDeductions] = useState('');
  const [debtPayment, setDebtPayment] = useState('');
  const [savingDeposit, setSavingDeposit] = useState('');
  const [savingWithdraw, setSavingWithdraw] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [viewSlip, setViewSlip] = useState<SalarySlip | null>(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [showAllHistory, setShowAllHistory] = useState(false);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const value = e.target.value.replace(/\D/g, '');
    setter(value);
    const target = e.target;
    requestAnimationFrame(() => { const len = target.value.length; target.setSelectionRange(len, len); });
  };

  const loadData = async () => {
    if (!uid) { setIsLoading(false); return; }
    try {
      // Fetch slips + users secara paralel agar lebih cepat
      const [allSlips, allUsers] = await Promise.all([
        api.get('/salary-slips') as Promise<SalarySlip[]>,
        isBos ? (api.get('/users') as Promise<UserProfile[]>) : Promise.resolve([] as UserProfile[]),
      ]);

      let scoped: SalarySlip[];
      if (isBos) {
        // Scope daftar karyawan berdasarkan cabang aktif mandor/bos
        const usersInScope = isGlobalBos
          ? allUsers.filter(u => u.role !== 'bos')
          : allUsers.filter(u => u.branchId === currentUserBranchId && u.role !== 'bos');
        setUsers(usersInScope);

        if (isGlobalBos) {
          scoped = allSlips;
        } else {
          // Filter slip by userId karyawan yang SAAT INI ada di cabang ini,
          // bukan by branchId yang tersimpan di slip (menghindari data hilang
          // saat mandor ganti cabang atau karyawan dipindah).
          const branchUserIds = new Set(usersInScope.map(u => u.uid));
          scoped = allSlips.filter(s => branchUserIds.has(s.userId));
        }
      } else {
        // Karyawan/mandor melihat slip diri sendiri
        scoped = allSlips.filter(s => s.userId === uid);
      }

      const filtered = showAllHistory
        ? scoped
        : scoped.filter(s => s.month === filterMonth && s.year === filterYear);

      const sortedData = [...filtered].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });
      setSlips(sortedData);
    } catch (error) {
      console.error('Error loading salary slips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded || !role) return;
    if (!uid) { setIsLoading(false); return; }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [isBos, isGlobalBos, currentUserBranchId, uid, isAuthLoaded, filterMonth, filterYear, showAllHistory]);

  useEffect(() => {
    if (!selectedUserId) return;
    api.get(`/attendance?userId=${selectedUserId}&month=${month}&year=${year}`)
      .then((records: { status: string }[]) => {
        const offCount = records.filter(r => r.status === 'libur' || r.status === 'izin').length;
        setDaysOff(offCount > 0 ? String(offCount) : '0');
      }).catch(() => {});
  }, [selectedUserId, month, year]);

  useEffect(() => {
    const daily = parseInt(dailyRate.replace(/\D/g, ''), 10) || 0;
    const off = parseInt(daysOff.replace(/\D/g, ''), 10) || 0;
    setDeductions(off > 0 ? String(off * daily) : '0');
  }, [dailyRate, daysOff]);

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

  const handleAddSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      await iosAlert('Pilih Anggota', 'Silakan pilih dulu anggota yang akan dibuatkan slip gaji.');
      return;
    }
    if (!dailyRate || !uid) return;

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

    const debtPayVal = parseInt(debtPayment.replace(/\D/g, ''), 10) || 0;
    const saveDepVal = parseInt(savingDeposit.replace(/\D/g, ''), 10) || 0;
    const saveWdVal = parseInt(savingWithdraw.replace(/\D/g, ''), 10) || 0;

    const empBon = getEmployeeDebtBalance(selectedUserId);
    const empSaving = getEmployeeSavingBalance(selectedUserId);
    if (debtPayVal > empBon) { iosAlert('Melebihi Sisa Kasbon', `Sisa kasbon ${userToSalary.name} hanya ${formatRupiah(empBon)}.`); return; }
    if (saveWdVal > empSaving) { iosAlert('Saldo Tabungan Kurang', `Saldo tabungan ${userToSalary.name} hanya ${formatRupiah(empSaving)}.`); return; }
    if (netSalary - debtPayVal - saveDepVal + saveWdVal < 0) { iosAlert('Alokasi Berlebih', 'Total bayar kasbon + tabung melebihi gaji bersih.'); return; }

    const branch = branches.find(b => b.id === userToSalary.branchId);
    const bId = userToSalary.branchId || null;
    const periode = `${getMonthName(month)} ${year}`;

    try {
      await api.post('/salary-slips', {
        userId: userToSalary.uid, userName: userToSalary.name, role: userToSalary.role,
        branchId: userToSalary.branchId || null, branchName: branch?.name || null,
        month, year, baseSalary: baseVal, bonus: bonusVal, deductions: dedVal, netSalary,
        dailyRate: dailyVal, daysOff: offVal, debtPayment: debtPayVal, savingDeposit: saveDepVal,
        savingWithdraw: saveWdVal, status: 'pending', createdAt: new Date().toISOString(),
        createdBy: uid, createdByName: currentUserName,
      });

      if (debtPayVal > 0) await addEmployeeBon(selectedUserId, userToSalary.name, bId, debtPayVal, `Potong gaji ${periode}`, 'pay');
      if (saveDepVal > 0) await addEmployeeSaving(selectedUserId, userToSalary.name, bId, saveDepVal, `Tabung dari gaji ${periode}`, 'deposit');
      if (saveWdVal > 0) await addEmployeeSaving(selectedUserId, userToSalary.name, bId, saveWdVal, `Tarik tabungan saat gajian ${periode}`, 'withdraw');

      setIsAdding(false);
      setSelectedUserId(''); setDailyRate(''); setDaysOff(''); setBonus('0'); setDeductions('0');
      setDebtPayment(''); setSavingDeposit(''); setSavingWithdraw('');
      setSuccessMessage("Buah manggis di atas peti, dimakan satu manis sekali. Slip gaji sudah rapi, tinggal bayar biar happy! 💰");
      setShowSuccess(true);
      await loadData();
    } catch (error) { console.error('Error adding salary slip:', error); }
  };

  const handleStatusChange = async (slipId: string, newStatus: 'paid') => {
    try { await api.patch(`/salary-slips/${slipId}`, { status: newStatus, paidAt: new Date().toISOString() }); await loadData(); }
    catch (error) { console.error('Error updating salary slip status:', error); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    if (deleteConfirm.id === 'ALL') {
      try {
        const allSlips: SalarySlip[] = await api.get('/salary-slips');
        const toDelete = isGlobalBos ? allSlips : allSlips.filter(s => s.branchId === currentUserBranchId);
        await Promise.all(toDelete.map(s => api.delete(`/salary-slips/${s.id}`)));
        setDeleteConfirm({ isOpen: false, id: '', name: '' }); await loadData();
      } catch (error) { console.error('Error deleting all salary slips:', error); }
      return;
    }
    try {
      await api.delete(`/salary-slips/${deleteConfirm.id}`);
      setDeleteConfirm({ isOpen: false, id: '', name: '' }); await loadData();
    } catch (error) { console.error('Error deleting salary slip:', error); }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C8CFF]"></div></div>;
  }

  return (
    <div className="p-5 space-y-6 min-h-screen pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C8CFF]/10 flex items-center justify-center border border-[#7C8CFF]/20 text-[#7C8CFF]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-tight">Slip Gaji</h3>
            <p className="text-[10px] text-white/55 font-bold uppercase tracking-widest">{slips.length} Tersedia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageSlips && slips.length > 0 && !isAdding && (
            <button onClick={() => setDeleteConfirm({ isOpen: true, id: 'ALL', name: 'SEMUA SLIP GAJI' })}
              className="px-3 py-2 glass-sm text-rose-400 text-[8px] font-black uppercase tracking-widest transition-all">
              BERSIHKAN
            </button>
          )}
          {canManageSlips && !isAdding && (
            <button onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-[#7C8CFF] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6070F0] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#7C8CFF]/20">
              <Plus className="w-4 h-4 stroke-[3px]" /> BUAT
            </button>
          )}
        </div>
      </div>

      {/* Form buat slip gaji */}
      {isAdding && (
        <div className="glass-card p-5 animate-in slide-in-from-bottom duration-500" style={{ borderRadius: '1.5rem' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Buat Slip Gaji</h3>
            <button onClick={() => setIsAdding(false)} className="text-white/50 p-2 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleAddSlip} className="space-y-6">
            {/* Pilih Anggota — horizontal chips */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">Pilih Anggota</label>
              {users.length === 0
                ? <p className="text-xs text-white/40 px-1">Belum ada karyawan terdaftar.</p>
                : <HorizontalEmployeePicker users={users} selectedId={selectedUserId} onChange={setSelectedUserId} />
              }
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">Bulan</label>
                <DropdownPicker value={String(month)} onChange={(v) => setMonth(parseInt(v))}
                  options={Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({ value: String(m), label: getMonthName(m).toUpperCase() }))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">Tahun</label>
                <DropdownPicker value={String(year)} onChange={(v) => setYear(parseInt(v))}
                  options={[year - 1, year, year + 1].map(y => ({ value: String(y), label: String(y) }))} />
              </div>
            </div>

            {/* Editable fields — solid accent border */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">Gaji Per Hari</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 text-xs font-black">Rp</span>
                <input type="text" inputMode="numeric" placeholder="0"
                  className="w-full pl-12 pr-5 py-3 rounded-2xl text-sm text-white font-black outline-none shadow-inner"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid #7C8CFF' }}
                  value={formatNumberInput(dailyRate)} onChange={(e) => handleNumericInput(e, setDailyRate)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">Hari Libur</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="0"
                    className="w-full pl-5 pr-14 py-3 rounded-2xl text-sm text-rose-400 font-black outline-none shadow-inner"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid #7C8CFF' }}
                    value={daysOff} onChange={(e) => handleNumericInput(e, setDaysOff)} />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 text-[10px] font-black uppercase tracking-widest">Hari</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">Bonus</label>
                <input type="text" inputMode="numeric"
                  className="w-full px-5 py-3 rounded-2xl text-sm text-[#4ADE9A] font-black outline-none shadow-inner"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid #7C8CFF' }}
                  value={formatNumberInput(bonus)} onChange={(e) => handleNumericInput(e, setBonus)} />
              </div>
            </div>

            {/* Read-only field — dashed border + lock label */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">🔒 Potongan (Otomatis Dari Hari Libur)</label>
              <input type="text" inputMode="numeric" readOnly
                className="w-full px-5 py-3 rounded-2xl text-sm text-rose-400 font-black outline-none cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.25)', color: 'rgba(252,165,165,0.85)' }}
                value={formatNumberInput(deductions)} onChange={(e) => handleNumericInput(e, setDeductions)} />
            </div>

            {/* Employee allocations */}
            {selectedUserId && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-rose-500/8 border border-rose-500/20 rounded-2xl p-3">
                    <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest opacity-70">Sisa Kasbon</p>
                    <p className="text-sm font-black text-rose-400">{formatRupiah(selEmpBon)}</p>
                  </div>
                  <div className="flex-1 bg-[#7C8CFF]/8 border border-[#7C8CFF]/20 rounded-2xl p-3">
                    <p className="text-[8px] font-black text-[#7C8CFF] uppercase tracking-widest opacity-70">Saldo Tabungan</p>
                    <p className="text-sm font-black text-[#7C8CFF]">{formatRupiah(selEmpSaving)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Bayar Kasbon', value: debtPayment, setter: setDebtPayment, color: 'text-rose-400' },
                    { label: 'Tabung (Setor)', value: savingDeposit, setter: setSavingDeposit, color: 'text-[#7C8CFF]' },
                    { label: 'Ambil Tabungan', value: savingWithdraw, setter: setSavingWithdraw, color: 'text-[#7C8CFF]' },
                  ].map(({ label, value, setter, color }) => (
                    <div key={label} className="space-y-2">
                      <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">{label}</label>
                      <input type="text" inputMode="numeric" placeholder="0"
                        className={`w-full px-5 py-3 rounded-2xl text-sm font-black outline-none shadow-inner ${color}`}
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(124,140,255,0.4)' }}
                        value={formatNumberInput(value)} onChange={(e) => handleNumericInput(e, setter)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimasi Diterima — most prominent */}
            <div className="glass-card-strong p-5 space-y-2.5" style={{ borderRadius: '1.25rem' }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/55 uppercase tracking-widest">Jumlah Hari {getMonthName(month)} {year}</span>
                <span className="text-[11px] font-black text-white">{formDim} Hari</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/55 uppercase tracking-widest">Gaji Pokok Sebulan</span>
                <span className="text-[11px] font-black text-white">{formatRupiah(formMonthlyBase)}</span>
              </div>
              {formOff > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-white/55 uppercase tracking-widest">Potongan {formOff} Hari Libur</span>
                  <span className="text-[11px] font-black text-rose-400">- {formatRupiah(formOff * formDaily)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-white/15">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{hasAllocation ? 'Gaji Bersih' : 'Estimasi Diterima'}</span>
                <span className="text-base font-black text-[#4ADE9A]">{formatRupiah(formNet)}</span>
              </div>
              {formDebtPay > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-white/55 uppercase tracking-widest">Bayar Kasbon</span>
                  <span className="text-[11px] font-black text-rose-400">- {formatRupiah(formDebtPay)}</span>
                </div>
              )}
              {formSaveDep > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-white/55 uppercase tracking-widest">Tabung</span>
                  <span className="text-[11px] font-black text-[#7C8CFF]">- {formatRupiah(formSaveDep)}</span>
                </div>
              )}
              {formSaveWd > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-white/55 uppercase tracking-widest">Ambil Tabungan</span>
                  <span className="text-[11px] font-black text-[#7C8CFF]">+ {formatRupiah(formSaveWd)}</span>
                </div>
              )}
              {hasAllocation && (
                <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-white/15">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Diterima Tunai</span>
                  <span className={`text-2xl font-black ${formTakeHome < 0 ? 'text-rose-400' : 'text-white'}`}>{formatRupiah(formTakeHome)}</span>
                </div>
              )}
            </div>

            {/* Submit button — inside form, full-width at bottom of card */}
            <button
              type="submit"
              className="w-full py-4 bg-[#7C8CFF] hover:bg-[#6070F0] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#7C8CFF]/30"
            >
              SIMPAN SLIP GAJI
            </button>
          </form>
        </div>
      )}

      {/* Slips list */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#7C8CFF]" />
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Riwayat Gaji</h3>
            </div>
            <button onClick={() => setShowAllHistory(!showAllHistory)}
              className="text-[9px] font-black text-[#7C8CFF] uppercase tracking-widest bg-[#7C8CFF]/10 px-3 py-1.5 rounded-lg border border-[#7C8CFF]/20">
              {showAllHistory ? 'Filter Bulan' : 'Semua'}
            </button>
          </div>

          {!showAllHistory && (
            <div className="glass-card p-4 space-y-4 animate-in fade-in slide-in-from-top-1" style={{ borderRadius: '1rem' }}>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-white/55 uppercase tracking-widest ml-1">Bulan</span>
                <DropdownPicker value={String(filterMonth)} onChange={(v) => setFilterMonth(parseInt(v))}
                  options={Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({ value: String(m), label: getMonthName(m) }))} />
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-white/55 uppercase tracking-widest ml-1">Tahun</span>
                <DropdownPicker value={String(filterYear)} onChange={(v) => setFilterYear(parseInt(v))}
                  options={[filterYear - 1, filterYear, filterYear + 1].map(y => ({ value: String(y), label: String(y) }))} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slips.length === 0 ? (
            <div className="col-span-full glass-card py-8 px-4 text-center" style={{ borderRadius: '1.5rem' }}>
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Belum ada slip gaji tersedia.</p>
            </div>
          ) : slips.map((slip) => (
            <SlipCard key={slip.id} slip={slip} onView={() => setViewSlip(slip)} />
          ))}
        </div>
      </div>

      {viewSlip && (
        <SlipDocument slip={viewSlip} isBos={isBos} onClose={() => setViewSlip(null)}
          onPay={async () => { await handleStatusChange(viewSlip.id, 'paid'); setViewSlip(null); }}
          onDelete={() => { setDeleteConfirm({ isOpen: true, id: viewSlip.id, name: `${viewSlip.userName} (${getMonthName(viewSlip.month)})` }); setViewSlip(null); }} />
      )}

      <ConfirmModal isOpen={deleteConfirm.isOpen} title="Hapus Slip Gaji"
        message={`Apakah Anda yakin ingin menghapus slip gaji ${deleteConfirm.name}?`}
        onConfirm={handleDelete} onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })} />
      {showSuccess && <SuccessToast show={showSuccess} message={successMessage} onClose={() => setShowSuccess(false)} />}
    </div>
  );
}

// ─── Absensi Tab ──────────────────────────────────────────────────────────────
function AbsensiTab() {
  const { user, role, branchId: currentBranchId, isAuthLoaded } = useAuthStore();
  const uid = user?.uid;
  const isBos = checkIsBos(user, role);
  const canManage = isBos;
  const isGlobalBos = isBos && !currentBranchId;

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isAuthLoaded || !canManage) return;
    api.get('/users').then((all: UserProfile[]) => {
      const scoped = isGlobalBos ? all : all.filter(u => u.branchId === currentBranchId);
      const staff = scoped.filter(u => u.role !== 'bos');
      setUsers(staff);
      if (staff.length > 0 && !selectedUserId) setSelectedUserId(staff[0].uid);
    }).catch(console.error);
  }, [isAuthLoaded, canManage, isGlobalBos, currentBranchId]);

  const loadRecords = useCallback(async () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    try {
      const data: AttendanceRecord[] = await api.get(`/attendance?userId=${selectedUserId}&month=${month}&year=${year}`);
      setRecords(data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [selectedUserId, month, year]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const getRecordForDate = (dateStr: string) => records.find(r => r.date === dateStr) ?? null;

  const handleToggle = async (dateStr: string, status: 'libur' | 'izin') => {
    if (!canManage || !selectedUserId || toggling) return;
    setToggling(dateStr);
    const existing = getRecordForDate(dateStr);
    try {
      if (existing) {
        if (existing.status === status) await api.delete(`/attendance/${existing.id}`);
        else await api.patch(`/attendance/${existing.id}`, { status });
      } else {
        const selectedUser = users.find(u => u.uid === selectedUserId);
        await api.post('/attendance', {
          userId: selectedUserId, userName: selectedUser?.name ?? null,
          branchId: selectedUser?.branchId ?? null, date: dateStr, status,
          createdBy: uid, createdByName: user?.displayName ?? null,
        });
      }
      await loadRecords();
      setSuccessMsg('Data absensi tersimpan!');
      setShowSuccess(true);
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const dim = daysInMonth(month, year);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const totalLibur = records.filter(r => r.status === 'libur').length;
  const totalIzin = records.filter(r => r.status === 'izin').length;
  const totalOff = totalLibur + totalIzin;
  const selectedUser = users.find(u => u.uid === selectedUserId);

  if (!canManage) {
    return (
      <div className="p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-sm font-black text-white uppercase">Akses Terbatas</p>
        <p className="text-xs text-white/50">Hanya Bos dan Mandor yang bisa mengelola absensi.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 min-h-screen pb-40">
      <SuccessToast show={showSuccess} message={successMsg} onClose={() => setShowSuccess(false)} />

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-[#7C8CFF]/10 flex items-center justify-center border border-[#7C8CFF]/20 text-[#7C8CFF]">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-tight">Absensi Karyawan</h3>
          <p className="text-[10px] text-white/55 font-bold uppercase tracking-widest">Catat Hari Libur &amp; Izin</p>
        </div>
      </div>

      {/* Pilih Karyawan — horizontal chips */}
      <div className="glass-card p-4 space-y-3" style={{ borderRadius: '1.25rem' }}>
        <label className="text-[10px] font-black text-white/55 uppercase tracking-widest ml-1">Pilih Karyawan</label>
        {users.length === 0
          ? <p className="text-xs text-white/40 px-1">Belum ada karyawan terdaftar.</p>
          : <HorizontalEmployeePicker users={users} selectedId={selectedUserId} onChange={setSelectedUserId} />
        }
      </div>

      {selectedUserId && (
        <>
          {/* Bulan Navigator */}
          <div className="glass-card p-4 space-y-4" style={{ borderRadius: '1.25rem' }}>
            <div className="flex items-center justify-between">
              <button onClick={prevMonth}
                className="w-9 h-9 rounded-xl glass-sm flex items-center justify-center text-white/60 hover:text-white active:scale-90 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  {MONTH_NAMES[month - 1]} {year}
                </p>
                {selectedUser && (
                  <p className="text-[9px] font-bold text-[#7C8CFF] uppercase tracking-widest mt-0.5">{selectedUser.name}</p>
                )}
              </div>
              <button onClick={nextMonth}
                className="w-9 h-9 rounded-xl glass-sm flex items-center justify-center text-white/60 hover:text-white active:scale-90 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Libur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FFB020]"></div>
                <span className="text-[9px] font-black text-[#FFB020] uppercase tracking-widest">Izin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30"></div>
                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Masuk</span>
              </div>
            </div>

            {/* Calendar */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C8CFF]"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-white/50 uppercase tracking-widest py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDow }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: dim }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const rec = getRecordForDate(dateStr);
                    const isToday = dateStr === today.toISOString().split('T')[0];
                    const isToggling = toggling === dateStr;
                    const dow = (firstDow + i) % 7;
                    const isSunday = dow === 0;
                    const isLibur = rec?.status === 'libur';
                    const isIzin = rec?.status === 'izin';
                    const isHadir = !isLibur && !isIzin;

                    return (
                      <div key={dateStr} className="flex flex-col gap-0.5">
                        <div
                          className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer select-none active:scale-90 ${
                            isLibur ? 'border-rose-500/50 text-rose-400'
                            : isIzin ? 'border-[#FFB020]/50 text-[#FFB020]'
                            : isToday ? 'border-[#7C8CFF]/50 text-[#7C8CFF]'
                            : isSunday ? 'border-white/10 text-white/30'
                            : 'border-white/10 text-white/80 hover:border-white/25'
                          } ${isToggling ? 'opacity-50' : ''}`}
                          style={{
                            background: isLibur ? 'rgba(239,68,68,0.15)'
                              : isIzin ? 'rgba(255,176,32,0.15)'
                              : isToday ? 'rgba(124,140,255,0.15)'
                              : isSunday ? 'rgba(255,255,255,0.04)'
                              : 'rgba(255,255,255,0.04)',
                          }}
                          onClick={() => !isToggling && handleToggle(dateStr, 'libur')}
                          onContextMenu={(e) => { e.preventDefault(); !isToggling && handleToggle(dateStr, 'izin'); }}
                        >
                          <span className={`text-[11px] font-black leading-none ${isToday ? 'text-[#7C8CFF]' : ''}`}>{day}</span>
                          {isLibur && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></div>}
                          {isIzin && <div className="w-1.5 h-1.5 rounded-full bg-[#FFB020] mt-0.5"></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white/6 rounded-2xl p-3 border border-white/10">
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-relaxed">
                💡 Ketuk = Libur (merah) · Tahan/Klik Kanan = Izin (kuning) · Ketuk lagi = Batalkan
              </p>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="glass-card p-4" style={{ borderRadius: '1.25rem' }}>
            <p className="text-[10px] font-black text-white/55 uppercase tracking-widest mb-4 px-1">
              Ringkasan {MONTH_NAMES[month - 1]} {year}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#7C8CFF]/10 rounded-2xl p-3 text-center border border-[#7C8CFF]/25">
                <p className="text-lg font-black text-[#7C8CFF]">{dim - totalOff}</p>
                <p className="text-[8px] font-black text-[#7C8CFF] uppercase tracking-widest mt-1">Hari Masuk</p>
              </div>
              <div className="bg-rose-500/8 rounded-2xl p-3 text-center border border-rose-500/20">
                <p className="text-lg font-black text-rose-400">{totalLibur}</p>
                <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mt-1">Hari Libur</p>
              </div>
              <div className="bg-[#FFB020]/8 rounded-2xl p-3 text-center border border-[#FFB020]/20">
                <p className="text-lg font-black text-[#FFB020]">{totalIzin}</p>
                <p className="text-[8px] font-black text-[#FFB020] uppercase tracking-widest mt-1">Hari Izin</p>
              </div>
            </div>
            {totalOff > 0 && (
              <div className="mt-4 bg-rose-500/5 rounded-2xl p-3 border border-rose-500/10">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                  Total Tidak Masuk: <span className="text-rose-400">{totalOff} hari</span>
                  {' '}→ Akan otomatis terisi saat buat slip gaji
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main SalaryAbsensi Component ─────────────────────────────────────────────
export function SalaryAbsensi({ defaultTab }: { defaultTab?: 'slips' | 'absensi' }) {
  const [activeInnerTab, setActiveInnerTab] = useState<'slip' | 'absensi'>(defaultTab === 'absensi' ? 'absensi' : 'slip');
  const { role } = useAuthStore();
  const { user } = useAuthStore();
  const isBos = checkIsBos(user, role);

  return (
    <div className="min-h-screen">
      {/* Tab switcher — sticky */}
      <div className="sticky top-0 z-20 glass-header px-5 pt-4 pb-3">
        <div className="flex gap-2 max-w-xs">
          <button
            onClick={() => setActiveInnerTab('slip')}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeInnerTab === 'slip'
                ? 'bg-[#7C8CFF] text-white shadow-lg shadow-[#7C8CFF]/30'
                : 'glass-sm text-white/60 hover:text-white'
            }`}
          >
            Slip Gaji
          </button>
          {isBos && (
            <button
              onClick={() => setActiveInnerTab('absensi')}
              className={`flex-1 py-2.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeInnerTab === 'absensi'
                  ? 'bg-[#7C8CFF] text-white shadow-lg shadow-[#7C8CFF]/30'
                  : 'glass-sm text-white/60 hover:text-white'
              }`}
            >
              Absensi
            </button>
          )}
        </div>
      </div>

      {activeInnerTab === 'slip' && <SalaryTab />}
      {activeInnerTab === 'absensi' && isBos && <AbsensiTab />}
    </div>
  );
}
