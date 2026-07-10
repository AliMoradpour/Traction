import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import {
  CreateGoalDto, UpdateGoalDto, GoalQueryDto, GoalResponseDto,
  CreateMilestoneDto, UpdateMilestoneDto, MilestoneResponseDto,
  CreatePlanDto, UpdatePlanDto, PlanResponseDto,
} from './dto/goals.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal created', type: GoalResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGoalDto,
  ): Promise<GoalResponseDto> {
    return this.goalsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  @ApiResponse({ status: 200, description: 'List of goals', type: [GoalResponseDto] })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: GoalQueryDto,
  ): Promise<GoalResponseDto[]> {
    return this.goalsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by id' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal details', type: GoalResponseDto })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<GoalResponseDto> {
    return this.goalsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal updated', type: GoalResponseDto })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<GoalResponseDto> {
    return this.goalsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal deleted' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.goalsService.remove(userId, id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal archived', type: GoalResponseDto })
  async archive(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<GoalResponseDto> {
    return this.goalsService.archive(userId, id);
  }

  // Milestones
  @Post(':id/milestones')
  @ApiOperation({ summary: 'Add milestone to goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 201, description: 'Milestone created', type: MilestoneResponseDto })
  async createMilestone(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.goalsService.createMilestone(userId, id, dto);
  }

  @Get(':id/milestones')
  @ApiOperation({ summary: 'Get goal milestones' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'List of milestones', type: [MilestoneResponseDto] })
  async getMilestones(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<MilestoneResponseDto[]> {
    return this.goalsService.getMilestones(userId, id);
  }

  @Patch(':id/milestones/:milestoneId')
  @ApiOperation({ summary: 'Update milestone' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone ID' })
  @ApiResponse({ status: 200, description: 'Milestone updated', type: MilestoneResponseDto })
  async updateMilestone(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    return this.goalsService.updateMilestone(userId, id, milestoneId, dto);
  }

  @Delete(':id/milestones/:milestoneId')
  @ApiOperation({ summary: 'Delete milestone' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone ID' })
  @ApiResponse({ status: 200, description: 'Milestone deleted' })
  async removeMilestone(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
  ): Promise<{ message: string }> {
    return this.goalsService.removeMilestone(userId, id, milestoneId);
  }

  // Plans
  @Post(':id/plans')
  @ApiOperation({ summary: 'Add plan to goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 201, description: 'Plan created', type: PlanResponseDto })
  async createPlan(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreatePlanDto,
  ): Promise<PlanResponseDto> {
    return this.goalsService.createPlan(userId, id, dto);
  }

  @Get(':id/plans')
  @ApiOperation({ summary: 'Get goal plans' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'List of plans', type: [PlanResponseDto] })
  async getPlans(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<PlanResponseDto[]> {
    return this.goalsService.getPlans(userId, id);
  }

  @Patch(':id/plans/:planId')
  @ApiOperation({ summary: 'Update plan' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan updated', type: PlanResponseDto })
  async updatePlan(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('planId') planId: string,
    @Body() dto: UpdatePlanDto,
  ): Promise<PlanResponseDto> {
    return this.goalsService.updatePlan(userId, id, planId, dto);
  }

  @Delete(':id/plans/:planId')
  @ApiOperation({ summary: 'Delete plan' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiParam({ name: 'planId', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan deleted' })
  async removePlan(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('planId') planId: string,
  ): Promise<{ message: string }> {
    return this.goalsService.removePlan(userId, id, planId);
  }
}
