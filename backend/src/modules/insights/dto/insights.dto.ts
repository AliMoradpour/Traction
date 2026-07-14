import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InsightType } from '@prisma/client';

export class InsightQueryDto {
  @ApiPropertyOptional({ enum: InsightType })
  @IsEnum(InsightType)
  @IsOptional()
  type?: InsightType;

  @ApiPropertyOptional({ example: 'goal-id-123' })
  @IsString()
  @IsOptional()
  goalId?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  dismissed?: boolean;
}

export class InsightResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  goalId?: string | null;

  @ApiProperty({ enum: InsightType })
  type: InsightType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  data?: string | null;

  @ApiProperty()
  generatedBy?: string | null;

  @ApiProperty()
  confidence?: number | null;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  dismissed: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
