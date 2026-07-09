export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  onboardingStatus: 'pending' | 'inProgress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  aiPersonality: string;
  deepWorkMode: boolean;
  notificationDensity: 'low' | 'medium' | 'high';
  wakeWindow: string;
  energyPeakStart: string;
  energyPeakEnd: string;
  preferredWorkStyle: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  error: null;
}

export interface ApiError {
  data: null;
  meta: Record<string, unknown>;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';
