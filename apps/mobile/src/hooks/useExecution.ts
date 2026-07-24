import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';
import { executionService } from '@/services/execution.service';

export function useReadinessScore() {
  return useQuery({
    queryKey: queryKeys.execution.readiness(),
    queryFn: () => executionService.getReadiness(),
    ...cacheConfig.execution,
  });
}

export function useResistance() {
  return useQuery({
    queryKey: queryKeys.execution.resistance(),
    queryFn: () => executionService.getResistance(),
    ...cacheConfig.execution,
  });
}

export function useMomentum() {
  return useQuery({
    queryKey: queryKeys.execution.momentum(),
    queryFn: () => executionService.getMomentum(),
    ...cacheConfig.execution,
  });
}

export function useExecutionStats() {
  return useQuery({
    queryKey: queryKeys.execution.stats(),
    queryFn: () => executionService.getStats(),
    ...cacheConfig.execution,
  });
}
