import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface PromptMetadata {
  name: string;
  version: string;
  lastModified: Date;
}

@Injectable()
export class PromptLoaderService {
  private readonly logger = new Logger(PromptLoaderService.name);
  private readonly promptsDir: string;
  private readonly prompts: Map<string, string> = new Map();

  constructor() {
    this.promptsDir = path.join(process.cwd(), 'prompts');
    this.loadAllPrompts();
  }

  private loadAllPrompts(): void {
    try {
      if (!fs.existsSync(this.promptsDir)) {
        this.logger.warn(`Prompts directory not found: ${this.promptsDir}`);
        return;
      }

      const files = fs.readdirSync(this.promptsDir).filter(f => f.endsWith('.md'));
      
      for (const file of files) {
        const promptName = file.replace('.md', '');
        const content = fs.readFileSync(path.join(this.promptsDir, file), 'utf-8');
        this.prompts.set(promptName, content);
        this.logger.log(`Loaded prompt: ${promptName}`);
      }
    } catch (error) {
      this.logger.error('Failed to load prompts', error);
    }
  }

  getPrompt(name: string): string {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new NotFoundException(`Prompt not found: ${name}`);
    }
    return prompt;
  }

  renderPrompt(name: string, variables: Record<string, string>): string {
    let prompt = this.getPrompt(name);
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return prompt;
  }

  getAvailablePrompts(): string[] {
    return Array.from(this.prompts.keys());
  }

  getPromptMetadata(name: string): PromptMetadata | null {
    const filePath = path.join(this.promptsDir, `${name}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    
    return {
      name,
      version: '1.0.0',
      lastModified: stats.mtime,
    };
  }

  reloadPrompts(): void {
    this.prompts.clear();
    this.loadAllPrompts();
  }
}
