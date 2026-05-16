import { create } from 'zustand';
// Gunakan 'import type' untuk memenuhi aturan verbatimModuleSyntax
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
}

// Memberikan tipe data eksplisit pada parameter untuk menghindari error 'implicit any'
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user: User) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));