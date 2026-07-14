import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalType, GoalStatus, GoalHealth, MilestoneStatus, PlanStatus } from '@prisma/client';

export class CreateGoalDto {
  @ApiProperty({ example: 'Complete IELTS with band 7+' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Prepare and take IELTS exam' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: GoalType, example: GoalType.IELTS })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiPropertyOptional({ example: 'Education' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string;
}

export class UpdateGoalDto {
  @ApiPropertyOptional({ example: 'Updated goal title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: GoalType })
  @IsEnum(GoalType)
  @IsOptional()
  type?: GoalType;

  @ApiPropertyOptional({ example: 'Education' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @ApiPropertyOptional({ example: 45, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ enum: GoalStatus })
  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;

  @ApiPropertyOptional({ enum: GoalHealth })
  @IsEnum(GoalHealth)
  @IsOptional()
  health?: GoalHealth;

  @ApiPropertyOptional({ example: 'stable' })
  @IsString()
  @IsOptional()
  velocity?: string;
}

export class GoalQueryDto {
  @ApiPropertyOptional({ enum: GoalStatus })
  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;

  @ApiPropertyOptional({ enum: GoalType })
  @IsEnum(GoalType)
  @IsOptional()
  type?: GoalType;

  @ApiPropertyOptional({ example: 'Education' })
  @IsString()
  @IsOptional()
  category?: string;
}

export class GoalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: GoalType })
  type: GoalType;

  @ApiProperty()
  category?: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  targetDate?: Date;

  @ApiProperty()
  completedAt?: Date;

  @ApiProperty()
  progress: number;

  @ApiProperty({ enum: GoalStatus })
  status: GoalStatus;

  @ApiProperty({ enum: GoalHealth })
  health: GoalHealth;

  @ApiProperty()
  velocity?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateMilestoneDto {
  @ApiProperty({ example: 'Complete Practice Test 1' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Score 6.5+ on practice test' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-08-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string;
}

export class UpdateMilestoneDto {
  @ApiPropertyOptional({ example: 'Updated milestone title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-08-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @ApiPropertyOptional({ example: 50, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ enum: MilestoneStatus })
  @IsEnum(MilestoneStatus)
  @IsOptional()
  status?: MilestoneStatus;
}

export class MilestoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  goalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  targetDate?: Date;

  @ApiProperty()
  completedAt?: Date;

  @ApiProperty()
  progress: number;

  @ApiProperty({ enum: MilestoneStatus })
  status: MilestoneStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreatePlanDto {
  @ApiProperty({ example: 'Study Plan for IELTS' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'A structured plan to prepare for IELTS' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '["Step 1: Vocabulary", "Step 2: Grammar"]' })
  @IsString()
  @IsOptional()
  steps?: string;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Updated plan title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '["Step 1: Updated"]' })
  @IsString()
  @IsOptional()
  steps?: string;

  @ApiPropertyOptional({ enum: PlanStatus })
  @IsEnum(PlanStatus)
  @IsOptional()
  status?: PlanStatus;
}

export class PlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  goalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  steps?: string;

  @ApiProperty()
  recommendedAt?: Date;

  @ApiProperty()
  appliedAt?: Date;

  @ApiProperty({ enum: PlanStatus })
  status: PlanStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
