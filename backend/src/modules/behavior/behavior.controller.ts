import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BehaviorService } from './behavior.service';
import { TrackEventDto, BehaviorEventResponseDto, BehaviorQueryDto } from './dto/behavior.dto';
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
  @ApiResponse({ status: 200, description: 'List of behavior events', type: [BehaviorEventResponseDto] })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: BehaviorQueryDto,
  ): Promise<BehaviorEventResponseDto[]> {
    return this.behaviorService.findAll(userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get behavior stats' })
  @ApiResponse({ status: 200, description: 'Behavior statistics' })
  async getStats(
    @CurrentUser('id') userId: string,
  ): Promise<any> {
    return this.behaviorService.getStats(userId);
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
