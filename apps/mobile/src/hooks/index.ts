export { useTheme } from '@/providers/ThemeProvider';
export * from './useAuth';
export * from './useTasks';
export * from './useGoals';
export * from './useInsights';
export * from './useFocus';
export * from './useNotifications';
export * from './useUser';
export { useConnectivity, useOnlineStatus } from './useConnectivity';
export * from './useBehavior';
export * from './useExecution';
export {
  useAIRecommendations,
  useAIStatus,
  useGenerateRecommendation,
  useAcceptRecommendation,
  useDismissRecommendation,
  useBreakdownTask,
  useStuckAnalysis,
  useGoalRecovery,
} from './useAI';
export { useAdminDashboard, useAdminUsers, useUpdateUserRole } from './useAdmin';
