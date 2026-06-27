import React, { useState } from 'react';
import { Zap } from 'lucide-react';
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
      setError(err instanceof Error ? err.message : 'Gagal masuk. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-asphalt-900 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-asphalt-800 px-7 py-6 rounded-[2.5rem] shadow-2xl border border-asphalt-700 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="menu-tile w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              <Zap className="menu-tile-icon w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black tracking-tighter text-3xl">AlfathPulsa</span>
          </div>

          <div className="relative z-10 w-full mt-4 pt-4 border-t border-asphalt-700/60 flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-[0.3em]">
              Manajemen Keuangan
            </span>
            <span className="text-xs text-asphalt-text-400 font-medium">
              Sistem Manajemen Keuangan Agen BRILink
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-asphalt-800 py-10 px-6 shadow-2xl rounded-[3rem] border border-asphalt-700 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-7">
            <div className="text-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Selamat Datang</h3>
              <p className="text-[10px] text-asphalt-text-400 font-bold uppercase tracking-widest mt-1">Masuk dengan akun terdaftar</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-white font-bold shadow-inner placeholder:text-asphalt-text-400/40 placeholder:normal-case"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-asphalt-text-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-asphalt-900 border border-asphalt-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-white font-bold shadow-inner placeholder:text-asphalt-text-400/40"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3">
                <p className="text-[10px] text-rose-400 font-bold text-center uppercase tracking-wider">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className="w-full flex justify-center items-center gap-3 py-4.5 px-4 border-2 border-brand-500/30 rounded-2xl shadow-lg text-xs font-black text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'MEMPROSES...' : 'Masuk'}
            </button>

            <div className="bg-asphalt-900 shadow-inner rounded-2xl p-5 border border-asphalt-700/50">
              <p className="text-[10px] text-center text-asphalt-text-400 leading-relaxed font-medium">
                Aplikasi ini hanya dapat diakses oleh <span className="text-brand-500 font-black">KARYAWAN</span>, <span className="text-emerald-500 font-black">MANDOR</span>, dan <span className="text-asphalt-text-100 font-black">BOS</span> yang telah terdaftar.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
