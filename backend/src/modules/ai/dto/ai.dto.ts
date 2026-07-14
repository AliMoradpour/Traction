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

  @ApiProperty({ required: false })
  payload?: string | null;

  @ApiProperty({ required: false })
  acceptedAt?: Date | null;

  @ApiProperty({ required: false })
  dismissedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;
}
