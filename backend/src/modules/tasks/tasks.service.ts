import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, TaskResponseDto } from './dto/tasks.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        ...dto,
      },
    });

    return task;
  }

  async findAll(userId: string, query: TaskQueryDto): Promise<TaskResponseDto[]> {
    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.scheduledDate) {
      const date = new Date(query.scheduledDate);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      where.scheduledAt = {
        gte: date,
        lt: nextDate,
      };
    }

    if (query.goalId) {
      where.goalId = query.goalId;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks;
  }

  async findOne(userId: string, taskId: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = { ...dto };
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === null) delete updateData[key];
    });

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return updatedTask;
  }

  async complete(userId: string, taskId: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return updatedTask;
  }

  async remove(userId: string, taskId: string): Promise<{ message: string }> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }

  async getTasksByDate(userId: string, date: Date): Promise<TaskResponseDto[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
    });

    return tasks;
  }

  async getTasksByGoal(userId: string, goalId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        goalId,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return tasks;
  }

  async getSteps(userId: string, taskId: string): Promise<any[]> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');

    return [];
  }

  async simplify(userId: string, taskId: string): Promise<any[]> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');

    return [
      {
        id: '1',
        title: 'Break down the task',
        description: 'Divide into smaller steps',
        durationMinutes: 5,
        status: 'pending',
        order: 1,
      },
      {
        id: '2',
        title: 'Complete step 1',
        description: 'First actionable step',
        durationMinutes: 15,
        status: 'pending',
        order: 2,
      },
      {
        id: '3',
        title: 'Complete step 2',
        description: 'Second actionable step',
        durationMinutes: 15,
        status: 'pending',
        order: 3,
      },
    ];
  }

  async getFocusSessions(userId: string, taskId: string): Promise<any[]> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.focusSession.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
