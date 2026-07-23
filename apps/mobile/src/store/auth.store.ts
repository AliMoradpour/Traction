import { create } from 'zustand';
import { tokenStorage } from '@/api/interceptors';

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loadStoredAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await tokenStorage.setAccessToken(accessToken);
    await tokenStorage.setRefreshToken(refreshToken);
    set({ isAuthenticated: true, user, isLoading: false });
  },

  clearAuth: async () => {
    await tokenStorage.clearTokens();
    set({ isAuthenticated: false, user: null, isLoading: false });
  },

  updateUser: (userData) =>
    set((state) => ({ user: state.user ? { ...state.user, ...userData } : null })),

  setUser: (user) => set({ user }),

  loadStoredAuth: async () => {
    try {
      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();

      if (accessToken && refreshToken) {
        set({ isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
