import { apiClient } from './client';
import { endpoints } from './endpoints';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post(endpoints.auth.login, data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post(endpoints.auth.register, data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post(endpoints.auth.logout);
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post(endpoints.auth.refresh, { refreshToken });
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post(endpoints.auth.forgotPassword, data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post(endpoints.auth.resetPassword, data);
    return response.data;
  },

  async getMe(): Promise<AuthResponse['user']> {
    const response = await apiClient.get(endpoints.auth.me);
    return response.data;
  },
};
