import { create } from 'zustand';

export interface DialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  /** Pass a label to show a second (cancel) button. Omit for a single-button alert. */
  cancelText?: string | null;
  confirmVariant?: 'danger' | 'primary';
}

interface DialogStore extends Required<Omit<DialogOptions, 'message' | 'cancelText'>> {
  isOpen: boolean;
  message?: string;
  cancelText: string | null;
  resolver: ((value: boolean) => void) | null;
  show: (opts: DialogOptions) => Promise<boolean>;
  handle: (value: boolean) => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  title: '',
  message: undefined,
  confirmText: 'OK',
  cancelText: null,
  confirmVariant: 'primary',
  resolver: null,
  show: (opts) =>
    new Promise<boolean>((resolve) => {
      const prev = get().resolver;
      if (prev) prev(false);
      set({
        isOpen: true,
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText ?? 'OK',
        cancelText: opts.cancelText ?? null,
        confirmVariant: opts.confirmVariant ?? 'primary',
        resolver: resolve,
      });
    }),
  handle: (value) => {
    const { resolver } = get();
    if (resolver) resolver(value);
    set({ isOpen: false, resolver: null });
  },
}));

/** iOS-style single-button info/warning alert (replaces window.alert). */
export const iosAlert = (title: string, message?: string) =>
  useDialogStore.getState().show({ title, message, confirmText: 'OK' });

/** iOS-style two-button confirm (replaces window.confirm). */
export const iosConfirm = (opts: DialogOptions) =>
  useDialogStore.getState().show({ confirmText: 'OK', cancelText: 'Batal', ...opts });
