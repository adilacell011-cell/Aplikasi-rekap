import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../hooks/useFinanceStore';
import { useAuthStore } from '../store/authStore';
import { formatRupiah, formatDate, formatNumberInput } from '../utils/formatters';
import { Send, Trash2, CheckCircle2, Clock, Search, Share2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { DepositAnalytics } from './DepositAnalytics';
import { SuccessToast } from './SuccessToast';

export function Deposits() {
  const store = useFinanceStore();
  const { role, branchId } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [historyLimit, setHistoryLimit] = useState(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'received' | 'verified'>('all');

  const [setorAmount, setSetorAmount] = useState('');
  const [setorDesc, setSetorDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingDeposit, setEditingDeposit] = useState<{ branchId: string; depositId: string; amount: string } | null>(null);
  const [completingDeposit, setCompletingDeposit] = useState<{ branchId: string; depositId: string; amount: string; atmName: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const value = e.target.value.replace(/\D/g, '');
    setter(value);
    const target = e.target;
    requestAnimationFrame(() => {
      const len = target.value.length;
      target.setSelectionRange(len, len);
    });
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; branchId: string; depositId: string; name: string }>({
    isOpen: false,
    branchId: '',
    depositId: '',
    name: ''
  });

  // Track which cards are expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const myBranch = useMemo(() => store.branches.find(b => b.id === branchId), [store.branches, branchId]);

  const handleTabChange = (tab: 'active' | 'history') => {
    setActiveTab(tab);
    setFilterStatus('all');
    setHistoryLimit(10);
  };

  const allDeposits = useMemo(() => {
    return store.branches
      .filter(branch => role === 'bos' || role === 'mandor' || branch.id === branchId)
      .flatMap(branch =>
        branch.deposits.map(dep => ({
          ...dep,
          branchName: branch.name,
          branchId: branch.id
        }))
      ).sort((a, b) => {
        const nameCompare = a.branchName.localeCompare(b.branchName, undefined, { numeric: true, sensitivity: 'base' });
        if (nameCompare !== 0) return nameCompare;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [store.branches, role, branchId]);

  const filteredDeposits = useMemo(() => {
    return allDeposits.filter(dep => {
      const matchesSearch = dep.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dep.createdByName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'active'
        ? (
            dep.status === 'pending' ||
            dep.status === 'received' ||
            (role === 'mandor' && dep.status === 'verified' && dep.completedAt && (new Date().getTime() - new Date(dep.completedAt).getTime() < 3600000))
          )
        : (
            role === 'mandor'
              ? (dep.status === 'verified' && (!dep.completedAt || (new Date().getTime() - new Date(dep.completedAt).getTime() >= 3600000)))
              : (dep.status === 'verified')
          );
      const matchesStatus = filterStatus === 'all' || dep.status === filterStatus;
      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [allDeposits, searchQuery, activeTab, filterStatus]);

  const displayedDeposits = useMemo(() => {
    return activeTab === 'active'
      ? filteredDeposits
      : filteredDeposits.slice(0, historyLimit);
  }, [filteredDeposits, activeTab, historyLimit]);

  const stats = useMemo(() => {
    return (role === 'bos' || role === 'mandor') ? store.getTotalAllBranches() : (myBranch ? store.getBranchStats(myBranch) : { totalSetor: 0, sisaSetor: 0, berhasilDisetor: 0 });
  }, [role, store, myBranch]);

  const hasPending = useMemo(() => allDeposits.some(d => d.status === 'pending'), [allDeposits]);

  if (!store.isLoaded) return null;
  const primaryAmount = role === 'mandor' ? stats.sisaSetor : stats.berhasilDisetor;
  const primaryLabel = role === 'mandor' ? 'Uang Belum Setor (Aktif)' : (role === 'bos' ? 'Total Setoran Berhasil (Hari Ini)' : `Total Setoran Berhasil (${myBranch?.name || 'Cabang'})`);

  const handleSetor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !setorAmount || !setorDesc || isSubmitting) return;
    const val = parseInt(setorAmount.replace(/\D/g, ''), 10);
    if (val > 0) {
      setIsSubmitting(true);
      try {
        await store.addBranchDeposit(branchId, val, 0, 'Mandor', setorDesc);
        setSuccessMsg("Setoran berhasil diajukan");
        setShowSuccess(true);
        setSetorAmount('');
        setSetorDesc('');
      } catch (error) {
        console.error("Failed to add deposit", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-5 space-y-7 bg-transparent min-h-screen pb-32">
      {role === 'bos' && <DepositAnalytics />}

      {/* Summary Header */}
      <div className={`glass-card p-5 relative overflow-hidden group transition-all duration-500 ${role === 'mandor' && stats.sisaSetor > 0 ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-[rgba(20,18,40,0.8)]' : ''}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-1000"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${role === 'mandor' && stats.sisaSetor > 0 ? 'bg-emerald-500 text-white border-emerald-500/50' : 'bg-white/10 text-emerald-500 border-white/20'}`}>
              <Send className={`w-6 h-6 ${role === 'mandor' && stats.sisaSetor > 0 ? 'animate-bounce' : ''}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                {primaryLabel}
              </h3>
              <p className={`text-xl font-black tracking-tighter text-white mt-0.5 transition-all ${role === 'mandor' && stats.sisaSetor > 0 ? 'scale-105 origin-left' : ''}`}>
                {formatRupiah(primaryAmount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-6 border-t border-white/10">
            <div>
              <p className="text-[9px] text-white/60 uppercase font-black tracking-widest mb-1.5">Total Masuk (Hari Ini)</p>
              <p className="text-base font-black text-white uppercase tracking-tight">{formatRupiah(stats.totalSetor)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/60 uppercase font-black tracking-widest mb-1.5">
                {role === 'mandor' ? 'Setoran Berhasil' : 'Uang Belum Setor'}
              </p>
              <p className={`text-base font-black uppercase tracking-tight ${role === 'mandor' ? 'text-white' : 'text-rose-500'}`}>
                {formatRupiah(role === 'mandor' ? stats.berhasilDisetor : stats.sisaSetor)}
              </p>
            </div>
          </div>

          {role === 'mandor' && (
            <button
              onClick={() => {
                const verifiedDeposits = allDeposits.filter(d => d.status === 'verified' && d.completedAt);
                if (verifiedDeposits.length === 0 && !hasPending) return;

                let latestCompletionTime = new Date();
                if (verifiedDeposits.length > 0) {
                  const sortedByCompletion = [...verifiedDeposits].sort((a, b) =>
                    new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
                  );
                  latestCompletionTime = new Date(sortedByCompletion[0].completedAt!);
                }

                const oneHourAgo = new Date(latestCompletionTime.getTime() - (60 * 60 * 1000));
                const todayStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                const bankGroups: Record<string, { total: number, branches: Record<string, number> }> = {};
                verifiedDeposits
                  .filter(d => new Date(d.completedAt!).getTime() >= oneHourAgo.getTime())
                  .forEach(d => {
                    const bank = d.atmName || 'BANK LAIN';
                    if (!bankGroups[bank]) bankGroups[bank] = { total: 0, branches: {} };
                    bankGroups[bank].total += d.berhasilDisetor;
                    bankGroups[bank].branches[d.branchName] = (bankGroups[bank].branches[d.branchName] || 0) + d.berhasilDisetor;
                  });

                const unSetGroups: Record<string, number> = {};
                allDeposits
                  .filter(d => d.status === 'pending' || d.status === 'received')
                  .forEach(d => {
                    unSetGroups[d.branchName] = (unSetGroups[d.branchName] || 0) + d.totalSetor;
                  });

                let message = `*🏦 LAPORAN SETORAN GABUNGAN*\n_(Batch Terbaru)_\n━━━━━━━━━━━━━━━━━━\n\n`;
                if (Object.keys(bankGroups).length > 0) {
                  Object.entries(bankGroups).forEach(([bank, data]) => {
                    message += `*Setor Ke ${bank.toUpperCase()}*\n*Total:* *${formatRupiah(data.total)}*\n\n`;
                    Object.entries(data.branches)
                      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }))
                      .forEach(([branch, amount]) => {
                        message += `${branch} # *${formatRupiah(amount)}*\n`;
                      });
                    message += `\n━━━━━━━━━━━━━━━━━━\n\n`;
                  });
                } else if (verifiedDeposits.length > 0) {
                  message += `_Tidak ada setoran baru dalam 1 jam terakhir._\n\n`;
                }
                if (Object.keys(unSetGroups).length > 0) {
                  message += `*⚠️ BELUM SETOR (AKTIF)*\n`;
                  let totalUnset = 0;
                  Object.entries(unSetGroups)
                    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }))
                    .forEach(([branch, amount]) => {
                      message += `${branch} # *${formatRupiah(amount)}*\n`;
                      totalUnset += amount;
                    });
                  message += `*Total Belum Setor:* *${formatRupiah(totalUnset)}*\n\n━━━━━━━━━━━━━━━━━━\n\n`;
                }
                message += `📅 _${todayStr} - ${timeStr}_ \n_ALFATH PULSA GROUP_`;

                if (navigator.share) {
                  navigator.share({ text: message }).catch(() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  });
                } else {
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }
              }}
              className="mt-4 w-full glass-input hover:bg-white/10 backdrop-blur-md text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border transition-all active:scale-[0.98] shadow-lg"
            >
              <Share2 className="w-5 h-5 text-emerald-500" />
              Laporan Gabungan
            </button>
          )}
        </div>
      </div>

      {/* Input Form for Karyawan/Mandor */}
      {(role === 'karyawan' || role === 'mandor') && myBranch && (
        <div className="glass-card rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-white/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Input Setoran Baru</h3>
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest leading-none mt-1">Lapor setoran ke Mandor</p>
            </div>
          </div>
          <div className="p-4">
            <form onSubmit={handleSetor} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Nominal Setoran</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 text-sm font-black">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    inputMode="numeric"
                    className="w-full pl-12 pr-5 py-3 text-base glass-input border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-black shadow-inner"
                    value={formatNumberInput(setorAmount)}
                    onChange={(e) => handleNumericInput(e, setSetorAmount)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/60 uppercase tracking-widest ml-1">Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Setoran Pagi"
                  className="w-full px-5 py-3 text-sm glass-input border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-medium shadow-inner placeholder:text-white/60/30"
                  value={setorDesc}
                  onChange={(e) => setSetorDesc(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4 stroke-[3px]" />
                    <span>KIRIM SETORAN</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Daftar Setoran</h3>
          </div>
          <div className="flex glass-card p-1 rounded-2xl border border-white/10 shadow-xl">
            <button
              onClick={() => handleTabChange('active')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'active' ? 'bg-brand-500 text-white shadow-lg' : 'text-white/60'}`}
            >
              AKTIF
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'history' ? 'bg-brand-500 text-white shadow-lg' : 'text-white/60'}`}
            >
              RIWAYAT
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Cari cabang, karyawan, atau keterangan..."
              className="w-full pl-12 pr-5 py-3 text-sm glass-card border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white shadow-xl font-medium placeholder:text-white/60/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === 'active' && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === 'all' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'glass-card text-white/60 border border-white/10'}`}
              >
                Semua Aktif
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all relative ${filterStatus === 'pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'glass-card text-white/60 border border-white/10'}`}
              >
                Pusat/Mandor
                {hasPending && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white/10"></span>
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterStatus('received')}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === 'received' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'glass-card text-white/60 border border-white/10'}`}
              >
                Lapor Mandor
              </button>
              {role === 'mandor' && (
                <button
                  onClick={() => setFilterStatus('verified')}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === 'verified' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'glass-card text-white/60 border border-white/10'}`}
                >
                  Baru Selesai
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deposits Feed — compact cards */}
      <div className="space-y-3 pb-20">
        {displayedDeposits.length === 0 ? (
          <div className="glass-card rounded-2xl py-10 px-4 text-center border border-white/10 shadow-xl">
            <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Clock className="w-8 h-8 text-asphalt-700" />
            </div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">
              {activeTab === 'active' ? 'Tidak ada setoran aktif' : 'Tidak ada riwayat setoran'}
            </p>
          </div>
        ) : (
          <>
            {displayedDeposits.map((deposit) => {
              const totalSetor = deposit.totalSetor ?? 0;
              const berhasilDisetor = deposit.berhasilDisetor ?? 0;
              const sisaSetor = deposit.sisaSetor ?? (totalSetor - berhasilDisetor);
              const isExpanded = expandedIds.has(deposit.id);

              // WA share per-card — defined here so it has access to computed amounts
              const shareThisDeposit = () => {
                const date = new Date(deposit.date).toLocaleString('id-ID', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                });
                const statusText = deposit.status === 'pending' ? '⏳ PENDING'
                  : deposit.status === 'received' ? '✅ DITERIMA MANDOR'
                  : '💰 SETORAN SELESAI';
                const message =
                  `*LAPORAN SETORAN MANDOR*\n--------------------------\n` +
                  `📍 *Cabang:* ${deposit.branchName}\n` +
                  `📅 *Tanggal:* ${date}\n` +
                  `💵 *Nominal:* ${formatRupiah(totalSetor)}\n` +
                  `📝 *Ket:* ${deposit.description}\n` +
                  `📊 *Status:* ${statusText}\n` +
                  `--------------------------\n` +
                  `🎯 *Tujuan:* ${deposit.destination || 'Mandor'}\n` +
                  (deposit.status === 'verified' ? `🏦 *ATM/Bank:* ${deposit.atmName || '-'}\n` : '') +
                  (deposit.status === 'verified' ? `✅ *Masuk Rek:* ${formatRupiah(berhasilDisetor)}\n` : '') +
                  (deposit.status === 'verified' && sisaSetor > 0 ? `⚠️ *Sisa Uang:* ${formatRupiah(sisaSetor)}\n` : '') +
                  `--------------------------\n_Laporan otomatis dari ALFATHPulsa_`;
                if (navigator.share) {
                  navigator.share({ text: message }).catch(() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  });
                } else {
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }
              };

              return (
                <div key={deposit.id} className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden flex">
                  {/* Status accent bar */}
                  <div className={`w-1 shrink-0 ${
                    deposit.status === 'pending' ? 'bg-orange-500' :
                    deposit.status === 'received' ? 'bg-brand-500' : 'bg-emerald-500'
                  }`} />

                  <div className="flex-1 min-w-0">
                    {/* Main header row — tap to expand/collapse */}
                    <button
                      className="w-full p-4 text-left active:bg-white/5 transition-colors"
                      onClick={() => toggleExpand(deposit.id)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none truncate">
                            {deposit.branchName}
                          </h4>
                          <p className="text-[9px] text-brand-500 font-black uppercase tracking-widest mt-1">
                            {formatDate(deposit.date)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-white leading-none mb-1.5">
                            {formatRupiah(totalSetor)}
                          </p>
                          {deposit.status === 'pending' ? (
                            <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20 uppercase tracking-wide">
                              PENDING
                            </span>
                          ) : deposit.status === 'received' ? (
                            <span className="text-[8px] font-black text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20 uppercase tracking-wide">
                              DITERIMA
                            </span>
                          ) : (
                            <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-wide">
                              SELESAI
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Collapsed: show description preview */}
                      {!isExpanded && (
                        <p className="text-[10px] text-white/35 mt-2 italic truncate">
                          "{deposit.description}"
                        </p>
                      )}
                    </button>

                    {/* Expandable detail section */}
                    {isExpanded && (
                      <div className="px-4 pb-3 space-y-3 border-t border-white/10 pt-3">
                        {/* Description + creator */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl glass-card border border-white/10 flex items-center justify-center text-[10px] text-white font-black shrink-0">
                            {deposit.createdByName?.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                              {deposit.createdByName}
                            </p>
                            <p className="text-[11px] text-white/80 italic truncate">
                              "{deposit.description}"
                            </p>
                          </div>
                        </div>

                        {/* Info chips */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
                          <div>
                            <span className="text-white/40 uppercase font-black">Tujuan: </span>
                            <span className="text-white font-black">{deposit.destination || 'MANDOR'}</span>
                          </div>
                          {deposit.status !== 'pending' && (
                            <div>
                              <span className="text-white/40 uppercase font-black">Penerima: </span>
                              <span className="text-brand-500 font-black">{deposit.receivedByName}</span>
                            </div>
                          )}
                          {deposit.status === 'verified' && deposit.atmName && (
                            <div>
                              <span className="text-white/40 uppercase font-black">ATM/Bank: </span>
                              <span className="text-emerald-500 font-black">{deposit.atmName}</span>
                            </div>
                          )}
                          {deposit.status === 'verified' && deposit.completedByName && (
                            <div>
                              <span className="text-white/40 uppercase font-black">Selesai oleh: </span>
                              <span className="text-emerald-500 font-black">{deposit.completedByName}</span>
                            </div>
                          )}
                        </div>

                        {/* Verified amounts */}
                        {deposit.status === 'verified' && (
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                              <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Masuk Rek</p>
                              <p className="text-sm font-black text-white mt-1">{formatRupiah(berhasilDisetor)}</p>
                            </div>
                            <div className={`rounded-xl p-3 border ${sisaSetor > 0 ? 'bg-rose-500/5 border-rose-500/10' : 'bg-transparent border-white/10'}`}>
                              <p className={`text-[9px] font-black uppercase tracking-widest ${sisaSetor > 0 ? 'text-rose-500' : 'text-white/40'}`}>
                                Sisa Tunai
                              </p>
                              <p className={`text-sm font-black mt-1 ${sisaSetor > 0 ? 'text-white' : 'text-white/40'}`}>
                                {sisaSetor > 0 ? formatRupiah(sisaSetor) : 'LUNAS'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Edit history */}
                        {deposit.editHistory && deposit.editHistory.length > 0 && (
                          <div className="bg-brand-500/5 rounded-xl p-3 border border-brand-500/10">
                            <p className="text-[9px] font-black text-brand-500 mb-2 uppercase tracking-widest">
                              Update Nominal:
                            </p>
                            <div className="space-y-1.5">
                              {deposit.editHistory.map((history, idx) => (
                                <div key={idx} className="flex justify-between text-[9px] border-b border-white/10 pb-1.5 last:border-0 last:pb-0">
                                  <span className="text-white font-black">{formatRupiah(history.previousAmount)}</span>
                                  <span className="text-white/40 font-bold">
                                    {history.editedByName} · {formatDate(history.editedAt).split(' ')[0]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    {(role === 'bos' || role === 'mandor') && (
                      <div className="px-3 pb-3 space-y-2">
                        {/* Primary action — active tab, actionable statuses only */}
                        {activeTab === 'active' && deposit.status === 'pending' && (
                          <button
                            onClick={() => store.receiveBranchDeposit(deposit.branchId, deposit.id)}
                            className="w-full bg-brand-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                            TERIMA UANG TUNAI
                          </button>
                        )}
                        {activeTab === 'active' && deposit.status === 'received' && (
                          <button
                            onClick={() => setCompletingDeposit({ branchId: deposit.branchId, depositId: deposit.id, amount: '', atmName: '' })}
                            className="w-full bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                            SETOR KE ATM
                          </button>
                        )}

                        {/* Secondary: WA + Edit + Delete (active tab) */}
                        {activeTab === 'active' && (
                          <div className="flex gap-2">
                            {role === 'mandor' && (
                              <button
                                onClick={shareThisDeposit}
                                className="flex-1 h-10 glass-card text-emerald-500 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/5 transition-all font-black text-[9px] uppercase tracking-widest gap-1.5"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                WA
                              </button>
                            )}
                            <button
                              onClick={() => setEditingDeposit({ branchId: deposit.branchId, depositId: deposit.id, amount: berhasilDisetor.toString() })}
                              className="flex-1 h-10 glass-card text-brand-500 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/5 transition-all font-black text-[9px] uppercase tracking-widest"
                            >
                              Update Rp
                            </button>
                            {role === 'mandor' && (
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, branchId: deposit.branchId, depositId: deposit.id, name: deposit.description })}
                                className="w-10 h-10 glass-card text-asphalt-700 hover:text-rose-500 rounded-xl flex items-center justify-center border border-white/10 hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* History tab: subtle WA button only */}
                        {activeTab === 'history' && role === 'mandor' && (
                          <button
                            onClick={shareThisDeposit}
                            className="w-full h-9 text-emerald-500/50 rounded-xl flex items-center justify-center gap-1.5 font-black text-[9px] uppercase tracking-widest hover:text-emerald-500 hover:bg-white/5 transition-all border border-white/5"
                          >
                            <Share2 className="w-3 h-3" />
                            Kirim WA
                          </button>
                        )}
                      </div>
                    )}

                    {/* Inline completion form */}
                    {completingDeposit?.depositId === deposit.id && (
                      <div className="p-4 bg-white/5 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                          Detail Setoran Bank:
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-black text-white/50 uppercase tracking-widest ml-1">
                              Nama ATM / Bank
                            </label>
                            <input
                              type="text"
                              placeholder="ATM Mandiri Sudirman"
                              className="w-full mt-1.5 px-4 py-3 glass-card border border-white/10 rounded-xl text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              value={completingDeposit.atmName}
                              onChange={(e) => setCompletingDeposit({ ...completingDeposit, atmName: e.target.value })}
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-white/50 uppercase tracking-widest ml-1">
                              Sisa Tunai (Rp)
                            </label>
                            <div className="relative mt-1.5">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-sm font-black">Rp</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="w-full pl-10 pr-4 py-3 glass-card border border-white/10 rounded-xl text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formatNumberInput(completingDeposit.amount)}
                                onChange={(e) => handleNumericInput(e, (val) => setCompletingDeposit({ ...completingDeposit, amount: val }))}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2 px-1">
                              <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tight">
                                Masuk Bank: {formatRupiah(totalSetor - parseInt(completingDeposit.amount || '0'))}
                              </p>
                              {parseInt(completingDeposit.amount || '0') > 0 && (
                                <p className="text-[9px] text-rose-500 font-black uppercase tracking-tight">
                                  Sisa: {formatRupiah(parseInt(completingDeposit.amount))}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const sisaInput = parseInt(completingDeposit.amount.replace(/\D/g, ''), 10) || 0;
                              const masuk = totalSetor - sisaInput;
                              if (masuk >= 0 && completingDeposit.atmName) {
                                store.completeBranchDeposit(completingDeposit.branchId, completingDeposit.depositId, masuk, completingDeposit.atmName);
                                setSuccessMsg("Setoran berhasil diselesaikan");
                                setShowSuccess(true);
                                setCompletingDeposit(null);
                              }
                            }}
                            className="flex-1 bg-emerald-500 text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                          >
                            Konfirmasi
                          </button>
                          <button
                            onClick={() => setCompletingDeposit(null)}
                            className="px-5 h-12 glass-card text-white/60 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline edit form */}
                    {editingDeposit?.depositId === deposit.id && (
                      <div className="p-4 bg-white/5 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[9px] font-black text-brand-500 mb-3 uppercase tracking-widest">
                          Update Nominal Rekening:
                        </p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-sm font-black">Rp</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              className="w-full pl-10 pr-4 py-3 glass-card border border-white/10 rounded-xl text-base font-black text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                              value={formatNumberInput(editingDeposit.amount)}
                              onChange={(e) => handleNumericInput(e, (val) => setEditingDeposit({ ...editingDeposit, amount: val }))}
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => {
                              const val = parseInt(editingDeposit.amount.replace(/\D/g, ''), 10);
                              if (!isNaN(val)) {
                                store.updateBranchDepositAmount(editingDeposit.branchId, editingDeposit.depositId, val);
                                setSuccessMsg("Nominal setoran berhasil diubah");
                                setShowSuccess(true);
                              }
                              setEditingDeposit(null);
                            }}
                            className="bg-brand-500 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingDeposit(null)}
                            className="p-3 glass-card text-white/60 rounded-xl border border-white/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {activeTab === 'history' && filteredDeposits.length > historyLimit && (
              <button
                onClick={() => setHistoryLimit(prev => prev + 10)}
                className="w-full py-4 glass-card border border-white/10 rounded-2xl text-[10px] font-black text-brand-500 hover:text-white uppercase tracking-[0.25em] transition-all shadow-xl"
              >
                Lihat Riwayat Lainnya ({filteredDeposits.length - historyLimit})
              </button>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Hapus Setoran"
        message={`Apakah Anda yakin ingin menghapus setoran "${deleteConfirm.name}"? Data yang dihapus tidak dapat dikembalikan.`}
        onConfirm={() => {
          store.deleteBranchDeposit(deleteConfirm.branchId, deleteConfirm.depositId);
          setSuccessMsg("Setoran berhasil dihapus");
          setShowSuccess(true);
          setDeleteConfirm({ isOpen: false, branchId: '', depositId: '', name: '' });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, branchId: '', depositId: '', name: '' })}
      />

      <SuccessToast
        show={showSuccess}
        message={successMsg}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
