import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { GoalHealthService } from './goal-health.service';
import { GoalHealthResponseDto } from './dto/goal-health.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('goal-health')
@Controller('goal-health')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalHealthController {
  constructor(private readonly goalHealthService: GoalHealthService) {}

  @Get(':goalId')
  @ApiOperation({ summary: 'Get goal health' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal health details', type: GoalHealthResponseDto })
  async getHealth(
    @CurrentUser('id') userId: string,
    @Param('goalId') goalId: string,
  ): Promise<GoalHealthResponseDto> {
    return this.goalHealthService.getHealth(userId, goalId);
  }

  @Post(':goalId/recalculate')
  @ApiOperation({ summary: 'Recalculate goal health' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Updated goal health', type: GoalHealthResponseDto })
  async recalculate(
    @CurrentUser('id') userId: string,
    @Param('goalId') goalId: string,
  ): Promise<GoalHealthResponseDto> {
    return this.goalHealthService.recalculateHealth(userId, goalId);
  }
}
