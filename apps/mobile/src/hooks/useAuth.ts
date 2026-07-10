import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginRequest, RegisterRequest } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.getMe(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
