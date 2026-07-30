import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus, EnergyLevel } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Review design mockups' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Review the latest design mockups for the landing page' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ example: 'Design' })
  @IsString()
  @IsOptional()
  category?: string | null;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number | null;

  @ApiPropertyOptional({ example: 25, description: 'Friction score 0-100' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  friction?: number | null;

  @ApiPropertyOptional({ enum: EnergyLevel, default: EnergyLevel.MEDIUM })
  @IsEnum(EnergyLevel)
  @IsOptional()
  energy?: EnergyLevel;

  @ApiPropertyOptional({ example: '2026-07-10T09:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string | null;

  @ApiPropertyOptional({ example: '2026-07-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueAt?: string | null;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string | null;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Review design mockups - Updated' })
  @IsString()
  @IsOptional()
  title?: string | null;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ example: 'Design' })
  @IsString()
  @IsOptional()
  category?: string | null;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 45, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number | null;

  @ApiPropertyOptional({ example: 30, description: 'Friction score 0-100' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  friction?: number | null;

  @ApiPropertyOptional({ enum: EnergyLevel })
  @IsEnum(EnergyLevel)
  @IsOptional()
  energy?: EnergyLevel;

  @ApiPropertyOptional({ example: '2026-07-10T09:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string | null;

  @ApiPropertyOptional({ example: '2026-07-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueAt?: string | null;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string | null;
}

export class TaskQueryDto {
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 'Design' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: '2026-07-10' })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string;
}

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string | null;

  @ApiProperty()
  category?: string | null;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty()
  duration?: number | null;

  @ApiProperty()
  friction?: number | null;

  @ApiProperty({ enum: EnergyLevel })
  energy: EnergyLevel;

  @ApiProperty()
  scheduledAt?: Date | null;

  @ApiProperty()
  dueAt?: Date | null;

  @ApiProperty()
  completedAt?: Date | null;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty()
  goalId?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
