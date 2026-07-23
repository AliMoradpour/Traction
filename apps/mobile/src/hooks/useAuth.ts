import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi, type LoginRequest, type RegisterRequest, type AuthResponse } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { queryKeys } from '@/lib/queryClient';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data: AuthResponse) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/(app)/today');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data: AuthResponse) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/(onboarding)/introduction');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      queryClient.clear();
      await clearAuth();
      router.replace('/(auth)/login');
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.getMe(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data),
  });
}
