import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, TaskResponseDto } from './dto/tasks.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created', type: TaskResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks', type: [TaskResponseDto] })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: TaskQueryDto,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task details', type: TaskResponseDto })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated', type: TaskResponseDto })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(userId, id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task completed', type: TaskResponseDto })
  async complete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.complete(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(userId, id);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get tasks by date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Tasks for date', type: [TaskResponseDto] })
  async findByDate(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.getTasksByDate(userId, new Date(date));
  }

  @Get(':id/steps')
  @ApiOperation({ summary: 'Get task steps' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task steps' })
  async getSteps(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<any[]> {
    return this.tasksService.getSteps(userId, id);
  }

  @Post(':id/simplify')
  @ApiOperation({ summary: 'Simplify task with AI' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Simplified task steps' })
  async simplify(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<any[]> {
    return this.tasksService.simplify(userId, id);
  }

  @Get(':id/focus-sessions')
  @ApiOperation({ summary: 'Get task focus sessions' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task focus sessions' })
  async getFocusSessions(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<any[]> {
    return this.tasksService.getFocusSessions(userId, id);
  }
}
