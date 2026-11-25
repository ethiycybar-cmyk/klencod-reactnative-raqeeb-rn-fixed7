import { create } from 'zustand';
import type { Phase } from '../app/bootstrap';

type AuthState = {
  phase: Phase | null;
  setPhase: (phase: Phase) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  phase: null,
  setPhase: (phase) => set({ phase }),
}));
