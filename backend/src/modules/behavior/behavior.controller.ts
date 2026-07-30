import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BehaviorService } from './behavior.service';
import {
  TrackEventDto,
  BehaviorEventResponseDto,
  BehaviorQueryDto,
  DailyMetricsQueryDto,
  WeeklyMetricsQueryDto,
  IndicatorsQueryDto,
} from './dto/behavior.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('behavior')
@Controller('behavior')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Post()
  @ApiOperation({ summary: 'Track a behavior event' })
  @ApiResponse({ status: 201, description: 'Event tracked', type: BehaviorEventResponseDto })
  async track(
    @CurrentUser('id') userId: string,
    @Body() dto: TrackEventDto,
  ): Promise<BehaviorEventResponseDto> {
    return this.behaviorService.track(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get behavior history' })
  @ApiResponse({
    status: 200,
    description: 'List of behavior events',
    type: [BehaviorEventResponseDto],
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: BehaviorQueryDto,
  ): Promise<BehaviorEventResponseDto[]> {
    return this.behaviorService.findAll(userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get behavior stats' })
  @ApiResponse({ status: 200, description: 'Behavior statistics' })
  async getStats(@CurrentUser('id') userId: string): Promise<any> {
    return this.behaviorService.getStats(userId);
  }

  @Get('metrics/daily')
  @ApiOperation({ summary: 'Get daily behavior metrics' })
  @ApiResponse({ status: 200, description: 'Daily metrics' })
  async getDailyMetrics(
    @CurrentUser('id') userId: string,
    @Query() query: DailyMetricsQueryDto,
  ): Promise<any> {
    return this.behaviorService.getDailyMetrics(userId, query.date);
  }

  @Get('metrics/weekly')
  @ApiOperation({ summary: 'Get weekly behavior metrics' })
  @ApiResponse({ status: 200, description: 'Weekly metrics' })
  async getWeeklyMetrics(
    @CurrentUser('id') userId: string,
    @Query() query: WeeklyMetricsQueryDto,
  ): Promise<any> {
    return this.behaviorService.getWeeklyMetrics(userId, query.weekStart);
  }

  @Get('metrics/indicators')
  @ApiOperation({ summary: 'Get behavior indicators' })
  @ApiResponse({ status: 200, description: 'Behavior indicators (6 scores)' })
  async getIndicators(
    @CurrentUser('id') userId: string,
    @Query() query: IndicatorsQueryDto,
  ): Promise<any> {
    return this.behaviorService.getIndicators(userId, query.days);
  }

  @Get('metrics/burnout')
  @ApiOperation({ summary: 'Get burnout risk assessment' })
  @ApiResponse({ status: 200, description: 'Burnout risk level and signals' })
  async getBurnoutRisk(@CurrentUser('id') userId: string): Promise<any> {
    return this.behaviorService.getBurnoutRisk(userId);
  }

  @Get('metrics/procrastination')
  @ApiOperation({ summary: 'Get procrastination profile' })
  @ApiResponse({ status: 200, description: 'Procrastination patterns and score' })
  async getProcrastinationProfile(@CurrentUser('id') userId: string): Promise<any> {
    return this.behaviorService.getProcrastinationProfile(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get behavior event by id' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event details', type: BehaviorEventResponseDto })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<BehaviorEventResponseDto> {
    return this.behaviorService.findOne(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete behavior event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.behaviorService.remove(userId, id);
  }
}
