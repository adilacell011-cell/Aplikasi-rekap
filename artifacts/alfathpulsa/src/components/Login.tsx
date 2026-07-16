import React, { useState } from 'react';
import { AppLogoWordmark } from './AppLogo';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      // Map common API error messages to bahasa Indonesia yang jelas
      if (raw.toLowerCase().includes('invalid') || raw.toLowerCase().includes('salah') || raw.toLowerCase().includes('incorrect') || raw.toLowerCase().includes('password')) {
        setError('Username atau password salah. Periksa kembali dan coba lagi.');
      } else if (raw.toLowerCase().includes('not found') || raw.toLowerCase().includes('tidak ditemukan')) {
        setError('Akun tidak ditemukan. Hubungi admin untuk mendaftar.');
      } else if (raw.toLowerCase().includes('sesi') || raw.toLowerCase().includes('unauthorized')) {
        setError('Sesi tidak valid. Silakan coba login kembali.');
      } else if (raw.toLowerCase().includes('network') || raw.toLowerCase().includes('fetch') || raw.toLowerCase().includes('failed')) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else if (raw) {
        setError(raw);
      } else {
        setError('Gagal masuk. Coba lagi beberapa saat.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col justify-center py-12 px-6 pb-safe relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card px-7 py-6 relative overflow-hidden flex flex-col items-center text-center group transition-all duration-500 hover:border-brand-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex items-center gap-3 transition-transform duration-500 group-hover:scale-105">
            <AppLogoWordmark iconSize={48} />
          </div>

          <div className="relative z-10 w-full mt-4 pt-4 border-t border-white/10 flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">
              Manajemen Keuangan
            </span>
            <span className="text-xs text-white/70 font-medium">
              Sistem Manajemen Keuangan Agen BRILink
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card-strong py-10 px-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-700 group-hover:bg-brand-500/10"></div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-7">
            <div className="text-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Selamat Datang</h3>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">Masuk dengan akun terdaftar</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/50 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-5 py-4 glass-input font-bold placeholder:text-white/30 placeholder:normal-case"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/50 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 glass-input font-bold placeholder:text-white/30"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3.5 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-rose-400 text-[10px] font-black">!</span>
                </div>
                <p className="text-[11px] text-rose-400 font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 rounded-2xl shadow-lg text-xs font-black text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-brand-500/20"
            >
              {isLoading ? 'MEMPROSES...' : 'Masuk'}
            </button>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <p className="text-[10px] text-center text-white/50 leading-relaxed font-medium">
                Aplikasi ini hanya dapat diakses oleh <span className="text-brand-500 font-black">KARYAWAN</span>, <span className="text-emerald-500 font-black">MANDOR</span>, dan <span className="text-white font-black">BOS</span> yang telah terdaftar.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
