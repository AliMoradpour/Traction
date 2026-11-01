import { apiClient, endpoints } from '@/api';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  aiPersonality: 'DIRECT' | 'BALANCED' | 'GENTLE';
  deepWorkMode: 'INTENSE' | 'MODERATE' | 'RELAXED';
  notificationDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  aiAutoScheduling: boolean;
  workStartHour: number;
  workEndHour: number;
  workDays: string;
  energyPeakStart: number;
  energyPeakEnd: number;
  sleepSync: boolean;
  focusBreakInterval: number;
  primaryGoal: string | null;
  experienceLevel: string | null;
  dailyTimeBudget: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Writable preference fields (matches the backend UpdatePreferencesDto). */
export type UpdatePreferencesInput = Partial<
  Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'onboardingCompletedAt'>
> & { onboardingComplete?: boolean };

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(endpoints.users.me);
    return response.data;
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; avatar?: string }): Promise<UserProfile> => {
    const response = await apiClient.patch(endpoints.users.me, data);
    return response.data;
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get(endpoints.users.preferences);
    return response.data;
  },

  updatePreferences: async (data: UpdatePreferencesInput): Promise<UserPreferences> => {
    const response = await apiClient.patch(endpoints.users.preferences, data);
    return response.data;
  },
};
