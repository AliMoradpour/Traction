import { apiClient, endpoints } from '@/api';

export type GoalType = 'IELTS' | 'PROGRAMMING' | 'FITNESS' | 'SAVINGS' | 'CUSTOM';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'PAUSED';
export type GoalHealth = 'ON_TRACK' | 'SLIGHTLY_BEHIND' | 'BEHIND_SCHEDULE' | 'RECOVERY_NEEDED' | 'AT_RISK';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'IELTS' | 'PROGRAMMING' | 'FITNESS' | 'SAVINGS' | 'CUSTOM';
  category?: string;
  startDate: string;
  targetDate?: string;
  completedAt?: string;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'PAUSED';
  health: 'ON_TRACK' | 'SLIGHTLY_BEHIND' | 'BEHIND_SCHEDULE' | 'RECOVERY_NEEDED' | 'AT_RISK';
  velocity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  type: 'IELTS' | 'PROGRAMMING' | 'FITNESS' | 'SAVINGS' | 'CUSTOM';
  category?: string;
  targetDate?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  type?: 'IELTS' | 'PROGRAMMING' | 'FITNESS' | 'SAVINGS' | 'CUSTOM';
  category?: string;
  targetDate?: string;
  progress?: number;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'PAUSED';
  health?: 'ON_TRACK' | 'SLIGHTLY_BEHIND' | 'BEHIND_SCHEDULE' | 'RECOVERY_NEEDED' | 'AT_RISK';
  velocity?: string;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  targetDate?: string;
  completedAt?: string;
  progress: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  createdAt: string;
  updatedAt: string;
}

export interface GoalPlan {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  steps?: string;
  recommendedAt?: string;
  appliedAt?: string;
  status: 'PENDING' | 'APPLIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface GoalFeasibility {
  goalId: string;
  /** 0-1 chance of finishing by the target date; null when the goal has no target date. */
  probability: number | null;
  confidence: 'low' | 'medium' | 'high';
  readiness: 'low' | 'medium' | 'high';
  onTrack: boolean | null;
  timeline: string;
  recommendation: string;
  progress: number;
  daysElapsed: number;
  daysRemaining: number | null;
  /** Percentage points of progress per day. */
  currentPace: number;
  requiredPace: number | null;
  projectedDaysToFinish: number | null;
  projectedCompletionDate: string | null;
}

export interface GoalProjection {
  goalId: string;
  health: string;
  progress: number;
  velocity?: string;
  targetDate?: string;
  daysRemaining: number | null;
  currentPace: number;
  requiredPace: number | null;
  projectedCompletionDate: string | null;
  forecast: string;
  alternativeScenario: string;
}

export const goalService = {
  list: async (params?: { status?: string; type?: string; category?: string }): Promise<Goal[]> => {
    const response = await apiClient.get(endpoints.goals.list, { params });
    return response.data;
  },

  detail: async (id: string): Promise<Goal> => {
    const response = await apiClient.get(endpoints.goals.detail(id));
    return response.data;
  },

  create: async (data: CreateGoalRequest): Promise<Goal> => {
    const response = await apiClient.post(endpoints.goals.list, data);
    return response.data;
  },

  update: async (id: string, data: UpdateGoalRequest): Promise<Goal> => {
    const response = await apiClient.patch(endpoints.goals.detail(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.goals.detail(id));
  },

  archive: async (id: string): Promise<Goal> => {
    const response = await apiClient.patch(endpoints.goals.archive(id));
    return response.data;
  },

  feasibility: async (id: string): Promise<GoalFeasibility | null> => {
    try {
      const response = await apiClient.get(endpoints.goals.feasibility(id));
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to fetch goal feasibility:', error);
      return null;
    }
  },

  projection: async (id: string): Promise<GoalProjection | null> => {
    try {
      const response = await apiClient.get(endpoints.goals.projection(id));
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to fetch goal projection:', error);
      return null;
    }
  },

  getMilestones: async (goalId: string): Promise<GoalMilestone[]> => {
    const response = await apiClient.get(endpoints.goals.milestones(goalId));
    return response.data;
  },

  createMilestone: async (goalId: string, data: { title: string; description?: string; targetDate?: string }): Promise<GoalMilestone> => {
    const response = await apiClient.post(endpoints.goals.milestones(goalId), data);
    return response.data;
  },

  updateMilestone: async (goalId: string, milestoneId: string, data: Partial<GoalMilestone>): Promise<GoalMilestone> => {
    const response = await apiClient.patch(endpoints.goals.milestoneDetail(goalId, milestoneId), data);
    return response.data;
  },

  deleteMilestone: async (goalId: string, milestoneId: string): Promise<void> => {
    await apiClient.delete(endpoints.goals.milestoneDetail(goalId, milestoneId));
  },

  getPlans: async (goalId: string): Promise<GoalPlan[]> => {
    const response = await apiClient.get(endpoints.goals.plans(goalId));
    return response.data;
  },

  createPlan: async (goalId: string, data: { title: string; description?: string; steps?: string }): Promise<GoalPlan> => {
    const response = await apiClient.post(endpoints.goals.plans(goalId), data);
    return response.data;
  },

  updatePlan: async (goalId: string, planId: string, data: Partial<GoalPlan>): Promise<GoalPlan> => {
    const response = await apiClient.patch(endpoints.goals.planDetail(goalId, planId), data);
    return response.data;
  },

  deletePlan: async (goalId: string, planId: string): Promise<void> => {
    await apiClient.delete(endpoints.goals.planDetail(goalId, planId));
  },

  getHealth: async (goalId: string): Promise<any> => {
    const response = await apiClient.get(endpoints.goalHealth.detail(goalId));
    return response.data;
  },

  recalculateHealth: async (goalId: string): Promise<any> => {
    const response = await apiClient.post(endpoints.goalHealth.recalculate(goalId));
    return response.data;
  },
};
