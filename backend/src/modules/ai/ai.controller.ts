import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
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

  @Post('recommendations/generate')
  @ApiOperation({ summary: 'Generate new AI recommendation' })
  @ApiResponse({ status: 201, description: 'Recommendation generated', type: AIRecommendationResponseDto })
  async generateRecommendation(
    @CurrentUser('id') userId: string,
  ): Promise<AIRecommendationResponseDto | null> {
    return this.aiService.generateRecommendation(userId);
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

  @Post('analyze-goal')
  @ApiOperation({ summary: 'Analyze goal feasibility using AI' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, deadline: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Goal analysis' })
  async analyzeGoalFeasibility(
    @CurrentUser('id') userId: string,
    @Body() body: { title: string; deadline?: string },
  ): Promise<{ feasible: boolean; reason: string; suggestions: string[] } | null> {
    return this.aiService.analyzeGoalFeasibility(body.title, body.deadline);
  }

  @Post('breakdown-task')
  @ApiOperation({ summary: 'Break down task into steps using AI' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Task breakdown' })
  async breakdownTask(
    @CurrentUser('id') userId: string,
    @Body() body: { title: string; description?: string },
  ): Promise<Array<{ title: string }> | null> {
    return this.aiService.generateTaskBreakdown(body.title, body.description);
  }

  @Post('simplify-task')
  @ApiOperation({ summary: 'Simplify resistant task using AI' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' }, resistanceLevel: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'Simplified task' })
  async simplifyTask(
    @CurrentUser('id') userId: string,
    @Body() body: { title: string; resistanceLevel: number },
  ): Promise<{ simplifiedTitle: string; firstStep: string; motivation: string } | null> {
    return this.aiService.simplifyTask(body.title, body.resistanceLevel);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check AI service status' })
  @ApiResponse({ status: 200, description: 'AI service status' })
  async getStatus(): Promise<{ configured: boolean }> {
    return { configured: this.aiService.isConfigured() };
  }
}
