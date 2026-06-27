import { create } from 'zustand';
import { BankBalance, Debt, Branch, SavingCustomer, VoucherRecap } from '../types';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { formatRupiah } from '../utils/formatters';

interface FinanceState {
  fixedBalance: number;
  bankBalances: BankBalance[];
  debts: Debt[];
  savings: SavingCustomer[];
  branches: Branch[];
  voucherRecaps: VoucherRecap[];
  announcement: string;
  isLoaded: boolean;
  error: string | null;

  setError: (error: string | null) => void;
  updateFixedBalance: (amount: number) => Promise<void>;
  updateAnnouncement: (text: string) => Promise<void>;
  updateBranchCapital: (branchId: string, amount: number) => Promise<void>;
  updateBranchPhysicalCapital: (branchId: string, amount: number) => Promise<void>;
  addBankBalance: (bankName: string, balance: number) => Promise<void>;
  updateBankBalance: (id: string, balance: number) => Promise<void>;
  deleteBankBalance: (id: string) => Promise<void>;

  addDebtPerson: (personName: string) => Promise<void>;
  deleteDebtPerson: (id: string) => Promise<void>;
  addDebtDetail: (personId: string, amount: number, description: string, type: 'add' | 'pay') => Promise<void>;
  deleteDebtDetail: (personId: string, detailId: string) => Promise<void>;

  addSavingCustomer: (personName: string, phone: string) => Promise<void>;
  deleteSavingCustomer: (id: string) => Promise<void>;
  addSavingTransaction: (personId: string, amount: number, description: string, type: 'deposit' | 'withdraw') => Promise<void>;
  deleteSavingTransaction: (personId: string, transactionId: string) => Promise<void>;
  getTotalSavings: () => number;

  addBranch: (name: string, totalSetor?: number) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  addBranchDeposit: (branchId: string, totalSetor: number, sisaSetor: number, destination: string, description: string) => Promise<void>;
  deleteBranchDeposit: (branchId: string, depositId: string) => Promise<void>;
  updateBranchDepositStatus: (branchId: string, depositId: string, status: 'pending' | 'received' | 'verified') => Promise<void>;
  receiveBranchDeposit: (branchId: string, depositId: string) => Promise<void>;
  completeBranchDeposit: (branchId: string, depositId: string, berhasilDisetor: number, atmName: string) => Promise<void>;
  updateBranchDepositAmount: (branchId: string, depositId: string, berhasilDisetor: number) => Promise<void>;

  addVoucherRecap: (date: string, adminSiang: number, adminMalam: number, voucherSiang: number, voucherMalam: number, expenseAmount: number, expenseDescription: string, description: string, branchId: string, status?: 'draft' | 'reported') => Promise<void>;
  updateVoucherRecap: (id: string, data: Partial<VoucherRecap>) => Promise<void>;
  reportVoucherRecaps: (branchId: string) => Promise<void>;
  deleteVoucherRecap: (id: string) => Promise<void>;
  transferBranchCapital: (branchId: string, amount: number, direction: 'to_non_physical' | 'to_physical') => Promise<void>;

  getTotalBankBalance: () => number;
  getPersonTotalDebt: (person: Debt) => number;
  getTotalDebt: () => number;
  getPersonTotalSavings: (person: SavingCustomer) => number;
  getBranchStats: (branch: Branch) => { totalSetor: number, sisaSetor: number, berhasilDisetor: number };
  getTotalAllBranches: () => { totalSetor: number, sisaSetor: number, berhasilDisetor: number };
}

