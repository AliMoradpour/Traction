import { apiClient, endpoints } from '@/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
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
    await apiClient.post(endpoints.auth.logout);
  },

  getMe: async () => {
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
