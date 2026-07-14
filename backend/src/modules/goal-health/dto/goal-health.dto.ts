import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalHealth } from '@prisma/client';

export class GoalHealthResponseDto {
  @ApiProperty()
  goalId: string;

  @ApiProperty({ enum: GoalHealth })
  health: GoalHealth;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  velocity?: string;

  @ApiProperty()
  targetDate?: Date;

  @ApiProperty()
  daysRemaining?: number;

  @ApiProperty()
  estimatedCompletion?: string;

  @ApiProperty()
  recommendation?: string;
}
