import { Module } from '@nestjs/common';
import { OpenRouterProvider } from './openrouter.provider';

@Module({
  providers: [OpenRouterProvider],
  exports: [OpenRouterProvider],
})
export class AIProvidersModule {}
