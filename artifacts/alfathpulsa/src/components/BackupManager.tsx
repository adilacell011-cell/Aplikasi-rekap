import React, { useState, useEffect, useCallback } from 'react';
import { api, getToken } from '../api';
import { Database, Download, Trash2, RefreshCw, Play, CheckCircle, Clock, HardDrive } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { SuccessToast } from './SuccessToast';

interface BackupEntry {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BackupManager() {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; filename: string }>({ isOpen: false, filename: '' });

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: BackupEntry[] = await api.get('/backups');
      setBackups(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat daftar backup');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRunBackup = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await api.post('/backups/run');
      setToast({ show: true, message: `Backup berhasil: ${result.filename} (${formatBytes(result.sizeBytes)})` });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup gagal');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloadingFile(filename);
    try {
      const token = getToken();
      const res = await fetch(`/api/backups/download/${encodeURIComponent(filename)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunduh');
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await api.delete(`/backups/${encodeURIComponent(filename)}`);
      setToast({ show: true, message: `Backup ${filename} dihapus` });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus');
    }
    setDeleteConfirm({ isOpen: false, filename: '' });
  };

  return (
    <div className="space-y-6 p-4 pb-28">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/15 flex items-center justify-center border border-brand-500/20">
            <Database className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Backup Database</h2>
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Otomatis setiap hari pukul 02.00</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="p-2.5 glass-sm text-white/60 hover:text-white transition-all active:scale-90 disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Info Card */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-white uppercase tracking-wider">Jadwal Otomatis</p>
            <p className="text-[10px] text-white/60 font-medium leading-relaxed">
              Backup database dijalankan otomatis setiap hari pukul <span className="text-white font-bold">02.00</span>. 
              File disimpan di server dan dipertahankan selama <span className="text-white font-bold">7 hari</span> terakhir.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4 text-brand-500" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-white uppercase tracking-wider">Format File</p>
            <p className="text-[10px] text-white/60 font-medium leading-relaxed">
              Format <span className="text-white font-bold">.sql.gz</span> — SQL dump terkompresi. 
              Dapat di-restore dengan <code className="text-brand-400 text-[9px]">psql</code> ke database PostgreSQL baru.
            </p>
          </div>
        </div>
      </div>

      {/* Manual Backup Button */}
      <button
        onClick={handleRunBackup}
        disabled={isRunning}
        className="w-full flex items-center justify-center gap-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
      >
        {isRunning ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Sedang Membackup...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Backup Sekarang
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="glass-card border border-rose-500/30 p-3 rounded-2xl">
          <p className="text-[10px] text-rose-400 font-bold">{error}</p>
        </div>
      )}

      {/* Backup List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-4 bg-brand-500 rounded-full" />
          <span className="text-[11px] font-black text-brand-500 tracking-wider uppercase">
            Daftar Backup ({backups.length})
          </span>
        </div>

        <div className="glass-card overflow-hidden">
          {isLoading && backups.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-white/40">
              <RefreshCw className="w-8 h-8 animate-spin opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-widest">Memuat...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-white/40">
              <Database className="w-10 h-10 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Belum ada backup</p>
              <p className="text-[9px] text-white/30 font-medium">Tekan "Backup Sekarang" untuk memulai</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {backups.map((b, i) => (
                <div key={b.filename} className="p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    {i === 0 && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                    {i > 0 && (
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4 text-white/40" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white truncate">
                        {formatDateTime(b.createdAt)}
                        {i === 0 && <span className="ml-2 text-[8px] text-emerald-400 font-black uppercase tracking-widest">Terbaru</span>}
                      </p>
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">{formatBytes(b.sizeBytes)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDownload(b.filename)}
                      disabled={downloadingFile === b.filename}
                      className="p-2.5 glass-sm text-brand-500 hover:bg-brand-500/20 transition-all active:scale-90 disabled:opacity-40"
                      title="Download"
                    >
                      {downloadingFile === b.filename
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <Download className="w-3.5 h-3.5" />
                      }
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, filename: b.filename })}
                      className="p-2.5 glass-sm text-rose-500 hover:bg-rose-500/20 transition-all active:scale-90"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Hapus Backup"
        message={`Hapus file backup "${deleteConfirm.filename}"? Data tidak dapat dikembalikan.`}
        onConfirm={() => handleDelete(deleteConfirm.filename)}
        onCancel={() => setDeleteConfirm({ isOpen: false, filename: '' })}
      />

      <SuccessToast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
