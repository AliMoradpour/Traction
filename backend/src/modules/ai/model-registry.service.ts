import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AIModelConfig {
  primary: string;
  fallback: string;
}

@Injectable()
export class ModelRegistryService {
  private readonly logger = new Logger(ModelRegistryService.name);
  private readonly models: AIModelConfig;

  constructor(private configService: ConfigService) {
    this.models = {
      primary: this.configService.get<string>('AI_MODEL_PRIMARY', 'anthropic/claude-3-haiku'),
      fallback: this.configService.get<string>('AI_MODEL_FALLBACK', 'anthropic/claude-3-haiku'),
    };
    
    this.logger.log(`Model registry initialized: primary=${this.models.primary}, fallback=${this.models.fallback}`);
  }

  getPrimaryModel(): string {
    return this.models.primary;
  }

  getFallbackModel(): string {
    return this.models.fallback;
  }

  getModelForFeature(feature: string): string {
    const featureModels: Record<string, string> = {
      'daily-brief': this.models.primary,
      'weekly-review': this.models.primary,
      'task-breakdown': this.models.primary,
      'goal-recovery': this.models.primary,
      'stuck-analysis': this.models.primary,
      'recommendations': this.models.primary,
    };

    return featureModels[feature] ?? this.models.primary;
  }

  getModels(): AIModelConfig {
    return { ...this.models };
  }
}
