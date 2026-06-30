import React, { useMemo } from 'react';
import { PiggyBank, Receipt, TrendingDown, TrendingUp, Wallet, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../hooks/useFinanceStore';
import { formatRupiah } from '../utils/formatters';

function formatTanggal(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function EmployeeSelf() {
  const { user } = useAuthStore();
  const { employeeDebts, employeeSavings, getEmployeeDebtBalance, getEmployeeSavingBalance } = useFinanceStore();

  const uid = user?.uid ?? '';

  const debtRecord = useMemo(
    () => employeeDebts.find(d => d.userId === uid),
    [employeeDebts, uid]
  );
  const saveRecord = useMemo(
    () => employeeSavings.find(s => s.userId === uid),
    [employeeSavings, uid]
  );

  const bonBalance = getEmployeeDebtBalance(uid);
  const tabBalance = getEmployeeSavingBalance(uid);

  const history = useMemo(() => {
    const bonItems = (debtRecord?.details ?? []).map(d => ({
      id: d.id,
      kind: 'bon' as const,
      amount: Number(d.amount) || 0,
      description: d.description || '-',
      isCredit: d.type !== 'add',
      date: (d as any).date as string | undefined,
      label: d.type === 'add' ? 'Kasbon / Hutang' : 'Bayar Kasbon',
    }));

    const saveItems = (saveRecord?.transactions ?? []).map(t => ({
      id: t.id,
      kind: 'save' as const,
      amount: Number(t.amount) || 0,
      description: t.description || '-',
      isCredit: t.type === 'deposit',
      date: (t as any).date as string | undefined,
      label: t.type === 'deposit' ? 'Setor Tabungan' : 'Tarik Tabungan',
    }));

    return [...bonItems, ...saveItems].sort(
      (a, b) => String(b.date ?? '').localeCompare(String(a.date ?? ''))
    );
  }, [debtRecord, saveRecord]);

  return (
    <div className="p-5 space-y-6 bg-asphalt-900 min-h-screen pb-40">

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-500">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-tight">Keuangan Saya</h3>
          <p className="text-[10px] text-asphalt-text-400 font-bold uppercase tracking-widest">
            {user?.name || 'Karyawan'}
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-asphalt-800 p-5 rounded-[1.75rem] border border-rose-500/20 shadow-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-500">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-tight">Bon / Kasbon</span>
          </div>
          <p className="text-lg font-black text-white leading-none">{formatRupiah(bonBalance)}</p>
          <p className="text-[8px] font-bold text-rose-400/70 uppercase tracking-widest">Saldo hutang aktif</p>
        </div>

        <div className="bg-brand-500 p-5 rounded-[1.75rem] shadow-xl shadow-brand-500/20 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/80">
            <PiggyBank className="w-5 h-5 text-white" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-tight text-white">Tabungan</span>
          </div>
          <p className="text-lg font-black text-white leading-none">{formatRupiah(tabBalance)}</p>
          <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Total tabungan</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-4 bg-brand-500 rounded-full"></div>
          <span className="text-[11px] font-black text-brand-500 tracking-wider uppercase">Riwayat Transaksi</span>
        </div>

        {history.length === 0 ? (
          <div className="bg-asphalt-800 rounded-[2rem] p-10 text-center border border-asphalt-700/50">
            <Clock className="w-10 h-10 text-asphalt-700 mx-auto mb-3" />
            <p className="text-[10px] font-black text-asphalt-text-400 uppercase tracking-widest">
              Belum ada transaksi tercatat.
            </p>
          </div>
        ) : (
          <div className="bg-asphalt-800 rounded-[1.75rem] border border-asphalt-700/50 shadow-xl overflow-hidden divide-y divide-asphalt-700/40">
            {history.map((item) => {
              const isBon = item.kind === 'bon';
              const isPositive = item.isCredit;

              const iconBg = isBon
                ? (isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')
                : (isPositive ? 'bg-brand-500/10 text-brand-500' : 'bg-amber-500/10 text-amber-500');

              const amountColor = isBon
                ? (isPositive ? 'text-emerald-500' : 'text-rose-500')
                : (isPositive ? 'text-brand-400' : 'text-amber-400');

              const amountSign = isPositive ? '+' : '-';

              const Icon = isBon
                ? (isPositive ? TrendingDown : TrendingUp)
                : (isPositive ? PiggyBank : Receipt);

              return (
                <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white truncate">{item.label}</p>
                    <p className="text-[9px] font-bold text-asphalt-text-400 truncate mt-0.5">{item.description}</p>
                    <p className="text-[8px] font-bold text-asphalt-text-400/60 mt-0.5">{formatTanggal(item.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[13px] font-black ${amountColor}`}>
                      {amountSign} {formatRupiah(item.amount)}
                    </p>
                    <p className="text-[8px] font-bold text-asphalt-text-400/60 uppercase tracking-wider mt-0.5">
                      {isBon ? 'Kasbon' : 'Tabungan'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
