import { create } from 'zustand';
// Gunakan 'import type' untuk memenuhi aturan verbatimModuleSyntax
import type { User } from '../types/user';
import authService from '../services/authService';

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
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));