import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate';
export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  theme: ThemeColor;
  themeMode: ThemeMode;
  setTheme: (theme: ThemeColor) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'blue',
      themeMode: 'light',
      setTheme: (theme) => set({ theme }),
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: 'alfath-theme-storage-v2',
    }
  )
);
