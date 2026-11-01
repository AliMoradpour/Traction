import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cacheConfig } from '@/lib/cacheConfig';
import { queryKeys } from '@/lib/queryKeys';
import { UpdatePreferencesInput, userService } from '@/services/user.service';

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
    mutationFn: (data: UpdatePreferencesInput) => userService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.preferences() });
    },
  });
}
