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
  setBranchId: (branchId) => {
    // Persist mandor's branch choice so it survives page refresh
    const role = useAuthStore.getState().role;
    if (role === 'mandor') {
      if (branchId) localStorage.setItem('mandor-branch-sel', branchId);
      else localStorage.removeItem('mandor-branch-sel');
    }
    set({ branchId });
  },

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
  let branchId = user.branchId;
  // Restore mandor's last manually-selected branch (survives refresh)
  if (user.role === 'mandor') {
    const saved = localStorage.getItem('mandor-branch-sel');
    if (saved) branchId = saved;
  }
  useAuthStore.setState({
    user,
    role: user.role,
    branchId,
    isAuthLoaded: true,
  });
}

export function logout() {
  setToken(null);
  localStorage.removeItem('mandor-branch-sel');
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
async function tryRestoreSession() {
  const user = await fetchMe();
  applyUser(user);
  const role = useAuthStore.getState().role;
  if (role === 'bos' || role === 'mandor') {
    await useAuthStore.getState().refreshUsers();
  }
}

async function initAuth() {
  if (!getToken()) {
    useAuthStore.setState({ isAuthLoaded: true });
    return;
  }

  try {
    await tryRestoreSession();
  } catch {
    // If the token was cleared (401 response), apiFetch already handled it.
    // If the token is still present, it was a network/server error (e.g. STB
    // API not ready yet) — DO NOT delete the token; retry after 3 seconds so
    // that a reboot doesn't force a re-login.
    if (!getToken()) {
      // 401 path: token already cleared by apiFetch, user already reset by
      // onUnauthorized handler — just ensure isAuthLoaded is set.
      useAuthStore.setState({ isAuthLoaded: true });
      return;
    }

    // Network error: show login screen but preserve the token, then retry.
    useAuthStore.setState({ isAuthLoaded: true });

    setTimeout(async () => {
      if (!getToken()) return;
      try {
        await tryRestoreSession();
      } catch {
        // Still failing after retry — keep token for next boot, stay on login.
      }
    }, 3000);
  }
}

initAuth();
