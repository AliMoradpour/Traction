import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const round1 = (n: number) => Math.round(n * 10) / 10;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [usersCount, tasksCount, goalsCount, focusSessionsCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.task.count(),
      this.prisma.goal.count(),
      this.prisma.focusSession.count(),
    ]);

    return {
      totalUsers: usersCount,
      totalTasks: tasksCount,
      totalGoals: goalsCount,
      totalFocusSessions: focusSessionsCount,
    };
  }

  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(userId: string, role: UserRole, currentUserRole: UserRole) {
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can update user roles');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return updatedUser;
  }

  /**
   * Most recent user-initiated activity per user, taken from rows only the user's own actions
   * create (sessions, tasks, goals, focus, AI calls, behavior events, feedback). User.updatedAt
   * is deliberately not used: it only changes when the user row itself is written.
   */
  private async getLastActivityByUser(): Promise<Map<string, Date>> {
    const [behavior, tasks, goals, focus, ai, feedback, sessions] = await Promise.all([
      this.prisma.behaviorEvent.groupBy({ by: ['userId'], _max: { createdAt: true } }),
      this.prisma.task.groupBy({ by: ['userId'], _max: { createdAt: true, completedAt: true } }),
      this.prisma.goal.groupBy({ by: ['userId'], _max: { createdAt: true, completedAt: true } }),
      this.prisma.focusSession.groupBy({ by: ['userId'], _max: { startedAt: true } }),
      this.prisma.aIUsage.groupBy({ by: ['userId'], _max: { createdAt: true } }),
      this.prisma.feedback.groupBy({ by: ['userId'], _max: { createdAt: true } }),
      this.prisma.refreshToken.groupBy({ by: ['userId'], _max: { createdAt: true } }),
    ]);

    const last = new Map<string, Date>();
    const bump = (userId: string, ...dates: (Date | null | undefined)[]) => {
      for (const d of dates) {
        if (!d) continue;
        const prev = last.get(userId);
        if (!prev || d > prev) last.set(userId, d);
      }
    };

    behavior.forEach((r) => bump(r.userId, r._max.createdAt));
    tasks.forEach((r) => bump(r.userId, r._max.createdAt, r._max.completedAt));
    goals.forEach((r) => bump(r.userId, r._max.createdAt, r._max.completedAt));
    focus.forEach((r) => bump(r.userId, r._max.startedAt));
    ai.forEach((r) => bump(r.userId, r._max.createdAt));
    feedback.forEach((r) => bump(r.userId, r._max.createdAt));
    sessions.forEach((r) => bump(r.userId, r._max.createdAt));
    return last;
  }

  async getUserEngagementStats() {
    // Day boundaries are UTC so results don't depend on the server's local timezone.
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    // "This week" = the last 7 calendar days including today.
    const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS);

    const [lastActivity, totalUsers, totalTasks, completedTasks, focusSum] = await Promise.all([
      this.getLastActivityByUser(),
      this.prisma.user.count(),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: 'COMPLETED' } }),
      this.prisma.focusSession.aggregate({ _sum: { duration: true } }),
    ]);

    let activeToday = 0;
    let activeThisWeek = 0;
    for (const d of lastActivity.values()) {
      if (d >= todayStart) activeToday++;
      if (d >= weekStart) activeThisWeek++;
    }

    const avgTasksPerUser = totalUsers > 0 ? round1(totalTasks / totalUsers) : 0;
    const completionRate = totalTasks > 0 ? round1((completedTasks / totalTasks) * 100) : 0;
    // FocusSession.duration is stored in seconds.
    const totalFocusMinutes = Math.round((focusSum._sum.duration ?? 0) / 60);

    return {
      activeToday,
      activeThisWeek,
      avgTasksPerUser,
      completionRate,
      totalFocusMinutes,
      timezone: 'UTC',
    };
  }

  /**
   * Rolling Day-N retention: of users who signed up at least N days ago, the percentage
   * with any activity N or more days after signing up. Returns null for a day when no user
   * is old enough to measure, rather than inventing a number.
   */
  async getRetentionStats() {
    const now = Date.now();
    const [users, lastActivity] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, createdAt: true } }),
      this.getLastActivityByUser(),
    ]);

    const compute = (days: number) => {
      const window = days * DAY_MS;
      let cohort = 0;
      let retained = 0;
      for (const u of users) {
        const signup = u.createdAt.getTime();
        if (now - signup < window) continue;
        cohort++;
        const last = lastActivity.get(u.id);
        if (last && last.getTime() >= signup + window) retained++;
      }
      return { rate: cohort > 0 ? round1((retained / cohort) * 100) : null, cohort, retained };
    };

    const d1 = compute(1);
    const d3 = compute(3);
    const d7 = compute(7);

    return {
      day1: d1.rate,
      day3: d3.rate,
      day7: d7.rate,
      cohorts: { day1: d1, day3: d3, day7: d7 },
    };
  }

  async getFeatureUsage() {
    const [tasksCount, goalsCount, focusCount, aiCount] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.goal.count(),
      this.prisma.focusSession.count(),
      this.prisma.aIUsage.count(),
    ]);

    const total = tasksCount + goalsCount + focusCount + aiCount || 1;

    return {
      tasks: { count: tasksCount, percentage: parseFloat(((tasksCount / total) * 100).toFixed(1)) },
      goals: { count: goalsCount, percentage: parseFloat(((goalsCount / total) * 100).toFixed(1)) },
      focus: { count: focusCount, percentage: parseFloat(((focusCount / total) * 100).toFixed(1)) },
      ai: { count: aiCount, percentage: parseFloat(((aiCount / total) * 100).toFixed(1)) },
    };
  }

  async getSystemHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
