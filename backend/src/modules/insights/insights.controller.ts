import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { InsightQueryDto, InsightResponseDto } from './dto/insights.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('insights')
@Controller('insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all insights' })
  @ApiResponse({ status: 200, description: 'List of insights', type: [InsightResponseDto] })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: InsightQueryDto,
  ): Promise<InsightResponseDto[]> {
    return this.insightsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get insight by id' })
  @ApiParam({ name: 'id', description: 'Insight ID' })
  @ApiResponse({ status: 200, description: 'Insight details', type: InsightResponseDto })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<InsightResponseDto> {
    return this.insightsService.findOne(userId, id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark insight as read' })
  @ApiParam({ name: 'id', description: 'Insight ID' })
  @ApiResponse({ status: 200, description: 'Insight marked as read', type: InsightResponseDto })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<InsightResponseDto> {
    return this.insightsService.markAsRead(userId, id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss insight' })
  @ApiParam({ name: 'id', description: 'Insight ID' })
  @ApiResponse({ status: 200, description: 'Insight dismissed', type: InsightResponseDto })
  async dismiss(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<InsightResponseDto> {
    return this.insightsService.dismiss(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all insights as read' })
  @ApiResponse({ status: 200, description: 'Count of updated insights' })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
  ): Promise<{ count: number }> {
    return this.insightsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete insight' })
  @ApiParam({ name: 'id', description: 'Insight ID' })
  @ApiResponse({ status: 200, description: 'Insight deleted' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.insightsService.remove(userId, id);
  }
}
