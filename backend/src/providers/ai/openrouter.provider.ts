import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
} from './provider.interface';

@Injectable()
export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';
  
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly defaultModel: string;
  private readonly fallbackModel: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    this.defaultModel = this.configService.get<string>('AI_MODEL_PRIMARY', 'anthropic/claude-3-haiku');
    this.fallbackModel = this.configService.get<string>('AI_MODEL_FALLBACK', 'anthropic/claude-3-haiku');
  }

  async chat(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResponse | null> {
    if (!this.apiKey) {
      this.logger.warn('OpenRouter API key not configured');
      return null;
    }

    const model = options?.model ?? this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 1000;

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
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`OpenRouter API error: ${response.status}`, error);
        
        if (response.status === 429) {
          return this.tryFallbackModel(messages, options);
        }
        
        return null;
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      
      if (!choice?.message?.content) {
        this.logger.warn('No content in OpenRouter response');
        return null;
      }

      return {
        content: choice.message.content,
        model: data.model ?? model,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
      };
    } catch (error) {
      this.logger.error('OpenRouter API call failed', error);
      return null;
    }
  }

  private async tryFallbackModel(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResponse | null> {
    const fallbackModel = this.fallbackModel;
    
    if (!fallbackModel || fallbackModel === options?.model) {
      return null;
    }

    this.logger.log(`Trying fallback model: ${fallbackModel}`);

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
          model: fallbackModel,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
        }),
      });

      if (!response.ok) {
        this.logger.error(`OpenRouter fallback model error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      
      if (!choice?.message?.content) {
        return null;
      }

      return {
        content: choice.message.content,
        model: fallbackModel,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
      };
    } catch (error) {
      this.logger.error('OpenRouter fallback model failed', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}
