import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdatePreferencesDto, UserProfileResponseDto, UserResponseDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  }

  async getPreferences(userId: string): Promise<UserProfileResponseDto> {
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await this.prisma.userProfile.create({
        data: { userId },
      });
    }

    return profile;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserProfileResponseDto> {
    // Ensure profile exists
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });

    return profile;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserStats(userId: string) {
    const [tasksCount, goalsCount, focusSessionsCount] = await Promise.all([
      this.prisma.task.count({
        where: { userId },
      }),
      this.prisma.goal.count({
        where: { userId },
      }),
      this.prisma.focusSession.count({
        where: { userId },
      }),
    ]);

    return {
      tasksCount,
      goalsCount,
      focusSessionsCount,
    };
  }
}
