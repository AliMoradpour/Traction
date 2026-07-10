import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { AIRecommendationResponseDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI recommendations' })
  @ApiResponse({ status: 200, description: 'List of recommendations', type: [AIRecommendationResponseDto] })
  async getRecommendations(
    @CurrentUser('id') userId: string,
  ): Promise<AIRecommendationResponseDto[]> {
    return this.aiService.getRecommendations(userId);
  }

  @Post('recommendations/:id/accept')
  @ApiOperation({ summary: 'Accept AI recommendation' })
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Recommendation accepted', type: AIRecommendationResponseDto })
  async acceptRecommendation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<AIRecommendationResponseDto> {
    return this.aiService.acceptRecommendation(userId, id);
  }

  @Post('recommendations/:id/dismiss')
  @ApiOperation({ summary: 'Dismiss AI recommendation' })
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Recommendation dismissed', type: AIRecommendationResponseDto })
  async dismissRecommendation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<AIRecommendationResponseDto> {
    return this.aiService.dismissRecommendation(userId, id);
  }
}
