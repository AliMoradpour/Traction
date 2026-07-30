import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { queryKeys } from '@/lib/queryKeys';

export interface Invite {
  id: string;
  email: string;
  code: string;
  role: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  usedBy?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface InviteStats {
  total: number;
  used: number;
  pending: number;
  expired: number;
}

export interface CreateInviteRequest {
  email: string;
  role?: string;
}

export function useMyInvites() {
  return useQuery({
    queryKey: queryKeys.invites.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Invite[]>(endpoints.invites.list);
      return data;
    },
  });
}

export function useInviteStats() {
  return useQuery({
    queryKey: queryKeys.invites.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<InviteStats>(endpoints.invites.stats);
      return data;
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateInviteRequest) => {
      const { data } = await apiClient.post<Invite>(endpoints.invites.create, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.stats() });
    },
  });
}

export function useValidateInvite(code: string) {
  return useQuery({
    queryKey: queryKeys.invites.validate(code),
    queryFn: async () => {
      const { data } = await apiClient.get(endpoints.invites.validate(code));
      return data;
    },
    enabled: !!code && code.length === 8,
    retry: false,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await apiClient.post(endpoints.invites.accept(code));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.stats() });
    },
  });
}
