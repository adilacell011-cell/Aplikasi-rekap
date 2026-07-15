import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { CalendarDays, ChevronLeft, ChevronRight, User, Check, X, Coffee, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserProfile } from '../types';
import { checkIsBos } from '../utils/authUtils';
import { SuccessToast } from './SuccessToast';
import { DropdownPicker } from './DropdownPicker';

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string | null;
  branchId: string | null;
  date: string;
  status: 'libur' | 'izin';
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
}

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const DAY_NAMES = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export function Absensi() {
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
      const data: AttendanceRecord[] = await api.get(
        `/attendance?userId=${selectedUserId}&month=${month}&year=${year}`
      );
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId, month, year]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const getRecordForDate = (dateStr: string) =>
    records.find(r => r.date === dateStr) ?? null;

  const handleToggle = async (dateStr: string, status: 'libur' | 'izin') => {
    if (!canManage || !selectedUserId || toggling) return;
    setToggling(dateStr);
    const existing = getRecordForDate(dateStr);
    try {
      if (existing) {
        if (existing.status === status) {
          await api.delete(`/attendance/${existing.id}`);
        } else {
          await api.patch(`/attendance/${existing.id}`, { status });
        }
      } else {
        const selectedUser = users.find(u => u.uid === selectedUserId);
        await api.post('/attendance', {
          userId: selectedUserId,
          userName: selectedUser?.name ?? null,
          branchId: selectedUser?.branchId ?? null,
          date: dateStr,
          status,
          createdBy: uid,
          createdByName: user?.displayName ?? null,
        });
      }
      await loadRecords();
      setSuccessMsg('Data absensi tersimpan!');
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(null);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const dim = daysInMonth(month, year);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const totalLibur = records.filter(r => r.status === 'libur').length;
  const totalIzin = records.filter(r => r.status === 'izin').length;
  const totalOff = totalLibur + totalIzin;

  const selectedUser = users.find(u => u.uid === selectedUserId);

  const yearOptions = [year - 1, year, year + 1].map(y => ({ value: String(y), label: String(y) }));
  const monthOptions = MONTH_NAMES.map((n, i) => ({ value: String(i + 1), label: n.toUpperCase() }));

  if (!canManage) {
    return (
      <div className="p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-sm font-black text-white uppercase">Akses Terbatas</p>
        <p className="text-xs text-asphalt-text-400">Hanya Bos dan Mandor yang bisa mengelola absensi.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 bg-asphalt-900 min-h-screen pb-40">
      <SuccessToast show={showSuccess} message={successMsg} onClose={() => setShowSuccess(false)} />

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-500">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-tight">Absensi Karyawan</h3>
          <p className="text-[10px] text-asphalt-text-400 font-bold uppercase tracking-widest">Catat Hari Libur & Izin</p>
        </div>
      </div>

      {/* Pilih Karyawan */}
      <div className="bg-asphalt-800 rounded-2xl p-4 border border-asphalt-700/40 shadow-xl space-y-3">
        <label className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Pilih Karyawan</label>
        {users.length === 0 ? (
          <p className="text-xs text-asphalt-text-400 px-1">Belum ada karyawan terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {users.map(u => (
              <button
                key={u.uid}
                onClick={() => setSelectedUserId(u.uid)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                  selectedUserId === u.uid
                    ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                    : 'border-asphalt-700 bg-asphalt-900/50 text-asphalt-text-400 hover:border-asphalt-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 ${
                  selectedUserId === u.uid ? 'bg-brand-500 text-white' : 'bg-asphalt-700 text-asphalt-text-400'
                }`}>
                  {(u.name || 'K')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase truncate">{u.name}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{u.role}</p>
                </div>
                {selectedUserId === u.uid && (
                  <Check className="w-4 h-4 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUserId && (
        <>
          {/* Bulan Navigator */}
          <div className="bg-asphalt-800 rounded-2xl p-4 border border-asphalt-700/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl bg-asphalt-900 border border-asphalt-700 flex items-center justify-center text-asphalt-text-400 hover:text-white hover:bg-asphalt-700 active:scale-90 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  {MONTH_NAMES[month - 1]} {year}
                </p>
                {selectedUser && (
                  <p className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mt-0.5">
                    {selectedUser.name}
                  </p>
                )}
              </div>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl bg-asphalt-900 border border-asphalt-700 flex items-center justify-center text-asphalt-text-400 hover:text-white hover:bg-asphalt-700 active:scale-90 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Libur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Izin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-asphalt-600 border border-asphalt-500"></div>
                <span className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest">Masuk</span>
              </div>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDow }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

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

                    return (
                      <div key={dateStr} className="flex flex-col gap-0.5">
                        <div
                          className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer select-none active:scale-90 ${
                            isLibur
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
                              : isIzin
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-500'
                              : isToday
                              ? 'bg-brand-500/10 border-brand-500/40 text-brand-500'
                              : isSunday
                              ? 'bg-asphalt-900/50 border-asphalt-700/30 text-asphalt-text-400/50'
                              : 'bg-asphalt-900/50 border-asphalt-700/30 text-asphalt-text-100 hover:border-asphalt-600'
                          } ${isToggling ? 'opacity-50' : ''}`}
                          onClick={() => !isToggling && handleToggle(dateStr, 'libur')}
                          onContextMenu={(e) => { e.preventDefault(); !isToggling && handleToggle(dateStr, 'izin'); }}
                        >
                          <span className={`text-[11px] font-black leading-none ${isToday ? 'text-brand-500' : ''}`}>
                            {day}
                          </span>
                          {isLibur && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></div>}
                          {isIzin && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5"></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Panduan singkat */}
            <div className="bg-asphalt-900/50 rounded-2xl p-3 border border-asphalt-700/30">
              <p className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest leading-relaxed">
                💡 Ketuk = Libur (merah) · Tahan/Klik Kanan = Izin (kuning) · Ketuk lagi = Batalkan
              </p>
            </div>
          </div>

          {/* Ringkasan bulan ini */}
          <div className="bg-asphalt-800 rounded-2xl p-4 border border-asphalt-700/40 shadow-xl">
            <p className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest mb-4 px-1">
              Ringkasan {MONTH_NAMES[month - 1]} {year}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-asphalt-900/60 rounded-2xl p-3 text-center border border-asphalt-700/30 shadow-inner">
                <p className="text-lg font-black text-white">{dim - totalOff}</p>
                <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest mt-1">Hari Masuk</p>
              </div>
              <div className="bg-rose-500/5 rounded-2xl p-3 text-center border border-rose-500/20 shadow-inner">
                <p className="text-lg font-black text-rose-500">{totalLibur}</p>
                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">Hari Libur</p>
              </div>
              <div className="bg-amber-500/5 rounded-2xl p-3 text-center border border-amber-500/20 shadow-inner">
                <p className="text-lg font-black text-amber-500">{totalIzin}</p>
                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">Hari Izin</p>
              </div>
            </div>

            {totalOff > 0 && (
              <div className="mt-4 bg-rose-500/5 rounded-2xl p-3 border border-rose-500/10">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                  Total Tidak Masuk: <span className="text-rose-500">{totalOff} hari</span>
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
