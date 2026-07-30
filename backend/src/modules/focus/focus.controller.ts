import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FocusService } from './focus.service';
import { StartFocusSessionDto, FocusSessionResponseDto, FocusQueryDto } from './dto/focus.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('focus')
@Controller('focus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a focus session' })
  @ApiResponse({ status: 201, description: 'Focus session started', type: FocusSessionResponseDto })
  async start(
    @CurrentUser('id') userId: string,
    @Body() dto: StartFocusSessionDto,
  ): Promise<FocusSessionResponseDto> {
    return this.focusService.start(userId, dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active focus session' })
  @ApiResponse({
    status: 200,
    description: 'Active session or null',
    type: FocusSessionResponseDto,
  })
  async getActive(@CurrentUser('id') userId: string): Promise<FocusSessionResponseDto | null> {
    return this.focusService.getActive(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all focus sessions' })
  @ApiResponse({
    status: 200,
    description: 'List of focus sessions',
    type: [FocusSessionResponseDto],
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: FocusQueryDto,
  ): Promise<FocusSessionResponseDto[]> {
    return this.focusService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get focus session by id' })
  @ApiParam({ name: 'id', description: 'Focus session ID' })
  @ApiResponse({ status: 200, description: 'Session details', type: FocusSessionResponseDto })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<FocusSessionResponseDto> {
    return this.focusService.findOne(userId, id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a focus session' })
  @ApiParam({ name: 'id', description: 'Focus session ID' })
  @ApiResponse({ status: 200, description: 'Session paused', type: FocusSessionResponseDto })
  async pause(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<FocusSessionResponseDto> {
    return this.focusService.pause(userId, id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a focus session' })
  @ApiParam({ name: 'id', description: 'Focus session ID' })
  @ApiResponse({ status: 200, description: 'Session resumed', type: FocusSessionResponseDto })
  async resume(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<FocusSessionResponseDto> {
    return this.focusService.resume(userId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a focus session' })
  @ApiParam({ name: 'id', description: 'Focus session ID' })
  @ApiResponse({ status: 200, description: 'Session completed', type: FocusSessionResponseDto })
  async complete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<FocusSessionResponseDto> {
    return this.focusService.complete(userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a focus session' })
  @ApiParam({ name: 'id', description: 'Focus session ID' })
  @ApiResponse({ status: 200, description: 'Session cancelled', type: FocusSessionResponseDto })
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<FocusSessionResponseDto> {
    return this.focusService.cancel(userId, id);
  }
}
