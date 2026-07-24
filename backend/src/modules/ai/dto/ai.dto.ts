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

export class AIUsageSummaryDto {
  @ApiProperty({ description: 'Number of requests today' })
  dailyRequests: number;

  @ApiProperty({ description: 'Number of requests this month' })
  monthlyRequests: number;

  @ApiProperty({ description: 'Total tokens used this month' })
  totalTokens: number;

  @ApiProperty({ description: 'Estimated cost in USD' })
  estimatedCost: number;
}

export class AIUsageByFeatureDto {
  @ApiProperty({ description: 'Feature name' })
  feature: string;

  @ApiProperty({ description: 'Number of requests' })
  requests: number;

  @ApiProperty({ description: 'Tokens used' })
  tokens: number;

  @ApiProperty({ description: 'Percentage of total requests' })
  percentage: number;
}

export class AIUsageByDayDto {
  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ description: 'Number of requests' })
  requests: number;

  @ApiProperty({ description: 'Tokens used' })
  tokens: number;
}
