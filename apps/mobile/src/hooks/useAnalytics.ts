import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from '@/lib/queryKeys';

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/analytics');
      return data;
    },
  });
}
