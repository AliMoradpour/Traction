export const cacheConfig = {
  tasks: {
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  goals: {
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  focus: {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  },
  insights: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },
  notifications: {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  },
  behavior: {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },
  users: {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },
  ai: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },
  auth: {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },
} as const;
