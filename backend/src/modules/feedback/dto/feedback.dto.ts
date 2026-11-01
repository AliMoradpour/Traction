import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeedbackTypeDto {
  BUG = 'bug',
  FEATURE = 'feature',
  GENERAL = 'general',
}

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Client-generated id used to de-duplicate retries' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  clientId: string;

  @ApiProperty({ enum: FeedbackTypeDto })
  @IsEnum(FeedbackTypeDto)
  type: FeedbackTypeDto;

  @ApiProperty({ example: 'The Goals tab crashes when I swipe back' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({ example: '/goals' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  screen?: string;
}
