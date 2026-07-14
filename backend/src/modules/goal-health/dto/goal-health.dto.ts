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
  velocity?: string | null;

  @ApiProperty()
  targetDate?: Date | null;

  @ApiProperty()
  daysRemaining?: number | null;

  @ApiProperty()
  estimatedCompletion?: string | null;

  @ApiProperty()
  recommendation?: string | null;
}
