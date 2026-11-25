import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';
export type ToastItem = { id: number; message: string; kind: ToastKind; actionLabel?: string; onAction?: () => void };

type UIState = {
  toasts: ToastItem[];
  show: (message: string, kind?: ToastKind, actionLabel?: string, onAction?: () => void) => void;
  dismiss: (id: number) => void;
};

let nextToastId = 1;

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  show: (message, kind = 'info', actionLabel, onAction) => {
    const id = nextToastId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, kind, actionLabel, onAction }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 4500);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
