import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from '@/providers/ai/openrouter.provider';
import { PromptLoaderService } from './prompt-loader.service';
import { ModelRegistryService } from './model-registry.service';
import { AIRateLimitService } from './ai-rate-limit.service';

export type StuckFeeling = 'overwhelmed' | 'unclear' | 'tired' | 'distracted' | 'anxious';

export interface StuckAnalysis {
  likelyCause: string;
  nextAction: string;
  simplifiedFirstStep: string;
  motivation: string;
  timeEstimate: string;
}

@Injectable()
export class StuckAnalysisService {
  private readonly logger = new Logger(StuckAnalysisService.name);

  constructor(
    private prisma: PrismaService,
    private provider: OpenRouterProvider,
    private promptLoader: PromptLoaderService,
    private modelRegistry: ModelRegistryService,
    private rateLimitService: AIRateLimitService,
  ) {}

  async analyzeStuck(
    userId: string,
    feeling: StuckFeeling,
    currentTaskId?: string,
  ): Promise<StuckAnalysis | null> {
    let currentTask = null;
    
    if (currentTaskId) {
      currentTask = await this.prisma.task.findUnique({
        where: { id: currentTaskId },
      });
    }

    const recentActivity = await this.getRecentActivity(userId);
    const timeOfDay = this.getTimeOfDay();

    const prompt = this.promptLoader.renderPrompt('stuck-analysis', {
      feeling,
      currentTask: currentTask ? currentTask.title : 'No specific task',
      recentActivity,
      timeOfDay,
    });

    const rateLimitResult = await this.rateLimitService.checkRateLimit(userId, 'stuck-analysis');
    if (!rateLimitResult.allowed) {
      return this.getFallbackAnalysis(feeling);
    }

    const response = await this.provider.chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.6, maxTokens: 300 },
    );

    if (!response) {
      return this.getFallbackAnalysis(feeling);
    }

    await this.rateLimitService.recordUsage(userId, 'stuck-analysis', response.model, response.usage.totalTokens);

    try {
      const parsed = JSON.parse(response.content);
      return {
        likelyCause: parsed.likelyCause,
        nextAction: parsed.nextAction,
        simplifiedFirstStep: parsed.simplifiedFirstStep,
        motivation: parsed.motivation,
        timeEstimate: parsed.timeEstimate,
      };
    } catch (error) {
      this.logger.error('Failed to parse stuck analysis response', error);
      return this.getFallbackAnalysis(feeling);
    }
  }

  private async getRecentActivity(userId: string): Promise<string> {
    const recentTasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const recentSessions = await this.prisma.focusSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 3,
    });

    const activities: string[] = [];
    
    recentTasks.forEach(t => {
      activities.push(`Task: ${t.title} (${t.status})`);
    });
    
    recentSessions.forEach(s => {
      activities.push(`Focus session: ${s.duration || 0} minutes (${s.status})`);
    });

    return activities.join(', ') || 'No recent activity';
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private getFallbackAnalysis(feeling: StuckFeeling): StuckAnalysis {
    const fallbacks: Record<StuckFeeling, StuckAnalysis> = {
      overwhelmed: {
        likelyCause: 'You may have too many tasks competing for your attention',
        nextAction: 'Pick just one task to focus on right now',
        simplifiedFirstStep: 'Open the task and read the first line',
        motivation: "You don't have to do everything at once",
        timeEstimate: '2 minutes to start',
      },
      unclear: {
        likelyCause: 'The task may not be clear enough to act on',
        nextAction: 'Break the task into smaller, specific steps',
        simplifiedFirstStep: 'Write down what "done" looks like',
        motivation: 'Clarity comes from action, not thinking',
        timeEstimate: '5 minutes to clarify',
      },
      tired: {
        likelyCause: 'Your energy may be depleted',
        nextAction: 'Take a real break, then return to a small task',
        simplifiedFirstStep: 'Stand up and stretch for 1 minute',
        motivation: 'Rest is productive too',
        timeEstimate: '10 minutes to recharge',
      },
      distracted: {
        likelyCause: 'Something is pulling your attention away',
        nextAction: 'Remove the distraction for 15 minutes',
        simplifiedFirstStep: 'Put your phone in another room',
        motivation: 'Focus is a skill you can practice',
        timeEstimate: '15 minutes of focused work',
      },
      anxious: {
        likelyCause: 'Fear or worry may be blocking action',
        nextAction: 'Identify the specific worry, then take one small step',
        simplifiedFirstStep: "Write down what you're afraid of",
        motivation: 'Action reduces anxiety',
        timeEstimate: '5 minutes to start',
      },
    };

    return fallbacks[feeling];
  }
}
