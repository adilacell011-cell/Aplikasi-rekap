import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BgTheme =
  | 'twilight'
  | 'win11'
  | 'sonoma'
  | 'ventura'
  | 'aurora'
  | 'forest'
  | 'galaxy'
  | 'white';

/** Tema yang menggunakan light mode (font gelap) */
export const LIGHT_MODE_THEMES: BgTheme[] = ['white'];

export interface BgPreset {
  id: BgTheme;
  label: string;
  emoji: string;
  /** Three representative hex colors used to generate the preview swatch */
  colors: [string, string, string];
}

export const BG_PRESETS: BgPreset[] = [
  { id: 'twilight', label: 'Twilight',       emoji: '🌙', colors: ['#6B7FFF', '#8B55D4', '#130F2A'] },
  { id: 'win11',    label: 'Windows 11',     emoji: '🪟', colors: ['#E040FB', '#FF80CB', '#07031A'] },
  { id: 'sonoma',   label: 'macOS Sonoma',   emoji: '🍎', colors: ['#FF7043', '#E91E63', '#15060E'] },
  { id: 'ventura',  label: 'macOS Ventura',  emoji: '🔮', colors: ['#D500F9', '#6200EA', '#0C0015'] },
  { id: 'aurora',   label: 'Aurora',         emoji: '🌊', colors: ['#00E5FF', '#0288D1', '#000D14'] },
  { id: 'forest',   label: 'Forest',         emoji: '🌿', colors: ['#1DE9B6', '#00695C', '#00100D'] },
  { id: 'galaxy',   label: 'Galaxy',         emoji: '✨', colors: ['#7C4DFF', '#3D5AFE', '#000008'] },
  { id: 'white',    label: 'Putih',          emoji: '☀️', colors: ['#FFFFFF', '#E8F0FE', '#C7D8F8'] },
];

interface BgThemeState {
  bg: BgTheme;
  setBg: (bg: BgTheme) => void;
}

export const useBgThemeStore = create<BgThemeState>()(
  persist(
    (set) => ({
      bg: 'twilight',
      setBg: (bg) => set({ bg }),
    }),
    { name: 'alfath-bg-v1' }
  )
);
