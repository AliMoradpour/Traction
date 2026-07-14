import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AIPersonality, DeepWorkMode, NotificationDensity } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string | null;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: AIPersonality })
  @IsEnum(AIPersonality)
  @IsOptional()
  aiPersonality?: AIPersonality;

  @ApiPropertyOptional({ enum: DeepWorkMode })
  @IsEnum(DeepWorkMode)
  @IsOptional()
  deepWorkMode?: DeepWorkMode;

  @ApiPropertyOptional({ enum: NotificationDensity })
  @IsEnum(NotificationDensity)
  @IsOptional()
  notificationDensity?: NotificationDensity;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  aiAutoScheduling?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 23 })
  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  workStartHour?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 23 })
  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  workEndHour?: number;

  @ApiPropertyOptional({ example: 'mon,tue,wed,thu,fri' })
  @IsString()
  @IsOptional()
  workDays?: string | null;

  @ApiPropertyOptional({ minimum: 0, maximum: 23 })
  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  energyPeakStart?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 23 })
  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  energyPeakEnd?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  sleepSync?: boolean;

  @ApiPropertyOptional({ minimum: 15, maximum: 180 })
  @IsInt()
  @Min(15)
  @Max(180)
  @IsOptional()
  focusBreakInterval?: number;
}

export class UserProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: AIPersonality })
  aiPersonality: AIPersonality;

  @ApiProperty({ enum: DeepWorkMode })
  deepWorkMode: DeepWorkMode;

  @ApiProperty({ enum: NotificationDensity })
  notificationDensity: NotificationDensity;

  @ApiProperty()
  aiAutoScheduling: boolean;

  @ApiProperty()
  workStartHour: number;

  @ApiProperty()
  workEndHour: number;

  @ApiProperty()
  workDays: string;

  @ApiProperty()
  energyPeakStart: number;

  @ApiProperty()
  energyPeakEnd: number;

  @ApiProperty()
  sleepSync: boolean;

  @ApiProperty()
  focusBreakInterval: number;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName?: string | null;

  @ApiProperty()
  lastName?: string | null;

  @ApiProperty()
  avatar?: string | null;

  @ApiProperty()
  createdAt: Date;
}
