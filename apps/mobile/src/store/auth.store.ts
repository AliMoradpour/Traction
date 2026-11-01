import { create } from 'zustand';

import { tokenStorage } from '@/api/interceptors';
import { userService } from '@/services/user.service';

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
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
        // Only tokens are stored on the device, so fetch the profile (name,
        // role) in the background; startup doesn't wait on the network.
        void refreshProfile(get, set);
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

async function refreshProfile(
  get: () => AuthState,
  set: (partial: Partial<AuthState>) => void,
): Promise<void> {
  try {
    const profile = await userService.getProfile();
    // The user may have signed out while the request was in flight.
    if (!get().isAuthenticated) return;
    set({
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName ?? null,
        lastName: profile.lastName ?? null,
        role: profile.role,
      },
    });
  } catch {
    // Offline or token refresh failed; a failed refresh already signs the user out.
  }
}
