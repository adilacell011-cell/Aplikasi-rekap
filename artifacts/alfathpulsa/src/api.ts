// REST client for the local PostgreSQL backend (api-server, mounted at /api).
// Replaces the previous Firebase Firestore + Google Auth layer.

const TOKEN_KEY = 'alfathpulsa_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export interface AppUser {
  uid: string;
  username: string;
  email: string | null;
  name: string;
  displayName: string; // alias of name, for component compatibility
  role: 'bos' | 'mandor' | 'karyawan';
  branchId: string | null;
  phone?: string | null;
  baseSalary?: number | null;
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    if (onUnauthorized) onUnauthorized();
    throw new Error('Sesi berakhir, silakan masuk kembali.');
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      // ignore non-json error bodies
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body?: unknown) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: (path: string, body?: unknown) =>
    apiFetch(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: (path: string) => apiFetch(path, { method: 'DELETE' }),
};

function toAppUser(profile: any): AppUser {
  return {
    uid: profile.uid,
    username: profile.username,
    email: profile.email ?? null,
    name: profile.name,
    displayName: profile.name,
    role: profile.role,
    branchId: profile.branchId ?? null,
    phone: profile.phone ?? null,
    baseSalary: profile.baseSalary ?? null,
  };
}

export async function loginRequest(username: string, password: string): Promise<AppUser> {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return toAppUser(data.user);
}

export async function fetchMe(): Promise<AppUser> {
  const data = await apiFetch('/auth/me');
  return toAppUser(data.user);
}
