import { IsString, IsOptional, IsEnum, IsInt, Min, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FocusStatus } from '@prisma/client';

export class StartFocusSessionDto {
  @ApiPropertyOptional({ example: 'task-id-123' })
  @IsString()
  @IsOptional()
  taskId?: string;
}

export class FocusSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  taskId?: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  endedAt?: Date;

  @ApiProperty()
  duration?: number;

  @ApiProperty({ enum: FocusStatus })
  status: FocusStatus;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FocusQueryDto {
  @ApiPropertyOptional({ enum: FocusStatus })
  @IsEnum(FocusStatus)
  @IsOptional()
  status?: FocusStatus;

  @ApiPropertyOptional({ example: 'task-id-123' })
  @IsString()
  @IsOptional()
  taskId?: string;
}
