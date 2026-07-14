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
  description?: string | null;

  @ApiProperty({ enum: GoalType, example: GoalType.IELTS })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiPropertyOptional({ example: 'Education' })
  @IsString()
  @IsOptional()
  category?: string | null;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string | null;
}

export class UpdateGoalDto {
  @ApiPropertyOptional({ example: 'Updated goal title' })
  @IsString()
  @IsOptional()
  title?: string | null;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ enum: GoalType })
  @IsEnum(GoalType)
  @IsOptional()
  type?: GoalType;

  @ApiPropertyOptional({ example: 'Education' })
  @IsString()
  @IsOptional()
  category?: string | null;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string | null;

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
  velocity?: string | null;
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
  category?: string | null;
}

export class GoalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string | null;

  @ApiProperty({ enum: GoalType })
  type: GoalType;

  @ApiProperty()
  category?: string | null;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  targetDate?: Date | null;

  @ApiProperty()
  completedAt?: Date | null;

  @ApiProperty()
  progress: number;

  @ApiProperty({ enum: GoalStatus })
  status: GoalStatus;

  @ApiProperty({ enum: GoalHealth })
  health: GoalHealth;

  @ApiProperty()
  velocity?: string | null;

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
  description?: string | null;

  @ApiPropertyOptional({ example: '2026-08-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string | null;
}

export class UpdateMilestoneDto {
  @ApiPropertyOptional({ example: 'Updated milestone title' })
  @IsString()
  @IsOptional()
  title?: string | null;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ example: '2026-08-15T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  targetDate?: string | null;

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
  description?: string | null;

  @ApiProperty()
  targetDate?: Date | null;

  @ApiProperty()
  completedAt?: Date | null;

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
  description?: string | null;

  @ApiPropertyOptional({ example: '["Step 1: Vocabulary", "Step 2: Grammar"]' })
  @IsString()
  @IsOptional()
  steps?: string | null;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Updated plan title' })
  @IsString()
  @IsOptional()
  title?: string | null;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ example: '["Step 1: Updated"]' })
  @IsString()
  @IsOptional()
  steps?: string | null;

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
  description?: string | null;

  @ApiProperty()
  steps?: string | null;

  @ApiProperty()
  recommendedAt?: Date | null;

  @ApiProperty()
  appliedAt?: Date | null;

  @ApiProperty({ enum: PlanStatus })
  status: PlanStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
