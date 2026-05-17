import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'auth-storage', // Sesuai dengan key yang di-clear oleh axiosInstance.ts saat token kedaluwarsa
    }
  )
);