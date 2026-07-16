import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Store, Download, LogOut, UserCog, PiggyBank, Ticket, ShoppingBag, AlertCircle, X, Check, BookOpen, FileText, Wallet, CalendarDays, KeyRound, Eye, EyeOff, Building2, ChevronDown, Palette } from 'lucide-react';
import { BgThemePicker } from './BgThemePicker';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { logout } from '../store/authStore';
import { api } from '../api';
import { iosAlert } from '../store/dialogStore';
import { toast } from 'sonner';

import { useFinanceStore, reloadFinanceData } from '../hooks/useFinanceStore';
import { useAuthStore } from '../store/authStore';
import { checkIsBos, checkIsMandor } from '../utils/authUtils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'debts' | 'savings' | 'deposits' | 'team' | 'vouchers' | 'sop' | 'salary-slips' | 'employee-finance' | 'my-finance' | 'absensi';
  setActiveTab: (tab: 'dashboard' | 'debts' | 'savings' | 'deposits' | 'team' | 'vouchers' | 'sop' | 'salary-slips' | 'employee-finance' | 'my-finance' | 'absensi') => void;
  role?: 'bos' | 'mandor' | 'karyawan' | null;
}

export function Layout({ children, activeTab, setActiveTab, role }: LayoutProps) {
  const { isInstallable, installApp } = usePWAInstall();
  const { branchId, user } = useAuthStore();
  const { branches, error, setError, announcement } = useFinanceStore();
  const branchName = branchId ? branches.find(b => b.id === branchId)?.name : null;
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');

  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [changePwForm, setChangePwForm] = useState({ old: '', new: '', confirm: '' });
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwOldVisible, setChangePwOldVisible] = useState(false);
  const [changePwNewVisible, setChangePwNewVisible] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError(null);
    if (!changePwForm.old || !changePwForm.new || !changePwForm.confirm) {
      setChangePwError('Semua kolom wajib diisi.');
      return;
    }
    if (changePwForm.new !== changePwForm.confirm) {
      setChangePwError('Password baru dan konfirmasi tidak sama.');
      return;
    }
    if (changePwForm.new.length < 4) {
      setChangePwError('Password baru minimal 4 karakter.');
      return;
    }
    setChangePwLoading(true);
    try {
      await api.patch('/users/me/password', { oldPassword: changePwForm.old, newPassword: changePwForm.new });
      setShowChangePw(false);
      setChangePwForm({ old: '', new: '', confirm: '' });
      await iosAlert('Password Berhasil Diubah ✅', 'Password baru Anda sudah aktif. Gunakan password baru saat login berikutnya.');
    } catch (err) {
      setChangePwError(err instanceof Error ? err.message : 'Gagal mengubah password');
    } finally {
      setChangePwLoading(false);
    }
  };

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lock to Glassmorphism Twilight dark mode permanently
  React.useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'dark');
  }, []);

  return (
    <div className="min-h-[100dvh] bg-transparent flex justify-center selection:bg-brand-500/30" data-mode="dark">
      <div className="w-full bg-transparent h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden text-asphalt-text-100">
        {/* Global Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="global-error"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.8 }}
              className="fixed top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-4 right-4 z-[60] ios-card ios-font flex items-center gap-3 px-4 py-3"
            >
              <div className="w-9 h-9 rounded-full bg-[#ff3b30] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 ios-on-color" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="ios-card-title text-[15px] font-semibold leading-tight tracking-[-0.01em]">Terjadi Kesalahan</p>
                <p className="ios-card-sub text-[13px] leading-tight truncate mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ios-card-sub p-1.5 -mr-1 rounded-full active:bg-black/5">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <header className="glass-header text-white sticky top-0 z-20 px-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-4 flex items-center justify-between border-b border-asphalt-800/10">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20 ring-2 ring-brand-500/10 active:scale-95 transition-transform">
                <span className="text-sm font-black text-white tracking-widest uppercase">AP</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-asphalt-900 rounded-full flex items-center justify-center border-2 border-asphalt-900">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-white/95 uppercase">{user?.displayName || 'AlfathPulsa'}</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                {checkIsMandor(role) ? (
                  <button
                    onClick={() => setShowBranchPicker(true)}
                    className="flex items-center gap-1 text-[9px] text-brand-500 font-extrabold uppercase tracking-[0.1em] bg-brand-500/10 border border-brand-500/20 px-2 py-1 rounded-lg active:scale-95 transition-all"
                  >
                    <Building2 className="w-2.5 h-2.5 shrink-0" />
                    <span>MANDOR • {branchName || 'PILIH CABANG'}</span>
                    <ChevronDown className="w-2.5 h-2.5 shrink-0" />
                  </button>
                ) : (
                  <p className="text-[9px] text-asphalt-text-400 font-extrabold uppercase tracking-[0.1em]">
                    {checkIsBos(user, role) ? (branchId ? `BOS • ${branchName}` : 'BOS PUSAT') :
                     branchId ? `KARYAWAN • ${branchName}` : 'KARYAWAN'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Jam & Tanggal Digital Klasik */}
            {time && (
              <div className="flex flex-col items-end leading-none">
                <div className="font-mono text-[10px] md:text-xs font-black tracking-wider text-brand-500 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-xl flex items-center gap-1.5 shadow-inner leading-none">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse shrink-0"></span>
                  <span className="tabular-nums">{time}</span>
                </div>
                {dateStr && (
                  <span className="text-[8px] font-black text-asphalt-text-400 uppercase tracking-wider mt-1 scale-90 origin-right whitespace-nowrap leading-none select-none">
                    {dateStr}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => setShowBgPicker(true)}
              className="w-10 h-10 flex items-center justify-center glass-sm hover:bg-white/10 transition-all active:scale-90"
              title="Tema Latar"
            >
              <Palette className="w-4.5 h-4.5 text-brand-500" />
            </button>
            <button
              onClick={() => { setShowChangePw(true); setChangePwError(null); setChangePwForm({ old: '', new: '', confirm: '' }); }}
              className="w-10 h-10 flex items-center justify-center glass-sm hover:bg-white/10 transition-all active:scale-90"
              title="Ubah Password"
            >
              <KeyRound className="w-4.5 h-4.5 text-amber-400" />
            </button>
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center glass-sm hover:bg-white/10 transition-all active:scale-90"
              title="Keluar"
            >
              <LogOut className="w-4.5 h-4.5 text-rose-500" />
            </button>
          </div>
        </header>
        
        {/* Running Text / Announcement */}
        {announcement && (
          <div className="bg-white/10 backdrop-blur-sm border-b border-white/15 flex items-center overflow-hidden h-10 shadow-lg">
            <div className="bg-brand-500 self-stretch px-4 flex items-center z-10 shadow-[8px_0_15px_rgba(0,0,0,0.3)]">
              <AlertCircle className="w-4 h-4 text-white animate-pulse" />
              <span className="ml-2 text-[10px] font-black text-white uppercase tracking-tighter">INFO</span>
            </div>
            <div className="flex-1 overflow-hidden relative flex items-center h-full bg-white/5">
              <div className="flex whitespace-nowrap animate-marquee py-1">
                <span className="text-xs font-black text-white px-10 uppercase tracking-wide">
                  {announcement}
                </span>
                {/* Duplicate for seamless loop */}
                <span className="text-xs font-black text-white px-10 uppercase tracking-wide">
                  {announcement}
                </span>
                <span className="text-xs font-black text-white px-10 uppercase tracking-wide">
                  {announcement}
                </span>
              </div>
            </div>
          </div>
        )}
      
        {/* Branch Picker Overlay — mandor only */}
        {showBranchPicker && checkIsMandor(role) && (
          <div
            className="absolute inset-0 z-40 ios-backdrop flex flex-col justify-end animate-in fade-in duration-200"
            onClick={() => setShowBranchPicker(false)}
          >
            <div
              className="ios-sheet ios-font px-6 pt-3 pb-14 animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-5"><div className="ios-grabber" /></div>
              <div className="flex items-center justify-between mb-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Pilih Cabang</h3>
                    <p className="text-[10px] text-asphalt-text-400 font-bold uppercase tracking-widest mt-0.5">Data akan otomatis sinkron</p>
                  </div>
                </div>
                <button onClick={() => setShowBranchPicker(false)} className="p-3 bg-asphalt-900 rounded-2xl border border-asphalt-700 hover:bg-asphalt-700 transition-all">
                  <X className="w-5 h-5 text-asphalt-text-400" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {branches.map((branch) => {
                  const isSelected = branchId === branch.id;
                  return (
                    <button
                      key={branch.id}
                      onClick={() => {
                        useAuthStore.getState().setBranchId(branch.id);
                        reloadFinanceData();
                        setShowBranchPicker(false);
                        toast.success(`Beralih ke ${branch.name}`, { description: 'Data cabang sedang dimuat...' });
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                          : 'border-asphalt-700 bg-asphalt-900 text-white hover:border-asphalt-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-500/20' : 'bg-asphalt-800'}`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-black uppercase tracking-tight">{branch.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60">
                          Modal: {(branch.capital || 0).toLocaleString('id-ID')}
                        </p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-brand-500 stroke-[2.5px] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Body: sidebar (tablet+) alongside main content */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* ── Sidebar Navigation — tablet & desktop only ── */}
          <nav className="hidden md:flex flex-col w-[4.5rem] lg:w-56 glass-sidebar py-3 gap-0.5 shrink-0 overflow-y-auto">

            {/* helper to build each nav item */}
            {(
              [
                { tab: 'dashboard', icon: <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeTab === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Beranda', show: true },
                { tab: 'deposits',  icon: <Download       className={`w-5 h-5 shrink-0 ${activeTab === 'deposits'  ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Setoran',  show: true },
                { tab: 'savings',   icon: <PiggyBank      className={`w-5 h-5 shrink-0 ${activeTab === 'savings' || activeTab === 'debts' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Tabungan', show: true },
                { tab: 'vouchers',  icon: <Ticket         className={`w-5 h-5 shrink-0 ${activeTab === 'vouchers'  ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Rekapan',  show: true },
                { tab: 'salary-slips', icon: <FileText    className={`w-5 h-5 shrink-0 ${activeTab === 'salary-slips' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Slip Gaji', show: !checkIsBos(user, role) },
                { tab: 'my-finance',   icon: <Wallet      className={`w-5 h-5 shrink-0 ${activeTab === 'my-finance'   ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Keuangan',  show: role === 'karyawan' || role === 'mandor' },
                { tab: 'absensi',  icon: <CalendarDays    className={`w-5 h-5 shrink-0 ${activeTab === 'absensi'  ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Absensi',  show: checkIsBos(user, role) },
                { tab: 'employee-finance', icon: <UserCog className={`w-5 h-5 shrink-0 ${activeTab === 'employee-finance' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Keu. Tim', show: checkIsBos(user, role) },
                { tab: 'team',     icon: <Users           className={`w-5 h-5 shrink-0 ${activeTab === 'team' || activeTab === 'sop' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'Akun',     show: checkIsBos(user, role) },
                { tab: 'sop',      icon: <BookOpen        className={`w-5 h-5 shrink-0 ${activeTab === 'sop'      ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />, label: 'SOP',      show: checkIsBos(user, role) },
              ] as { tab: Parameters<typeof setActiveTab>[0]; icon: React.ReactNode; label: string; show: boolean | null | undefined }[]
            ).filter(item => item.show).map(item => {
              const isActive = activeTab === item.tab || (item.tab === 'savings' && activeTab === 'debts') || (item.tab === 'team' && activeTab === 'sop');
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`mx-2 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 px-2 lg:px-4 py-3 rounded-2xl transition-all active:scale-95 ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-500'
                      : 'text-white/55 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                  {/* Icon-only mode: tiny label under icon */}
                  <span className="lg:hidden text-[7px] font-black uppercase tracking-widest leading-none mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Main Content ── */}
          <main className="flex-1 overflow-hidden relative min-h-0">
            {children}
          </main>
        </div>

        {/* ── Bottom Navigation — mobile only ── */}
        <nav className="md:hidden fixed bottom-0 max-w-md w-full glass-nav z-30 pb-safe shadow-[0_-15px_50px_rgba(0,0,0,0.4)]">
          <div className="flex justify-around items-center h-[4.5rem] px-3 relative">

            {/* Beranda */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all group active:scale-90 ${
                activeTab === 'dashboard' ? 'text-brand-500' : 'text-white/50'
              }`}
            >
              <LayoutDashboard className={`w-5.5 h-5.5 transition-colors duration-300 ${activeTab === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[9px] font-black tracking-widest uppercase">Beranda</span>
            </button>

            {/* Tabungan */}
            <button
              onClick={() => setActiveTab('savings')}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all group active:scale-90 ${
                activeTab === 'savings' || activeTab === 'debts' ? 'text-brand-500' : 'text-white/50'
              }`}
            >
              <PiggyBank className={`w-5.5 h-5.5 transition-colors duration-300 ${activeTab === 'savings' || activeTab === 'debts' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[9px] font-black tracking-widest uppercase">Tabungan</span>
            </button>

            {/* Rekapan */}
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all group active:scale-90 ${
                activeTab === 'vouchers' ? 'text-brand-500' : 'text-white/50'
              }`}
            >
              <Ticket className={`w-5.5 h-5.5 transition-colors duration-300 ${activeTab === 'vouchers' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[9px] font-black tracking-widest uppercase">Rekapan</span>
            </button>

            {/* Slip Gaji (karyawan/mandor) */}
            {!checkIsBos(user, role) && (
              <button
                onClick={() => setActiveTab('salary-slips')}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all group active:scale-90 ${
                  activeTab === 'salary-slips' ? 'text-brand-500' : 'text-white/50'
                }`}
              >
                <FileText className={`w-5.5 h-5.5 transition-colors duration-300 ${activeTab === 'salary-slips' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[9px] font-black tracking-widest uppercase">Gaji</span>
              </button>
            )}

            {/* Keuangan Saya */}
            {(role === 'karyawan' || role === 'mandor') && (
              <button
                onClick={() => setActiveTab('my-finance')}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all group active:scale-90 ${
                  activeTab === 'my-finance' ? 'text-brand-500' : 'text-white/50'
                }`}
              >
                <Wallet className={`w-5.5 h-5.5 transition-colors duration-300 ${activeTab === 'my-finance' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[9px] font-black tracking-widest uppercase">Keuangan</span>
              </button>
            )}

            {/* Absensi (bos) */}
            {checkIsBos(user, role) && (
              <button
                onClick={() => setActiveTab('absensi')}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all group active:scale-90 ${
                  activeTab === 'absensi' ? 'text-brand-500' : 'text-white/50'
                }`}
              >
                <CalendarDays className={`w-5.5 h-5.5 transition-colors duration-300 ${activeTab === 'absensi' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[9px] font-black tracking-widest uppercase">Absensi</span>
              </button>
            )}

            {/* Akun (bos) */}
            {checkIsBos(user, role) && (
              <button
                onClick={() => setActiveTab('team')}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all group active:scale-90 ${
                  activeTab === 'team' || activeTab === 'sop' ? 'text-brand-500' : 'text-white/50'
                }`}
              >
                <Users className={`w-5.5 h-5.5 transition-colors duration-300 ${activeTab === 'team' || activeTab === 'sop' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[9px] font-black tracking-widest uppercase">Akun</span>
              </button>
            )}

          </div>
        </nav>
      </div>

      {/* Change Password Modal — portal to escape stacking contexts */}
      {createPortal(
      <AnimatePresence>
        {showChangePw && (
          <motion.div
            key="changepw-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[500] flex items-end justify-center ios-backdrop ios-font pb-[env(safe-area-inset-bottom,0px)]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={() => !changePwLoading && setShowChangePw(false)}
          >
            <motion.div
              key="changepw-panel"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
              className="w-full max-w-md bg-[rgba(20,18,40,0.85)] backdrop-blur-xl border border-white/20 rounded-b-none rounded-t-[2rem] p-6 pb-8 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Ubah Password</h3>
                    <p className="text-[9px] text-asphalt-text-400 font-bold uppercase tracking-widest mt-0.5">Akun saya</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePw(false)}
                  disabled={changePwLoading}
                  className="w-9 h-9 flex items-center justify-center text-asphalt-text-400 hover:text-white rounded-xl border border-asphalt-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Password Lama</label>
                  <div className="relative">
                    <input
                      type={changePwOldVisible ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={changePwForm.old}
                      onChange={(e) => setChangePwForm(f => ({ ...f, old: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 pr-12 py-3.5 text-sm glass-input font-semibold shadow-inner"
                    />
                    <button type="button" onClick={() => setChangePwOldVisible(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-asphalt-text-400 hover:text-white transition-colors">
                      {changePwOldVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <div className="relative">
                    <input
                      type={changePwNewVisible ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={changePwForm.new}
                      onChange={(e) => setChangePwForm(f => ({ ...f, new: e.target.value }))}
                      placeholder="Min. 4 karakter"
                      className="w-full px-4 pr-12 py-3.5 text-sm glass-input font-semibold shadow-inner"
                    />
                    <button type="button" onClick={() => setChangePwNewVisible(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-asphalt-text-400 hover:text-white transition-colors">
                      {changePwNewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={changePwForm.confirm}
                    onChange={(e) => setChangePwForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Ulangi password baru"
                    className="w-full px-4 py-3.5 text-sm bg-asphalt-900 border border-asphalt-700 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 text-white font-semibold shadow-inner"
                  />
                </div>

                {changePwError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3">
                    <p className="text-[11px] text-rose-400 font-bold text-center">{changePwError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changePwLoading}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-amber-500/20"
                >
                  {changePwLoading ? 'MENYIMPAN...' : 'SIMPAN PASSWORD BARU'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}

    {/* Background Theme Picker */}
    <BgThemePicker isOpen={showBgPicker} onClose={() => setShowBgPicker(false)} />
    </div>
  );
}

