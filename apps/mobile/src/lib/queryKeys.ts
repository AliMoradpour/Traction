export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  users: {
    all: ['users'] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
    preferences: () => [...queryKeys.users.all, 'preferences'] as const,
  },

  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.tasks.lists(), params] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    steps: (id: string) => [...queryKeys.tasks.all, 'steps', id] as const,
    focusSessions: (id: string) => [...queryKeys.tasks.all, 'focusSessions', id] as const,
    byDate: (date: string) => [...queryKeys.tasks.all, 'byDate', date] as const,
  },

  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.goals.lists(), params] as const,
    details: () => [...queryKeys.goals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.goals.details(), id] as const,
    milestones: (id: string) => [...queryKeys.goals.all, 'milestones', id] as const,
    plans: (id: string) => [...queryKeys.goals.all, 'plans', id] as const,
    feasibility: (id: string) => [...queryKeys.goals.all, 'feasibility', id] as const,
    projection: (id: string) => [...queryKeys.goals.all, 'projection', id] as const,
    health: (id: string) => [...queryKeys.goals.all, 'health', id] as const,
  },

  focus: {
    all: ['focus'] as const,
    lists: () => [...queryKeys.focus.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.focus.lists(), params] as const,
    details: () => [...queryKeys.focus.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.focus.details(), id] as const,
    active: () => [...queryKeys.focus.all, 'active'] as const,
  },

  insights: {
    all: ['insights'] as const,
    lists: () => [...queryKeys.insights.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.insights.lists(), params] as const,
    details: () => [...queryKeys.insights.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.insights.details(), id] as const,
    dailyBrief: () => [...queryKeys.insights.all, 'dailyBrief'] as const,
    behavioralAwareness: () => [...queryKeys.insights.all, 'behavioralAwareness'] as const,
    weeklyReview: () => [...queryKeys.insights.all, 'weeklyReview'] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.notifications.lists(), params] as const,
    details: () => [...queryKeys.notifications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.notifications.details(), id] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
  },

  behavior: {
    all: ['behavior'] as const,
    lists: () => [...queryKeys.behavior.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.behavior.lists(), params] as const,
    details: () => [...queryKeys.behavior.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.behavior.details(), id] as const,
    stats: () => [...queryKeys.behavior.all, 'stats'] as const,
  },

  execution: {
    all: ['execution'] as const,
    readiness: () => [...queryKeys.execution.all, 'readiness'] as const,
    resistance: () => [...queryKeys.execution.all, 'resistance'] as const,
    momentum: () => [...queryKeys.execution.all, 'momentum'] as const,
    stats: () => [...queryKeys.execution.all, 'stats'] as const,
  },

  ai: {
    all: ['ai'] as const,
    recommendations: () => [...queryKeys.ai.all, 'recommendations'] as const,
    dailyBrief: () => [...queryKeys.ai.all, 'dailyBrief'] as const,
    weeklyReview: () => [...queryKeys.ai.all, 'weeklyReview'] as const,
    usage: () => [...queryKeys.ai.all, 'usage'] as const,
    metrics: () => [...queryKeys.ai.all, 'metrics'] as const,
    status: () => [...queryKeys.ai.all, 'status'] as const,
  },

  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
    users: (page: number) => [...queryKeys.admin.all, 'users', page] as const,
  },
} as const;
