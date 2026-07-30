import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AISafetyService {
  private readonly logger = new Logger(AISafetyService.name);

  validateResponse(content: string, feature: string): string {
    if (!content || content.trim().length === 0) {
      return this.getFallback(feature);
    }

    // Check for hallucinated metrics (numbers that look like percentages or scores)
    const metricPattern = /\b\d+(\.\d+)?%/g;
    const metrics = content.match(metricPattern);
    if (metrics && metrics.length > 3) {
      content = content.replace(metricPattern, '[data]');
    }

    // Ensure response is not too long (token limit safety)
    if (content.length > 4000) {
      content = content.substring(0, 4000) + '...';
    }

    // Remove any potential prompt injection attempts
    content = content.replace(/ignore previous instructions/gi, '[redacted]');
    content = content.replace(/system prompt/gi, '[redacted]');

    return content;
  }

  private getFallback(feature: string): string {
    switch (feature) {
      case 'daily-brief':
        return 'Unable to generate daily brief. Please try again later.';
      case 'weekly-review':
        return 'Unable to generate weekly review. Please try again later.';
      case 'goal-recovery':
        return 'Unable to generate goal recovery. Please try again later.';
      case 'task-breakdown':
        return 'Unable to generate task breakdown. Please try again later.';
      case 'stuck-analysis':
        return 'Unable to generate stuck analysis. Please try again later.';
      default:
        return 'Unable to process request. Please try again later.';
    }
  }
}
