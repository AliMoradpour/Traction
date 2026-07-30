import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartFocusSessionDto, FocusSessionResponseDto, FocusQueryDto } from './dto/focus.dto';
import { FocusStatus } from '@prisma/client';

@Injectable()
export class FocusService {
  constructor(private prisma: PrismaService) {}

  async start(userId: string, dto: StartFocusSessionDto): Promise<FocusSessionResponseDto> {
    if (dto.taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });
      if (!task) throw new NotFoundException('Task not found');
      if (task.userId !== userId) throw new ForbiddenException('Access denied');
    }

    const activeSession = await this.prisma.focusSession.findFirst({
      where: { userId, status: FocusStatus.ACTIVE },
    });

    if (activeSession) {
      throw new BadRequestException('You already have an active focus session');
    }

    const session = await this.prisma.focusSession.create({
      data: {
        userId,
        taskId: dto.taskId,
        status: FocusStatus.ACTIVE,
      },
    });

    return session;
  }

  async pause(userId: string, sessionId: string): Promise<FocusSessionResponseDto> {
    const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Focus session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    if (session.status !== FocusStatus.ACTIVE) {
      throw new BadRequestException('Only active sessions can be paused');
    }

    const updated = await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: { status: FocusStatus.PAUSED },
    });

    return updated;
  }

  async resume(userId: string, sessionId: string): Promise<FocusSessionResponseDto> {
    const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Focus session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    if (session.status !== FocusStatus.PAUSED) {
      throw new BadRequestException('Only paused sessions can be resumed');
    }

    const updated = await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: { status: FocusStatus.ACTIVE },
    });

    return updated;
  }

  async complete(userId: string, sessionId: string): Promise<FocusSessionResponseDto> {
    const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Focus session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    if (session.status === FocusStatus.COMPLETED || session.status === FocusStatus.CANCELLED) {
      throw new BadRequestException('Session is already completed or cancelled');
    }

    const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

    const updated = await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: FocusStatus.COMPLETED,
        completed: true,
        endedAt: new Date(),
        duration,
      },
    });

    return updated;
  }

  async cancel(userId: string, sessionId: string): Promise<FocusSessionResponseDto> {
    const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Focus session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    if (session.status === FocusStatus.COMPLETED || session.status === FocusStatus.CANCELLED) {
      throw new BadRequestException('Session is already completed or cancelled');
    }

    const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

    const updated = await this.prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: FocusStatus.CANCELLED,
        endedAt: new Date(),
        duration,
      },
    });

    return updated;
  }

  async findOne(userId: string, sessionId: string): Promise<FocusSessionResponseDto> {
    const session = await this.prisma.focusSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Focus session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    return session;
  }

  async findAll(userId: string, query: FocusQueryDto): Promise<FocusSessionResponseDto[]> {
    const where: any = { userId };

    if (query.status) where.status = query.status;
    if (query.taskId) where.taskId = query.taskId;

    const sessions = await this.prisma.focusSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async getActive(userId: string): Promise<FocusSessionResponseDto | null> {
    const session = await this.prisma.focusSession.findFirst({
      where: { userId, status: FocusStatus.ACTIVE },
    });
    return session;
  }
}
