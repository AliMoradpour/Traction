export { taskService } from './task.service';
export { goalService } from './goal.service';
export { insightService } from './insight.service';
export { aiService } from './ai.service';
export type {
  AIRecommendation,
  AIUsageSummary,
  AIUsageByFeature,
  AIUsageByDay,
} from './ai.service';
export { focusService } from './focus.service';
export { notificationService } from './notification.service';
export { behaviorService } from './behavior.service';
export { executionService } from './execution.service';
export { userService } from './user.service';

export type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStep,
} from './task.service';

export type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalMilestone,
  GoalPlan,
  GoalFeasibility,
  GoalProjection,
} from './goal.service';

export type {
  Insight,
  DailyBrief,
  BehavioralAwareness,
  WeeklyReview,
} from './insight.service';

export type {
  FocusSession,
} from './focus.service';

export type {
  Notification,
  NotificationPreferences,
} from './notification.service';

export type {
  BehaviorEvent,
  BehaviorStats,
} from './behavior.service';

export type {
  ReadinessScore,
  ResistanceDetection,
  MomentumMetrics,
  ExecutionStats,
} from './execution.service';

export type {
  UserProfile,
  UserPreferences,
} from './user.service';
