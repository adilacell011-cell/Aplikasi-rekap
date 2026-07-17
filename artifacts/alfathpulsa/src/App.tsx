/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Debts } from './components/Debts';
import { Savings } from './components/Savings';
import { Deposits } from './components/Deposits';
import { VoucherRecaps } from './components/VoucherRecaps';
import { Login } from './components/Login';
import { Team } from './components/Team';
import { SOPPage } from './components/SOPPage';
import { SalaryAbsensi } from './components/SalaryAbsensi';
import { EmployeeFinance } from './components/EmployeeFinance';
import { EmployeeSelf } from './components/EmployeeSelf';
import { BackupManager } from './components/BackupManager';
import { NotificationManager } from './components/NotificationManager';
import { PageTransition } from './components/PageTransition';
import { useAuthStore } from './store/authStore';
import { initFinanceStoreListeners } from './hooks/useFinanceStore';
import { checkIsBos } from './utils/authUtils';
import { AlertCircle } from 'lucide-react';
import { logout } from './store/authStore';
import { AppLogoIcon, AppLogoWordmark } from './components/AppLogo';
import { Toaster } from 'sonner';
import { useBgThemeStore, LIGHT_MODE_THEMES } from './store/bgThemeStore';

type TabType = 'dashboard' | 'debts' | 'savings' | 'deposits' | 'team' | 'vouchers' | 'sop' | 'salary-slips' | 'employee-finance' | 'my-finance' | 'absensi' | 'backup';

export default function App() {
  const { user, isAuthLoaded, role, branchId } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { bg } = useBgThemeStore();

  // Switch data-mode based on selected background theme
  useEffect(() => {
    const mode = LIGHT_MODE_THEMES.includes(bg) ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', mode);
  }, [bg]);

  // Apply background theme preset to <body>
  useEffect(() => {
    document.body.setAttribute('data-bg', bg);
  }, [bg]);

  useEffect(() => {
    if (user && role) {
      initFinanceStoreListeners();
    } else if (isAuthLoaded && !user) {
      // Clear listeners if not logged in
      import('./hooks/useFinanceStore').then(m => m.stopFinanceStoreListeners());
    }
  }, [user, role, isAuthLoaded]);

  // ── Android back-button navigation via History API ──────────────────────
  // Saat user login, pasang entry awal di history agar back dari dashboard
  // langsung keluar (tidak ada entry lagi), bukan balik ke tab sebelumnya.
  useEffect(() => {
    if (user) {
      window.history.replaceState({ tab: 'dashboard' }, '');
    }
  }, [user]);

  // Dengarkan tombol Back (popstate) — restore tab dari history state
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const tab = (e.state?.tab as TabType) ?? 'dashboard';
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Wrapper navigateTo — push history entry setiap pindah tab
  const navigateTo = useCallback((tab: TabType) => {
    setActiveTab(prev => {
      if (prev === tab) return prev;
      // Dari dashboard ke tab lain → push entry baru
      // Dari tab ke tab lain → juga push (sehingga back selalu kembali satu langkah)
      window.history.pushState({ tab }, '');
      return tab;
    });
  }, []);

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-asphalt-900 text-center px-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AppLogoIcon size={36} />
          </div>
        </div>
        <div className="mt-8">
          <AppLogoWordmark iconSize={36} />
        </div>
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className="text-[10px] text-asphalt-text-400 font-black uppercase tracking-[0.3em] animate-pulse">
            Menghubungkan ke Server...
          </span>
          <p className="text-[9px] text-asphalt-text-400/50 italic max-w-xs leading-relaxed">
            Jika ini memakan waktu lama, pastikan koneksi internet Anda stabil dan tidak ada pemblokir iklan yang aktif.
          </p>
        </div>
        
        {/* Fallback button that appears after 10s via CSS animation or just always show small */}
        <button 
          onClick={() => window.location.reload()}
          className="mt-12 text-[8px] text-white/30 hover:text-white uppercase tracking-widest font-black underline underline-offset-4"
        >
          Muat Ulang Paksa
        </button>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const isBos = checkIsBos(user, role);

  // If user is logged in but has no role assigned yet (and it's not the initial load)
  if (isAuthLoaded && user && !role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-asphalt-900 p-6 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Akses Tertunda</h2>
        <p className="mt-3 text-sm text-asphalt-text-400 font-medium max-w-xs leading-relaxed">
          Akun Anda ({user.email}) belum diaktifkan oleh Bos atau belum diberikan jabatan. 
          Silahkan hubungi Bos untuk mendapatkan akses.
        </p>
        <button 
          onClick={() => logout()}
          className="mt-8 px-8 py-3 bg-asphalt-800 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-asphalt-700"
        >
          Keluar & Ganti Akun
        </button>
      </div>
    );
  }

  // If Karyawan has no branch assigned, they can't do much
  if (isAuthLoaded && user && role === 'karyawan' && !branchId && activeTab !== 'sop' && activeTab !== 'salary-slips') {
    // We still allow them to see the layout but maybe a warning inside?
    // Actually, "mental" might be they are stuck here.
  }

  return (
    <>
    <Toaster position="top-right" richColors closeButton duration={2000} />
    <Layout activeTab={activeTab} setActiveTab={navigateTo} role={role}>
      <NotificationManager />
      <PageTransition activeTab={activeTab}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            onNavigate={(tab) => navigateTo(tab as TabType)} 
          />
        )}
        {activeTab === 'debts' && <Debts />}
        {activeTab === 'savings' && <Savings />}
        {activeTab === 'deposits' && <Deposits />}
        {activeTab === 'vouchers' && <VoucherRecaps />}
        {activeTab === 'team' && isBos && <Team />}
        {activeTab === 'sop' && <SOPPage />}
        {activeTab === 'salary-slips' && <SalaryAbsensi defaultTab="slips" />}
        {activeTab === 'employee-finance' && isBos && <EmployeeFinance />}
        {activeTab === 'my-finance' && (role === 'karyawan' || role === 'mandor') && <EmployeeSelf />}
        {activeTab === 'absensi' && isBos && <SalaryAbsensi defaultTab="absensi" />}
        {activeTab === 'backup' && isBos && <BackupManager />}
      </PageTransition>
    </Layout>
    </>
  );
}


