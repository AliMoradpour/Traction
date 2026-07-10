import { apiClient, endpoints } from '@/api';
import { tokenStorage } from '@/api/interceptors';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: { id: string; email: string; firstName?: string; lastName?: string };
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(endpoints.auth.login, data);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(endpoints.auth.register, data);
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post(endpoints.auth.refresh, { refreshToken });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(endpoints.auth.logout);
    } finally {
      await tokenStorage.clearTokens();
    }
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get(endpoints.auth.me);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(endpoints.auth.forgotPassword, { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post(endpoints.auth.resetPassword, { token, password });
  },
};
