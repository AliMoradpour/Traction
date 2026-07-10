import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AIRecommendationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  sourceType: string;

  @ApiProperty()
  sourceId: string;

  @ApiProperty()
  kind: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  payload: string;

  @ApiProperty()
  acceptedAt?: Date;

  @ApiProperty()
  dismissedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}
