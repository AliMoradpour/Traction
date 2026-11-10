import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isMonthKey } from '../../common/utils/month';
import { MonthPlanResponse, UpdateMonthPlanDto } from './dto/planning.dto';

@Injectable()
export class PlanningService {
  constructor(private prisma: PrismaService) {}

  async getMonthPlan(userId: string, month: string): Promise<MonthPlanResponse> {
    this.assertMonth(month);
    const plan = await this.prisma.monthPlan.findUnique({
      where: { userId_month: { userId, month } },
    });
    return {
      month,
      focuses: plan?.focuses ?? [],
      note: plan?.note ?? null,
      updatedAt: plan?.updatedAt ?? null,
    };
  }

  async updateMonthPlan(
    userId: string,
    month: string,
    dto: UpdateMonthPlanDto,
  ): Promise<MonthPlanResponse> {
    this.assertMonth(month);
    const focuses = dto.focuses?.map((f) => f.trim()).filter(Boolean);
    const note = dto.note === undefined ? undefined : dto.note?.trim() || null;
    const plan = await this.prisma.monthPlan.upsert({
      where: { userId_month: { userId, month } },
      create: { userId, month, focuses: focuses ?? [], note: note ?? null },
      update: {
        ...(focuses !== undefined && { focuses }),
        ...(note !== undefined && { note }),
      },
    });
    return { month, focuses: plan.focuses, note: plan.note, updatedAt: plan.updatedAt };
  }

  private assertMonth(month: string): void {
    if (!isMonthKey(month)) {
      throw new BadRequestException('Month must look like 2026-11');
    }
  }
}
