import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';
import { aiService, type AIRecommendation } from '@/services';

// Queries
export function useAIRecommendations() {
  return useQuery<AIRecommendation[]>({
    queryKey: queryKeys.ai.recommendations(),
    queryFn: () => aiService.getRecommendations(),
    ...cacheConfig.ai,
  });
}

export function useDailyBrief() {
  return useQuery({
    queryKey: queryKeys.ai.dailyBrief(),
    queryFn: () => aiService.getDailyBrief(),
    ...cacheConfig.ai,
  });
}

export function useWeeklyReview() {
  return useQuery({
    queryKey: queryKeys.ai.weeklyReview(),
    queryFn: () => aiService.getWeeklyReview(),
    ...cacheConfig.ai,
  });
}

export function useAIStatus() {
  return useQuery<{ configured: boolean }>({
    queryKey: queryKeys.ai.status(),
    queryFn: () => aiService.getStatus(),
    ...cacheConfig.ai,
  });
}

// Mutations
export function useGenerateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiService.generateRecommendation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.recommendations() });
    },
  });
}

export function useAcceptRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiService.acceptRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.recommendations() });
    },
  });
}

export function useDismissRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiService.dismissRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.recommendations() });
    },
  });
}

export function useBreakdownTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => aiService.breakdownTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.all });
    },
  });
}

export function useStuckAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feeling, taskId }: { feeling: string; taskId?: string }) =>
      aiService.stuckAnalysis(feeling, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.behavior.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.all });
    },
  });
}

export function useGoalRecovery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => aiService.getGoalRecovery(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.all });
    },
  });
}
