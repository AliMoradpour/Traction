import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  ReadinessResponseDto,
  ResistanceResponseDto,
  MomentumResponseDto,
  ExecutionStatsResponseDto,
} from './dto/execution.dto';

@ApiTags('execution')
@Controller('execution')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Get('readiness')
  @ApiOperation({ summary: 'Get execution readiness score' })
  @ApiResponse({ status: 200, description: 'Readiness score with factors and explanation', type: ReadinessResponseDto })
  async getReadiness(
    @CurrentUser('id') userId: string,
  ): Promise<ReadinessResponseDto> {
    return this.executionService.getReadinessScore(userId);
  }

  @Get('resistance')
  @ApiOperation({ summary: 'Get resistance detection analysis' })
  @ApiResponse({ status: 200, description: 'Resistance score with patterns and suggestions', type: ResistanceResponseDto })
  async getResistance(
    @CurrentUser('id') userId: string,
  ): Promise<ResistanceResponseDto> {
    return this.executionService.detectResistance(userId);
  }

  @Get('momentum')
  @ApiOperation({ summary: 'Get momentum metrics' })
  @ApiResponse({ status: 200, description: 'Momentum metrics with streaks and trends', type: MomentumResponseDto })
  async getMomentum(
    @CurrentUser('id') userId: string,
  ): Promise<MomentumResponseDto> {
    return this.executionService.getMomentum(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get execution statistics' })
  @ApiResponse({ status: 200, description: 'Comprehensive execution statistics', type: ExecutionStatsResponseDto })
  async getStats(
    @CurrentUser('id') userId: string,
  ): Promise<ExecutionStatsResponseDto> {
    return this.executionService.getExecutionStats(userId);
  }
}
