import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PlanningService } from './planning.service';
import { MonthPlanResponse, UpdateMonthPlanDto } from './dto/planning.dto';

@ApiTags('planning')
@Controller('planning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get('month/:month')
  @ApiOperation({ summary: 'Get the plan for a month' })
  @ApiParam({ name: 'month', example: '2026-11' })
  getMonth(
    @CurrentUser('id') userId: string,
    @Param('month') month: string,
  ): Promise<MonthPlanResponse> {
    return this.planningService.getMonthPlan(userId, month);
  }

  @Put('month/:month')
  @ApiOperation({ summary: 'Save the focuses and note for a month' })
  @ApiParam({ name: 'month', example: '2026-11' })
  updateMonth(
    @CurrentUser('id') userId: string,
    @Param('month') month: string,
    @Body() dto: UpdateMonthPlanDto,
  ): Promise<MonthPlanResponse> {
    return this.planningService.updateMonthPlan(userId, month, dto);
  }
}
