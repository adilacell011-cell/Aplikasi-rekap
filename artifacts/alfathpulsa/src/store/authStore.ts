import { create } from 'zustand';
import { UserProfile } from '../types';
import {
  AppUser,
  fetchMe,
  getToken,
  loginRequest,
  setToken,
  setUnauthorizedHandler,
  api,
} from '../api';

interface AuthState {
  user: AppUser | null;
  role: 'bos' | 'mandor' | 'karyawan' | null;
  branchId: string | null;
  users: UserProfile[];
  isAuthLoaded: boolean;
  setUser: (user: AppUser | null) => void;
  setRole: (role: 'bos' | 'mandor' | 'karyawan' | null) => void;
  setBranchId: (branchId: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  branchId: null,
  users: [],
  isAuthLoaded: false,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setBranchId: (branchId) => set({ branchId }),

  login: async (username: string, password: string) => {
    const user = await loginRequest(username, password);
    applyUser(user);
    const role = get().role;
    if (role === 'bos' || role === 'mandor') {
      await get().refreshUsers();
    }
  },

  refreshUsers: async () => {
    try {
      const all: UserProfile[] = await api.get('/users');
      set({ users: all.filter((u) => u.role === 'karyawan' || u.role === 'mandor') });
    } catch (error) {
      console.error('Error fetching users list:', error);
    }
  },
}));

function applyUser(user: AppUser) {
  useAuthStore.setState({
    user,
    role: user.role,
    branchId: user.branchId,
    isAuthLoaded: true,
  });
}

export function logout() {
  setToken(null);
  useAuthStore.setState({
    user: null,
    role: null,
    branchId: null,
    users: [],
    isAuthLoaded: true,
  });
}

// On 401 from any request, force a logout so the UI returns to the login screen.
setUnauthorizedHandler(() => {
  useAuthStore.setState({
    user: null,
    role: null,
    branchId: null,
    users: [],
    isAuthLoaded: true,
  });
});

// Restore session on app boot using the stored token.
async function initAuth() {
  if (!getToken()) {
    useAuthStore.setState({ isAuthLoaded: true });
    return;
  }
  try {
    const user = await fetchMe();
    applyUser(user);
    const role = useAuthStore.getState().role;
    if (role === 'bos' || role === 'mandor') {
      await useAuthStore.getState().refreshUsers();
    }
  } catch (error) {
    console.warn('Session restore failed:', error);
    setToken(null);
    useAuthStore.setState({ isAuthLoaded: true });
  } finally {
    useAuthStore.setState({ isAuthLoaded: true });
  }
}

initAuth();
