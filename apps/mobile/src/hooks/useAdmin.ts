import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from '@/lib/queryKeys';

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/dashboard');
      return data;
    },
  });
}

export function useAdminUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.admin.users(page),
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await apiClient.patch(`/admin/users/${userId}/role`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(1) });
    },
  });
}
