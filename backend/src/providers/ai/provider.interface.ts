export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  readonly name: string;
  
  chat(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResponse | null>;
  
  isConfigured(): boolean;
}
