import { ApiProperty } from '@nestjs/swagger';

export class ReadinessResponseDto {
  @ApiProperty({ description: 'Overall readiness score (0-100)' })
  score: number;

  @ApiProperty({ description: 'Individual factor contributions', type: [String] })
  factors: string[];

  @ApiProperty({ description: 'Human-readable explanation' })
  explanation: string;
}

export class ResistanceResponseDto {
  @ApiProperty({ description: 'Resistance score (0-100, higher = more resistance)' })
  score: number;

  @ApiProperty({ description: 'Detected resistance patterns', type: [String] })
  patterns: string[];

  @ApiProperty({ description: 'Suggestions to overcome resistance', type: [String] })
  suggestions: string[];
}

export class MomentumResponseDto {
  @ApiProperty({ description: 'Consecutive days with at least 1 task completed' })
  currentStreak: number;

  @ApiProperty({ description: 'Consecutive days with at least 1 focus session' })
  executionStreak: number;

  @ApiProperty({ description: 'Consecutive days of improvement after a decline' })
  recoveryStreak: number;

  @ApiProperty({ description: 'This week completion rate vs last week (percentage)' })
  weeklyMomentum: number;

  @ApiProperty({ description: 'This month completion rate vs last month (percentage)' })
  monthlyMomentum: number;

  @ApiProperty({ description: 'Overall momentum trend', enum: ['improving', 'stable', 'declining'] })
  trend: 'improving' | 'stable' | 'declining';
}

export class ExecutionStatsResponseDto {
  @ApiProperty({ description: 'Total tasks completed all time' })
  totalTasksCompleted: number;

  @ApiProperty({ description: 'Tasks completed this week' })
  weeklyTasksCompleted: number;

  @ApiProperty({ description: 'Tasks completed today' })
  dailyTasksCompleted: number;

  @ApiProperty({ description: 'Total focus time in minutes (all time)' })
  totalFocusTime: number;

  @ApiProperty({ description: 'Focus time this week in minutes' })
  weeklyFocusTime: number;

  @ApiProperty({ description: 'Focus time today in minutes' })
  dailyFocusTime: number;

  @ApiProperty({ description: 'Average focus session duration in seconds' })
  averageSessionDuration: number;

  @ApiProperty({ description: 'Completion reliability percentage' })
  completionReliability: number;

  @ApiProperty({ description: 'Planning accuracy percentage' })
  planningAccuracy: number;
}
