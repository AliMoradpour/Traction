import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { InvitesService } from './invites.service';
import { CreateInviteDto, InviteResponseDto, InviteStatsDto } from './dto/invite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create a beta invite' })
  @ApiResponse({ status: 201, description: 'Invite created', type: InviteResponseDto })
  async createInvite(
    @Body() dto: CreateInviteDto,
    @CurrentUser('id') userId: string,
  ): Promise<InviteResponseDto> {
    return this.invitesService.createInvite(dto.email, userId, dto.role);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my invites' })
  @ApiResponse({ status: 200, description: 'List of invites', type: [InviteResponseDto] })
  async listInvites(@CurrentUser('id') userId: string): Promise<InviteResponseDto[]> {
    return this.invitesService.listInvites(userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invite stats' })
  @ApiResponse({ status: 200, description: 'Invite statistics', type: InviteStatsDto })
  async getInviteStats(@CurrentUser('id') userId: string): Promise<InviteStatsDto> {
    return this.invitesService.getInviteStats(userId);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate an invite code (public)' })
  @ApiResponse({ status: 200, description: 'Invite is valid' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  async validateInvite(@Param('code') code: string) {
    return this.invitesService.validateInvite(code);
  }

  @Post(':code/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invite' })
  @ApiResponse({ status: 200, description: 'Invite accepted' })
  async acceptInvite(
    @Param('code') code: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    await this.invitesService.useInvite(code, userId);
    return { message: 'Invite accepted successfully' };
  }
}
