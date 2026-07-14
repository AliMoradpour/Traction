import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
  }

  async chat(
    messages: OpenRouterMessage[],
    model: string = 'anthropic/claude-3-haiku',
    options?: {
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('OpenRouter API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://traction.app',
          'X-Title': 'Traction',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`OpenRouter API error: ${response.status}`, error);
        return null;
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content ?? null;
    } catch (error) {
      this.logger.error('OpenRouter API call failed', error);
      return null;
    }
  }

  async generateTaskBreakdown(taskTitle: string, taskDescription?: string): Promise<string | null> {
    const systemPrompt = `You are a productivity assistant. Break down tasks into smaller, actionable steps.
Return a JSON array of steps. Each step should have a "title" field.
Keep steps simple and clear. Return ONLY the JSON array, no other text.`;

    const userPrompt = `Break down this task into 2-5 actionable steps:
Title: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ''}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 'anthropic/claude-3-haiku', { temperature: 0.5, maxTokens: 500 });
  }

  async analyzeGoalFeasibility(goalTitle: string, deadline?: string): Promise<string | null> {
    const systemPrompt = `You are a goal achievement analyst. Analyze if a goal is realistic given its timeline.
Return a JSON object with:
- "feasible": boolean
- "reason": string explaining why
- "suggestions": array of strings with tips to improve feasibility
Return ONLY the JSON object, no other text.`;

    const userPrompt = `Analyze this goal:
Title: ${goalTitle}
${deadline ? `Deadline: ${deadline}` : 'No deadline set'}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 'anthropic/claude-3-haiku', { temperature: 0.5, maxTokens: 500 });
  }

  async generateInsight(type: string, data: Record<string, unknown>): Promise<string | null> {
    const systemPrompt = `You are a behavioral insight analyst. Generate meaningful insights from user data.
Return a JSON object with:
- "title": string (short, catchy title)
- "content": string (insightful observation)
- "confidence": number (0-1)
Return ONLY the JSON object, no other text.`;

    const userPrompt = `Generate a ${type} insight from this data:
${JSON.stringify(data, null, 2)}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 'anthropic/claude-3-haiku', { temperature: 0.7, maxTokens: 500 });
  }

  async getRecommendation(context: {
    tasks?: string[];
    goals?: string[];
    focusSessions?: number;
    recentActivity?: string;
  }): Promise<string | null> {
    const systemPrompt = `You are a productivity coach. Based on the user's current state, provide a single actionable recommendation.
Return a JSON object with:
- "title": string (recommendation title)
- "body": string (detailed recommendation)
- "kind": string (one of: "suggestion", "encouragement", "warning", "tip")
- "priority": number (1-5, 5 being most important)
Return ONLY the JSON object, no other text.`;

    const userPrompt = `Based on this context, give me one recommendation:
${JSON.stringify(context, null, 2)}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 'anthropic/claude-3-haiku', { temperature: 0.7, maxTokens: 300 });
  }

  async simplifyTask(taskTitle: string, resistanceLevel: number): Promise<string | null> {
    const systemPrompt = `You are a resistance reduction expert. Help users simplify tasks they're resisting.
Based on the resistance level (1-5), provide a simplified version or smaller first step.
Return a JSON object with:
- "simplifiedTitle": string
- "firstStep": string (the very first small action)
- "motivation": string (brief encouragement)
Return ONLY the JSON object, no other text.`;

    const userPrompt = `Simplify this task (resistance level: ${resistanceLevel}/5):
${taskTitle}`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 'anthropic/claude-3-haiku', { temperature: 0.6, maxTokens: 300 });
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
