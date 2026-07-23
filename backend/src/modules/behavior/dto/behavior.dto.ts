import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BehaviorEventType } from '@prisma/client';

export class TrackEventDto {
  @ApiProperty({ enum: BehaviorEventType, example: BehaviorEventType.TASK_COMPLETED })
  @IsEnum(BehaviorEventType)
  type: BehaviorEventType;

  @ApiPropertyOptional({ example: 'task-id-123' })
  @IsString()
  @IsOptional()
  taskId?: string | null;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string | null;

  @ApiPropertyOptional({ example: 'focus-session-id-123' })
  @IsString()
  @IsOptional()
  focusSessionId?: string | null;

  @ApiPropertyOptional({ example: '{"reason": "task was too complex"}' })
  @IsString()
  @IsOptional()
  metadata?: string | null;

  @ApiPropertyOptional({ example: 'I was distracted by notifications' })
  @IsString()
  @IsOptional()
  value?: string | null;
}

export class BehaviorEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  taskId?: string | null;

  @ApiProperty()
  goalId?: string | null;

  @ApiProperty()
  focusSessionId?: string | null;

  @ApiProperty({ enum: BehaviorEventType })
  type: BehaviorEventType;

  @ApiProperty()
  metadata?: string | null;

  @ApiProperty()
  value?: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class BehaviorQueryDto {
  @ApiPropertyOptional({ enum: BehaviorEventType })
  @IsEnum(BehaviorEventType)
  @IsOptional()
  type?: BehaviorEventType;

  @ApiPropertyOptional({ example: 'task-id-123' })
  @IsString()
  @IsOptional()
  taskId?: string | null;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string | null;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-10' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class DailyMetricsQueryDto {
  @ApiPropertyOptional({ example: '2026-07-23', description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class WeeklyMetricsQueryDto {
  @ApiPropertyOptional({ example: '2026-07-21', description: 'Week start date in YYYY-MM-DD format' })
  @IsDateString()
  @IsOptional()
  weekStart?: string;
}

export class IndicatorsQueryDto {
  @ApiPropertyOptional({ example: 30, description: 'Number of days to analyze' })
  @IsOptional()
  days?: number;
}

export class DailyMetricsResponseDto {
  @ApiProperty() date: string;
  @ApiProperty() tasksPlanned: number;
  @ApiProperty() tasksCompleted: number;
  @ApiProperty() completionRate: number;
  @ApiProperty() averageStartDelay: number;
  @ApiProperty() averageCompletionDelay: number;
  @ApiProperty() deepWorkMinutes: number;
  @ApiProperty() focusSessions: number;
  @ApiProperty() eventsCount: number;
}

export class WeeklyMetricsResponseDto {
  @ApiProperty() weekStart: string;
  @ApiProperty() weekEnd: string;
  @ApiProperty() consistency: number;
  @ApiProperty() weeklyCompletion: number;
  @ApiProperty() missedTasks: number;
  @ApiProperty() delayedTasks: number;
  @ApiProperty() planningAccuracy: number;
  @ApiProperty() averageDailyOutput: number;
}

export class BehaviorIndicatorsResponseDto {
  @ApiProperty() consistencyScore: number;
  @ApiProperty() executionScore: number;
  @ApiProperty() reliabilityScore: number;
  @ApiProperty() planningAccuracy: number;
  @ApiProperty() momentumScore: number;
  @ApiProperty() recoveryScore: number;
}

export class BurnoutRiskResponseDto {
  @ApiProperty() level: string;
  @ApiProperty() score: number;
  @ApiProperty() signals: string[];
  @ApiProperty() trend: string;
}

export class ProcrastinationProfileResponseDto {
  @ApiProperty() score: number;
  @ApiProperty() patterns: string[];
  @ApiProperty() peakProcrastinationTime: string;
  @ApiProperty() commonReasons: string[];
  @ApiProperty() frequency: number;
}
