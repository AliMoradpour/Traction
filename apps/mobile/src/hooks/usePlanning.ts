import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { planningService } from '@/services/planning.service';

export function useMonthPlan(month: string) {
  return useQuery({
    queryKey: queryKeys.planning.month(month),
    queryFn: () => planningService.getMonthPlan(month),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMonthPlan(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { focuses?: string[]; note?: string | null }) => planningService.updateMonthPlan(month, data),
    onSuccess: (plan) => {
      queryClient.setQueryData(queryKeys.planning.month(month), plan);
      queryClient.invalidateQueries({ queryKey: queryKeys.planning.review(month) });
    },
  });
}

export function useMonthlyReview(month: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.planning.review(month),
    queryFn: () => planningService.getMonthlyReview(month),
    enabled,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
}
