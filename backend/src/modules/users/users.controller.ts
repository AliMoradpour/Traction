import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdatePreferencesDto, UserProfileResponseDto, UserResponseDto } from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: UserResponseDto })
  async getProfile(@CurrentUser('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile', type: UserResponseDto })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences', type: UserProfileResponseDto })
  async getPreferences(@CurrentUser('id') userId: string): Promise<UserProfileResponseDto> {
    return this.usersService.getPreferences(userId);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Updated preferences', type: UserProfileResponseDto })
  async updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updatePreferences(userId, dto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User stats' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }
}
