import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalQueryDto,
  GoalResponseDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  MilestoneResponseDto,
  CreatePlanDto,
  UpdatePlanDto,
  PlanResponseDto,
} from './dto/goals.dto';
import { GoalStatus, MilestoneStatus, PlanStatus } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto): Promise<GoalResponseDto> {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
    return goal;
  }

  async findAll(userId: string, query: GoalQueryDto): Promise<GoalResponseDto[]> {
    const where: any = { userId };

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;

    const goals = await this.prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return goals;
  }

  async findOne(userId: string, goalId: string): Promise<GoalResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');
    return goal;
  }

  async update(userId: string, goalId: string, dto: UpdateGoalDto): Promise<GoalResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const updateData: any = { ...dto };
    if (dto.targetDate) updateData.targetDate = new Date(dto.targetDate);
    else if (dto.targetDate === null) delete updateData.targetDate;
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === null) delete updateData[key];
    });

    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });

    return updated;
  }

  async archive(userId: string, goalId: string): Promise<GoalResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: { status: GoalStatus.ARCHIVED },
    });

    return updated;
  }

  async remove(userId: string, goalId: string): Promise<{ message: string }> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.goal.delete({ where: { id: goalId } });
    return { message: 'Goal deleted successfully' };
  }

  async getFeasibility(userId: string, goalId: string): Promise<any> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const daysRemaining = goal.targetDate
      ? Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      goalId: goal.id,
      probability: goal.progress > 50 ? 0.8 : goal.progress > 25 ? 0.6 : 0.4,
      timeline: daysRemaining ? `${daysRemaining} days remaining` : 'No deadline set',
      readiness: goal.progress > 75 ? 'high' : goal.progress > 50 ? 'medium' : 'low',
      recommendation: 'Continue working on this goal consistently.',
    };
  }

  async getProjection(userId: string, goalId: string): Promise<any> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const daysRemaining = goal.targetDate
      ? Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      goalId: goal.id,
      health: goal.health,
      progress: goal.progress,
      velocity: goal.velocity,
      targetDate: goal.targetDate,
      daysRemaining,
      forecast: goal.progress > 50 ? 'On track' : 'Needs attention',
      alternativeScenario:
        'If you increase daily progress by 20%, you can complete this goal earlier.',
    };
  }

  // Milestones
  async createMilestone(
    userId: string,
    goalId: string,
    dto: CreateMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const milestone = await this.prisma.goalMilestone.create({
      data: {
        goalId,
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });

    return milestone;
  }

  async getMilestones(userId: string, goalId: string): Promise<MilestoneResponseDto[]> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.goalMilestone.findMany({
      where: { goalId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
  ): Promise<MilestoneResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const milestone = await this.prisma.goalMilestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.goalId !== goalId)
      throw new ForbiddenException('Milestone does not belong to this goal');

    const updateData: any = { ...dto };
    if (dto.targetDate) updateData.targetDate = new Date(dto.targetDate);
    else if (dto.targetDate === null) delete updateData.targetDate;
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === null) delete updateData[key];
    });

    const updated = await this.prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return updated;
  }

  async removeMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
  ): Promise<{ message: string }> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const milestone = await this.prisma.goalMilestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.goalId !== goalId)
      throw new ForbiddenException('Milestone does not belong to this goal');

    await this.prisma.goalMilestone.delete({ where: { id: milestoneId } });
    return { message: 'Milestone deleted successfully' };
  }

  // Plans
  async createPlan(userId: string, goalId: string, dto: CreatePlanDto): Promise<PlanResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const plan = await this.prisma.goalPlan.create({
      data: {
        goalId,
        ...dto,
      },
    });

    return plan;
  }

  async getPlans(userId: string, goalId: string): Promise<PlanResponseDto[]> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.goalPlan.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePlan(
    userId: string,
    goalId: string,
    planId: string,
    dto: UpdatePlanDto,
  ): Promise<PlanResponseDto> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const plan = await this.prisma.goalPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.goalId !== goalId) throw new ForbiddenException('Plan does not belong to this goal');

    const data: any = { ...dto };
    if (dto.status === PlanStatus.APPLIED && !plan.appliedAt) {
      data.appliedAt = new Date();
    }

    const updated = await this.prisma.goalPlan.update({
      where: { id: planId },
      data,
    });

    return updated;
  }

  async removePlan(userId: string, goalId: string, planId: string): Promise<{ message: string }> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    const plan = await this.prisma.goalPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.goalId !== goalId) throw new ForbiddenException('Plan does not belong to this goal');

    await this.prisma.goalPlan.delete({ where: { id: planId } });
    return { message: 'Plan deleted successfully' };
  }
}
