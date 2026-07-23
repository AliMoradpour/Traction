import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from '@/providers/ai/openrouter.provider';
import { PromptLoaderService } from './prompt-loader.service';
import { ModelRegistryService } from './model-registry.service';
import { AIRateLimitService } from './ai-rate-limit.service';
import { AISafetyService } from './ai-safety.service';

export interface TaskBreakdownStep {
  title: string;
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high';
}

@Injectable()
export class TaskBreakdownService {
  private readonly logger = new Logger(TaskBreakdownService.name);

  constructor(
    private prisma: PrismaService,
    private provider: OpenRouterProvider,
    private promptLoader: PromptLoaderService,
    private modelRegistry: ModelRegistryService,
    private rateLimitService: AIRateLimitService,
    private safetyService: AISafetyService,
  ) {}

  async breakdownTask(
    userId: string,
    taskId: string,
  ): Promise<TaskBreakdownStep[] | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      return null;
    }

    const prompt = this.promptLoader.renderPrompt('task-breakdown', {
      taskTitle: task.title,
      taskDescription: task.description || '',
      energyLevel: task.energy || 'MEDIUM',
      availableTime: task.duration ? `${task.duration} minutes` : 'Not specified',
    });

    const rateLimitResult = await this.rateLimitService.checkRateLimit(userId, 'task-breakdown');
    if (!rateLimitResult.allowed) {
      return this.getFallbackBreakdown(task);
    }

    const model = this.modelRegistry.getModelForFeature('task-breakdown');
    const response = await this.provider.chat(
      [{ role: 'user', content: prompt }],
      { model, temperature: 0.5, maxTokens: 500 },
    );

    if (!response) {
      return this.getFallbackBreakdown(task);
    }

    const validatedContent = this.safetyService.validateResponse(response.content, 'task-breakdown');
    await this.rateLimitService.recordUsage(userId, 'task-breakdown', response.model, response.usage.totalTokens);

    try {
      const parsed = JSON.parse(validatedContent);
      return parsed.map((step: any) => ({
        title: step.title,
        durationMinutes: step.durationMinutes || 15,
        priority: step.priority || 'medium',
      }));
    } catch (error) {
      this.logger.error('Failed to parse task breakdown response', error);
      return this.getFallbackBreakdown(task);
    }
  }

  private getFallbackBreakdown(task: any): TaskBreakdownStep[] {
    const steps: TaskBreakdownStep[] = [
      {
        title: `Review and understand: ${task.title}`,
        durationMinutes: 5,
        priority: 'high',
      },
      {
        title: 'Gather necessary resources',
        durationMinutes: 5,
        priority: 'medium',
      },
      {
        title: 'Complete the main work',
        durationMinutes: task.duration ? Math.floor(task.duration * 0.6) : 20,
        priority: 'high',
      },
      {
        title: 'Review and finalize',
        durationMinutes: 5,
        priority: 'medium',
      },
    ];

    return steps;
  }
}
