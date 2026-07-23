import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, UserPreferences } from '@/services/user.service';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: () => userService.getProfile(),
    ...cacheConfig.users,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; avatar?: string }) =>
      userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
    },
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: queryKeys.users.preferences(),
    queryFn: () => userService.getPreferences(),
    ...cacheConfig.users,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => userService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.preferences() });
    },
  });
}