const setStoreError = (error: unknown) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('Finance store error:', msg);
  useFinanceStore.setState({ error: msg });
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  fixedBalance: 0,
  bankBalances: [],
  debts: [],
  savings: [],
  branches: [],
  voucherRecaps: [],
  announcement: '',
  isLoaded: false,
  error: null,

  setError: (error) => set({ error }),

  updateFixedBalance: async (amount: number) => {
    try {
      set({ fixedBalance: amount });
      await api.patch('/settings', { fixedBalance: amount });
    } catch (error) {
      setStoreError(error);
    }
  },

  updateAnnouncement: async (text: string) => {
    try {
      set({ announcement: text });
      await api.patch('/settings', { announcement: text });
    } catch (error) {
      setStoreError(error);
    }
  },

  updateBranchCapital: async (branchId: string, amount: number) => {
    try {
      await api.patch(`/branches/${branchId}`, { capital: amount });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  updateBranchPhysicalCapital: async (branchId: string, amount: number) => {
    try {
      await api.patch(`/branches/${branchId}`, { physicalCapital: amount });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addBankBalance: async (bankName: string, balance: number) => {
    try {
      const branchId = useAuthStore.getState().branchId || null;
      await api.post('/banks', { bankName, balance, branchId });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  updateBankBalance: async (id: string, balance: number) => {
    try {
      await api.patch(`/banks/${id}`, { balance });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteBankBalance: async (id: string) => {
    try {
      await api.delete(`/banks/${id}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addDebtPerson: async (personName: string) => {
    const authState = useAuthStore.getState();
    if (!authState.branchId && authState.role !== 'bos') {
      console.error('Cannot add debt person: No branch assigned.');
      return;
    }
    try {
      const branchId = authState.branchId || null;
      await api.post('/debts', { personName, branchId });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteDebtPerson: async (id: string) => {
    try {
      await api.delete(`/debts/${id}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addDebtDetail: async (personId: string, amount: number, description: string, type: 'add' | 'pay') => {
    try {
      const user = useAuthStore.getState().user;
      await api.post(`/debts/${personId}/details`, {
        amount, description, type, createdBy: user?.uid || 'unknown',
      });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteDebtDetail: async (personId: string, detailId: string) => {
    try {
      await api.delete(`/debts/${personId}/details/${detailId}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addSavingCustomer: async (personName: string, phone: string) => {
    const authState = useAuthStore.getState();
    if (!authState.branchId && authState.role !== 'bos') {
      console.error('Cannot add saving customer: No branch assigned.');
      return;
    }
    try {
      const branchId = authState.branchId || null;
      await api.post('/savings', { personName, phone, branchId });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteSavingCustomer: async (id: string) => {
    try {
      await api.delete(`/savings/${id}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addSavingTransaction: async (personId: string, amount: number, description: string, type: 'deposit' | 'withdraw') => {
    try {
      const user = useAuthStore.getState().user;
      await api.post(`/savings/${personId}/transactions`, {
        amount, description, type,
        createdBy: user?.uid || 'unknown',
        createdByName: user?.displayName || 'Karyawan',
      });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteSavingTransaction: async (personId: string, transactionId: string) => {
    try {
      await api.delete(`/savings/${personId}/transactions/${transactionId}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addBranch: async (name: string, totalSetor?: number) => {
    try {
      await api.post('/branches', { name, totalSetor });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteBranch: async (id: string) => {
    try {
      await api.delete(`/branches/${id}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addBranchDeposit: async (branchId: string, totalSetor: number, _sisaSetor: number, destination: string, description: string) => {
    try {
      const user = useAuthStore.getState().user;
      await api.post(`/branches/${branchId}/deposits`, {
        totalSetor,
        sisaSetor: totalSetor,
        berhasilDisetor: 0,
        destination,
        description,
        createdBy: user?.uid || 'unknown',
        createdByName: user?.displayName || 'Karyawan',
        status: 'pending',
      });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteBranchDeposit: async (branchId: string, depositId: string) => {
    try {
      await api.delete(`/branches/${branchId}/deposits/${depositId}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  updateBranchDepositStatus: async (branchId: string, depositId: string, status: 'pending' | 'received' | 'verified') => {
    try {
      await api.patch(`/branches/${branchId}/deposits/${depositId}`, { status });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  receiveBranchDeposit: async (branchId: string, depositId: string) => {
    try {
      const user = useAuthStore.getState().user;
      await api.patch(`/branches/${branchId}/deposits/${depositId}`, {
        status: 'received',
        receivedBy: user?.uid || 'unknown',
        receivedByName: user?.displayName || 'Mandor',
        receivedAt: new Date().toISOString(),
      });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  completeBranchDeposit: async (branchId: string, depositId: string, berhasilDisetor: number, atmName: string) => {
    try {
      const user = useAuthStore.getState().user;
      const branch = get().branches.find(b => b.id === branchId);
      const deposit = branch?.deposits.find(d => d.id === depositId);
      if (!deposit) return;

      const sisaSetor = deposit.totalSetor - berhasilDisetor;

      await api.patch(`/branches/${branchId}/deposits/${depositId}`, {
        status: 'verified',
        berhasilDisetor,
        sisaSetor,
        atmName,
        completedBy: user?.uid || 'unknown',
        completedByName: user?.displayName || 'Mandor',
        completedAt: new Date().toISOString(),
      });

      // If there is a remaining amount, automatically add it to "Bon/Hutang"
      if (sisaSetor > 0) {
        const personName = 'SISA SETOR';
        const allDebts: Debt[] = await api.get('/debts');
        let personId = allDebts.find(d => d.personName === personName && d.branchId === branchId)?.id;

        if (!personId) {
          const created = await api.post('/debts', { personName, branchId });
          personId = created.id;
        }

        if (personId) {
          await api.post(`/debts/${personId}/details`, {
            amount: sisaSetor,
            description: `Sisa Setor: ${deposit.description} (${branch?.name || ''})`,
            type: 'add',
            createdBy: user?.uid || 'unknown',
          });
        }
      }

      // --- WhatsApp Notification ---
      try {
        const allUsers: any[] = await api.get('/users');
        const branchUsers = allUsers.filter(u => u.branchId === branchId);
        const bosUsers = allUsers.filter(u => u.role === 'bos');
        const allTargets = [...branchUsers, ...bosUsers];
        const uniquePhones = Array.from(new Set(allTargets.map(u => u.phone).filter(Boolean)));

        if (uniquePhones.length > 0) {
          const message = `*NOTIFIKASI SETORAN SELESAI*\n\n` +
            `Cabang: ${branch?.name || '...'}\n` +
            `Oleh: ${user?.displayName || 'Mandor'}\n` +
            `Total Setor: ${formatRupiah(deposit.totalSetor)}\n` +
            `Berhasil: ${formatRupiah(berhasilDisetor)}\n` +
            `Sisa: ${formatRupiah(sisaSetor)}\n` +
            `ATM: ${atmName}\n` +
            `Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
            `_Pesan otomatis dari ALFATHPulsa App_`;

          for (const phone of uniquePhones) {
            if (phone) await sendWhatsAppMessage(phone as string, message);
          }
        }
      } catch (waError) {
        console.warn('WhatsApp notification failed:', waError);
      }
      // -----------------------------

      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  updateBranchDepositAmount: async (branchId: string, depositId: string, newAmount: number) => {
    try {
      const user = useAuthStore.getState().user;
      const branch = get().branches.find(b => b.id === branchId);
      const deposit = branch?.deposits.find(d => d.id === depositId);
      if (!deposit) return;

      const editHistory = deposit.editHistory || [];
      const updatedHistory = [
        ...editHistory,
        {
          previousAmount: deposit.berhasilDisetor,
          editedAt: new Date().toISOString(),
          editedBy: user?.uid || 'unknown',
          editedByName: user?.displayName || 'Mandor',
        },
      ];

      await api.patch(`/branches/${branchId}/deposits/${depositId}`, {
        berhasilDisetor: newAmount,
        totalSetor: newAmount,
        sisaSetor: 0,
        editHistory: updatedHistory,
      });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  addVoucherRecap: async (date: string, adminSiang: number, adminMalam: number, voucherSiang: number, voucherMalam: number, expenseAmount: number, expenseDescription: string, description: string, branchId: string, status: 'draft' | 'reported' = 'reported') => {
    try {
      const user = useAuthStore.getState().user;
      const total = (adminSiang + adminMalam - expenseAmount) + voucherSiang + voucherMalam;
      await api.post('/voucher-recaps', {
        date,
        adminSiang,
        adminMalam,
        voucherSiang,
        voucherMalam,
        expenseAmount,
        expenseDescription,
        total,
        description,
        branchId,
        status,
        createdBy: user?.uid || 'unknown',
        createdByName: user?.displayName || 'Admin',
      });
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  updateVoucherRecap: async (id: string, data: Partial<VoucherRecap>) => {
    try {
      if ('adminSiang' in data || 'adminMalam' in data || 'voucherSiang' in data || 'voucherMalam' in data || 'expenseAmount' in data) {
        const current = get().voucherRecaps.find(r => r.id === id);
        if (current) {
          const admS = data.adminSiang ?? current.adminSiang;
          const admM = data.adminMalam ?? current.adminMalam;
          const vouS = data.voucherSiang ?? current.voucherSiang;
          const vouM = data.voucherMalam ?? current.voucherMalam;
          const exp = data.expenseAmount ?? current.expenseAmount;
          data.total = (admS + admM - exp) + vouS + vouM;
        }
      }
      await api.patch(`/voucher-recaps/${id}`, data);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  reportVoucherRecaps: async (branchId: string) => {
    try {
      const recaps = get().voucherRecaps.filter(r => r.branchId === branchId && r.status === 'draft');
      await Promise.all(recaps.map(recap => api.patch(`/voucher-recaps/${recap.id}`, { status: 'reported' })));
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  deleteVoucherRecap: async (id: string) => {
    try {
      await api.delete(`/voucher-recaps/${id}`);
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  transferBranchCapital: async (branchId, amount, direction) => {
    try {
      const branch = get().branches.find(b => b.id === branchId);
      if (!branch) throw new Error('Branch not found');

      const currentCapital = branch.capital || 0;
      const currentPhysical = branch.physicalCapital || 0;
      const currentShifted = branch.shiftedCapital || 0;

      if (direction === 'to_non_physical') {
        if (currentPhysical < amount) throw new Error('Saldo Fisik tidak mencukupi');
        await api.patch(`/branches/${branchId}`, {
          capital: currentCapital + amount,
          physicalCapital: currentPhysical - amount,
          shiftedCapital: currentShifted + amount,
        });
      } else {
        if (currentCapital < amount) throw new Error('Saldo Non-Fisik tidak mencukupi');
        await api.patch(`/branches/${branchId}`, {
          capital: currentCapital - amount,
          physicalCapital: currentPhysical + amount,
          shiftedCapital: Math.max(0, currentShifted - amount),
        });
      }
      await loadAll();
    } catch (error) {
      setStoreError(error);
    }
  },

  getTotalBankBalance: () => {
    const authState = useAuthStore.getState();
    const isBosGlobal = authState.role === 'bos' && !authState.branchId;

    if (isBosGlobal) {
      return get().bankBalances.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
    } else {
      return get().bankBalances
        .filter(b => b.branchId === authState.branchId)
        .reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
    }
  },

  getPersonTotalDebt: (person: Debt) => {
    if (!person || !person.details) return 0;
    return person.details.reduce((sum, detail) => {
      return detail.type === 'add' ? sum + (Number(detail.amount) || 0) : sum - (Number(detail.amount) || 0);
    }, 0);
  },

  getTotalDebt: () => get().debts.reduce((sum, person) => sum + get().getPersonTotalDebt(person), 0),

  getTotalSavings: () => get().savings.reduce((sum, person) => sum + get().getPersonTotalSavings(person), 0),

  getPersonTotalSavings: (person: SavingCustomer) => {
    if (!person || !person.transactions) return 0;
    return person.transactions.reduce((sum, detail) => {
      return detail.type === 'deposit' ? sum + (Number(detail.amount) || 0) : sum - (Number(detail.amount) || 0);
    }, 0);
  },

  getBranchStats: (branch: Branch) => {
    if (!branch || !branch.deposits) return { totalSetor: 0, sisaSetor: 0, berhasilDisetor: 0 };
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todayDeposits = branch.deposits.filter(d => d && d.date && new Date(d.date).getTime() >= startOfToday);

    const totalSetor = todayDeposits.reduce((sum, d) => sum + (Number(d.totalSetor) || 0), 0);

    const sisaSetor = todayDeposits
      .filter(d => d.status !== 'verified')
      .reduce((sum, d) => sum + (Number(d.totalSetor) || 0), 0);

    const berhasilDisetor = todayDeposits
      .filter(d => d.status === 'verified')
      .reduce((sum, d) => sum + (Number(d.berhasilDisetor) || 0), 0);

    return { totalSetor, sisaSetor, berhasilDisetor };
  },

  getTotalAllBranches: () => {
    return get().branches.reduce((acc, b) => {
      const stats = get().getBranchStats(b);
      return {
        totalSetor: acc.totalSetor + stats.totalSetor,
        sisaSetor: acc.sisaSetor + stats.sisaSetor,
        berhasilDisetor: acc.berhasilDisetor + stats.berhasilDisetor,
      };
    }, { totalSetor: 0, sisaSetor: 0, berhasilDisetor: 0 });
  },
}));

// --------------------------------------------------------------------------
// Data loading: replaces Firestore onSnapshot with polling + refetch.
// GET endpoints return ALL rows; we replicate the original branchId/role
// filtering client-side so visibility rules stay identical.
// --------------------------------------------------------------------------
let pollInterval: ReturnType<typeof setInterval> | null = null;

const sortByCreatedAtDesc = <T extends { createdAt?: string }>(arr: T[]): T[] =>
  [...arr].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

async function loadAll() {
  const authState = useAuthStore.getState();
  if (!authState.user) return;
  const role = authState.role;
  const branchId = authState.branchId;
  const isGlobalBos = !branchId && role === 'bos';

  try {
    const [settings, banks, debts, savings, branches, vouchers] = await Promise.all([
      api.get('/settings'),
      api.get('/banks'),
      api.get('/debts'),
      api.get('/savings'),
      api.get('/branches'),
      api.get('/voucher-recaps'),
    ]);

    // Banks
    let bankBalances: BankBalance[] = [];
    if (branchId) bankBalances = banks.filter((b: BankBalance) => b.branchId === branchId);
    else if (role === 'bos') bankBalances = banks;

    // Debts (customers) — only roles other than mandor
    let debtList: Debt[] = [];
    if (role && role !== 'mandor') {
      if (branchId) debtList = debts.filter((d: any) => d.branchId === branchId);
      else if (isGlobalBos) debtList = debts;
      else debtList = debts.filter((d: any) => d.branchId == null);
    }
    debtList = sortByCreatedAtDesc(debtList as any) as Debt[];

    // Savings — same rule as debts
    let savingList: SavingCustomer[] = [];
    if (role && role !== 'mandor') {
      if (branchId) savingList = savings.filter((s: any) => s.branchId === branchId);
      else if (isGlobalBos) savingList = savings;
      else savingList = savings.filter((s: any) => s.branchId == null);
    }
    savingList = sortByCreatedAtDesc(savingList as any) as SavingCustomer[];

    // Branches — always all, sorted by name numeric
    const branchList: Branch[] = [...branches].sort((a: Branch, b: Branch) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    // Voucher recaps
    let voucherList: VoucherRecap[] = [];
    if (branchId || role === 'bos') {
      voucherList = branchId ? vouchers.filter((v: VoucherRecap) => v.branchId === branchId) : vouchers;
    }
    voucherList = [...voucherList].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

    useFinanceStore.setState({
      fixedBalance: settings?.fixedBalance || 0,
      announcement: settings?.announcement || '',
      bankBalances,
      debts: debtList,
      savings: savingList,
      branches: branchList,
      voucherRecaps: voucherList,
      isLoaded: true,
      error: null,
    });
  } catch (error) {
    // Avoid spamming the error banner during background polling.
    console.warn('Finance data refresh failed:', error);
    useFinanceStore.setState({ isLoaded: true });
  }
}

export const initFinanceStoreListeners = () => {
  if (!useAuthStore.getState().user) return;
  useFinanceStore.setState({ error: null });
  if (pollInterval) clearInterval(pollInterval);
  loadAll();
  pollInterval = setInterval(loadAll, 5000);
};

export const stopFinanceStoreListeners = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  useFinanceStore.setState({ isLoaded: false, fixedBalance: 0, bankBalances: [], debts: [], savings: [], branches: [], voucherRecaps: [] });
};
