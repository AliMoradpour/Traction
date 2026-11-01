import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cacheConfig } from '@/lib/cacheConfig';
import { queryKeys } from '@/lib/queryKeys';
import { UpdatePreferencesInput, UserPreferences, userService } from '@/services/user.service';

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
  const key = queryKeys.users.preferences();

  return useMutation({
    mutationFn: (data: UpdatePreferencesInput) => userService.updatePreferences(data),
    // Optimistic: reflect the change immediately, roll back if the server rejects it.
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserPreferences>(key);
      if (previous) {
        const { onboardingComplete: _ignored, ...fields } = data;
        queryClient.setQueryData<UserPreferences>(key, { ...previous, ...fields });
      }
      return { previous };
    },
    onError: (_error, _data, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
