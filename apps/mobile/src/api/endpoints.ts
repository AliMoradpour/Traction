export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/password/forgot',
    resetPassword: '/auth/password/reset',
    me: '/auth/me',
  },
  users: {
    me: '/users/me',
    preferences: '/users/me/preferences',
  },
  tasks: {
    list: '/tasks',
    detail: (id: string) => `/tasks/${id}`,
    steps: (id: string) => `/tasks/${id}/steps`,
    focusSessions: (id: string) => `/tasks/${id}/focus-sessions`,
    simplify: (id: string) => `/tasks/${id}/simplify`,
  },
  goals: {
    list: '/goals',
    detail: (id: string) => `/goals/${id}`,
    feasibility: (id: string) => `/goals/${id}/feasibility`,
    projection: (id: string) => `/goals/${id}/projection`,
  },
  insights: {
    dailyBrief: '/insights/daily-brief',
    behavioralAwareness: '/insights/behavioral-awareness',
    weeklyReview: '/insights/weekly-review',
  },
  ai: {
    recommendations: '/ai/recommendations',
  },
  notifications: {
    preferences: '/notifications/preferences',
  },
} as const;
