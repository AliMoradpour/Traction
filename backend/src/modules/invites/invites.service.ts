import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { InviteResponseDto, InviteStatsDto } from './dto/invite.dto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  async createInvite(
    email: string,
    invitedById: string,
    role: UserRole = UserRole.BETA_TESTER,
  ): Promise<InviteResponseDto> {
    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email,
        invitedById,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new ConflictException('An active invite already exists for this email');
    }

    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.invite.create({
      data: {
        email,
        code,
        role,
        invitedById,
        expiresAt,
      },
      include: {
        usedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return invite;
  }

  async validateInvite(code: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { code },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite code');
    }

    if (invite.usedAt) {
      throw new BadRequestException('Invite has already been used');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('Invite has expired');
    }

    return {
      valid: true,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    };
  }

  async useInvite(code: string, userId: string): Promise<void> {
    const invite = await this.prisma.invite.findUnique({
      where: { code },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite code');
    }

    if (invite.usedAt) {
      throw new BadRequestException('Invite has already been used');
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('Invite has expired');
    }

    await this.prisma.invite.update({
      where: { id: invite.id },
      data: {
        usedById: userId,
        usedAt: new Date(),
      },
    });
  }

  async getInviteStats(invitedById: string): Promise<InviteStatsDto> {
    const now = new Date();

    const [total, used, expired] = await Promise.all([
      this.prisma.invite.count({
        where: { invitedById },
      }),
      this.prisma.invite.count({
        where: { invitedById, usedAt: { not: null } },
      }),
      this.prisma.invite.count({
        where: { invitedById, usedAt: null, expiresAt: { lt: now } },
      }),
    ]);

    return {
      total,
      used,
      pending: total - used - expired,
      expired,
    };
  }

  async listInvites(invitedById: string): Promise<InviteResponseDto[]> {
    return this.prisma.invite.findMany({
      where: { invitedById },
      include: {
        usedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
