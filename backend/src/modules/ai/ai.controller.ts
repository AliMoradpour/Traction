import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AIService } from './ai.service';
import { DailyBriefService } from './daily-brief.service';
import { TaskBreakdownService } from './task-breakdown.service';
import { StuckAnalysisService, StuckFeeling } from './stuck-analysis.service';
import { WeeklyReviewService } from './weekly-review.service';
import { GoalRecoveryService } from './goal-recovery.service';
import { AIRateLimitService } from './ai-rate-limit.service';
import { AIObservabilityService } from './ai-observability.service';
import {
  AIRecommendationResponseDto,
  AIUsageSummaryDto,
  AIUsageByFeatureDto,
  AIUsageByDayDto,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly dailyBriefService: DailyBriefService,
    private readonly taskBreakdownService: TaskBreakdownService,
    private readonly stuckAnalysisService: StuckAnalysisService,
    private readonly weeklyReviewService: WeeklyReviewService,
    private readonly goalRecoveryService: GoalRecoveryService,
    private readonly rateLimitService: AIRateLimitService,
    private readonly observabilityService: AIObservabilityService,
  ) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI recommendations' })
  @ApiResponse({
    status: 200,
    description: 'List of recommendations',
    type: [AIRecommendationResponseDto],
  })
  async getRecommendations(
    @CurrentUser('id') userId: string,
  ): Promise<AIRecommendationResponseDto[]> {
    return this.aiService.getRecommendations(userId);
  }

  @Post('recommendations/generate')
  @ApiOperation({ summary: 'Generate new AI recommendation' })
  @ApiResponse({
    status: 201,
    description: 'Recommendation generated',
    type: AIRecommendationResponseDto,
  })
  async generateRecommendation(
    @CurrentUser('id') userId: string,
  ): Promise<AIRecommendationResponseDto | null> {
    return this.aiService.generateRecommendation(userId);
  }

  @Post('recommendations/:id/accept')
  @ApiOperation({ summary: 'Accept AI recommendation' })
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  @ApiResponse({
    status: 200,
    description: 'Recommendation accepted',
    type: AIRecommendationResponseDto,
  })
  async acceptRecommendation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<AIRecommendationResponseDto> {
    return this.aiService.acceptRecommendation(userId, id);
  }

  @Post('recommendations/:id/dismiss')
  @ApiOperation({ summary: 'Dismiss AI recommendation' })
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  @ApiResponse({
    status: 200,
    description: 'Recommendation dismissed',
    type: AIRecommendationResponseDto,
  })
  async dismissRecommendation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<AIRecommendationResponseDto> {
    return this.aiService.dismissRecommendation(userId, id);
  }

  @Get('daily-brief')
  @ApiOperation({ summary: 'Get daily brief' })
  @ApiResponse({ status: 200, description: 'Daily brief generated' })
  async getDailyBrief(@CurrentUser('id') userId: string) {
    return this.dailyBriefService.getDailyBrief(userId);
  }

  @Post('breakdown-task/:taskId')
  @ApiOperation({ summary: 'Break down task into steps' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task breakdown' })
  async breakdownTask(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) {
    return this.taskBreakdownService.breakdownTask(userId, taskId);
  }

  @Post('stuck-analysis')
  @ApiOperation({ summary: 'Analyze why user is stuck' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { feeling: { type: 'string' }, taskId: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Stuck analysis' })
  async stuckAnalysis(
    @CurrentUser('id') userId: string,
    @Body() body: { feeling: StuckFeeling; taskId?: string },
  ) {
    return this.stuckAnalysisService.analyzeStuck(userId, body.feeling, body.taskId);
  }

  @Get('weekly-review')
  @ApiOperation({ summary: 'Get weekly review' })
  @ApiResponse({ status: 200, description: 'Weekly review' })
  async getWeeklyReview(@CurrentUser('id') userId: string) {
    return this.weeklyReviewService.getWeeklyReview(userId);
  }

  @Post('goal-recovery/:goalId')
  @ApiOperation({ summary: 'Analyze goal recovery' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal recovery analysis' })
  async goalRecovery(@CurrentUser('id') userId: string, @Param('goalId') goalId: string) {
    return this.goalRecoveryService.analyzeGoalRecovery(userId, goalId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage stats' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  async getUsageStats(@CurrentUser('id') userId: string) {
    return this.rateLimitService.getUsageStats(userId);
  }

  @Get('usage/summary')
  @ApiOperation({ summary: 'Get AI usage summary' })
  @ApiResponse({
    status: 200,
    description: 'Usage summary with daily/monthly counts and cost',
    type: AIUsageSummaryDto,
  })
  async getUsageSummary(@CurrentUser('id') userId: string): Promise<AIUsageSummaryDto> {
    return this.observabilityService.getUsageSummary(userId);
  }

  @Get('usage/by-feature')
  @ApiOperation({ summary: 'Get AI usage breakdown by feature' })
  @ApiResponse({
    status: 200,
    description: 'Usage breakdown by feature',
    type: [AIUsageByFeatureDto],
  })
  async getUsageByFeature(@CurrentUser('id') userId: string): Promise<AIUsageByFeatureDto[]> {
    return this.observabilityService.getUsageByFeature(userId);
  }

  @Get('usage/by-day')
  @ApiOperation({ summary: 'Get AI usage by day' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to include (default: 7)',
  })
  @ApiResponse({ status: 200, description: 'Daily usage trend', type: [AIUsageByDayDto] })
  async getUsageByDay(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ): Promise<AIUsageByDayDto[]> {
    return this.observabilityService.getUsageByDay(userId, days || 7);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get AI metrics' })
  @ApiResponse({ status: 200, description: 'AI metrics' })
  async getMetrics() {
    return this.observabilityService.getMetrics();
  }

  @Get('status')
  @ApiOperation({ summary: 'Check AI service status' })
  @ApiResponse({ status: 200, description: 'AI service status' })
  async getStatus(): Promise<{ configured: boolean }> {
    return { configured: this.aiService.isConfigured() };
  }
}
