import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Patch('users/:id/role')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user role (SUPER_ADMIN only)' })
  async updateUserRole(@Param('id') userId: string, @Body('role') role: UserRole, @Request() req: any) {
    return this.adminService.updateUserRole(userId, role, req.user.role);
  }

  @Get('health')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get system health' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('analytics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get analytics data' })
  async getAnalytics() {
    const [engagement, retention, featureUsage] = await Promise.all([
      this.adminService.getUserEngagementStats(),
      this.adminService.getRetentionStats(),
      this.adminService.getFeatureUsage(),
    ]);

    return { engagement, retention, featureUsage };
  }
}
