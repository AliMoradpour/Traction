import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus, EnergyLevel } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Review design mockups' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Review the latest design mockups for the landing page' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Design' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 25, description: 'Friction score 0-100' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  friction?: number;

  @ApiPropertyOptional({ enum: EnergyLevel, default: EnergyLevel.MEDIUM })
  @IsEnum(EnergyLevel)
  @IsOptional()
  energy?: EnergyLevel;

  @ApiPropertyOptional({ example: '2026-07-10T09:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: '2026-07-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueAt?: string;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Review design mockups - Updated' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Design' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 45, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 30, description: 'Friction score 0-100' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  friction?: number;

  @ApiPropertyOptional({ enum: EnergyLevel })
  @IsEnum(EnergyLevel)
  @IsOptional()
  energy?: EnergyLevel;

  @ApiPropertyOptional({ example: '2026-07-10T09:00:00Z' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: '2026-07-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueAt?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string;
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
  description?: string;

  @ApiProperty()
  category?: string;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty()
  duration?: number;

  @ApiProperty()
  friction?: number;

  @ApiProperty({ enum: EnergyLevel })
  energy: EnergyLevel;

  @ApiProperty()
  scheduledAt?: Date;

  @ApiProperty()
  dueAt?: Date;

  @ApiProperty()
  completedAt?: Date;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty()
  goalId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
