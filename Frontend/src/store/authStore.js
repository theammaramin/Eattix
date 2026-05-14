import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginService, register as registerService, logout as logoutService } from '../services/authService';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await loginService(email, password);
          localStorage.setItem('eattix_token', token);
          set({ user, token, isLoading: false });
          return user;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await registerService(payload);
          localStorage.setItem('eattix_token', token);
          set({ user, token, isLoading: false });
          return user;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await logoutService();
        localStorage.removeItem('eattix_token');
        set({ user: null, token: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'eattix_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
