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
  taskId?: string;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string;

  @ApiPropertyOptional({ example: 'focus-session-id-123' })
  @IsString()
  @IsOptional()
  focusSessionId?: string;

  @ApiPropertyOptional({ example: '{"reason": "task was too complex"}' })
  @IsString()
  @IsOptional()
  metadata?: string;

  @ApiPropertyOptional({ example: 'I was distracted by notifications' })
  @IsString()
  @IsOptional()
  value?: string;
}

export class BehaviorEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  taskId?: string;

  @ApiProperty()
  goalId?: string;

  @ApiProperty()
  focusSessionId?: string;

  @ApiProperty({ enum: BehaviorEventType })
  type: BehaviorEventType;

  @ApiProperty()
  metadata?: string;

  @ApiProperty()
  value?: string;

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
  taskId?: string;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-10' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
