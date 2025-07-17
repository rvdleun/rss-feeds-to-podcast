import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { OpenAI } from 'openai';
import { AppConfig } from '../config/config.types';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

@Injectable()
export class LlmService implements OnModuleInit {
  #client: OpenAI;
  #config: AppConfig['externalServices']['llm'];
  #logger = new Logger(this.constructor.name);

  constructor(private appConfigService: AppConfigService) {}

  onModuleInit() {
    this.#config = this.appConfigService.getConfig('externalServices').llm;
    this.#client = new OpenAI(this.#config);
  }

  async generateText<T = string>(
    prompt: string,
    schema?: z.ZodSchema<T>,
  ): Promise<T> {
    try {
      this.#logger.debug(`Generating text with the following prompt:

${prompt}`);

      const result = await this.#client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.#config.model,
        response_format: schema
          ? zodResponseFormat(schema, 'schema')
          : undefined,
      });

      const message = result.choices[0].message.content;
      this.#logger.debug(`Response: `, message);

      if (schema) {
        return JSON.parse(message) as T;
      }

      return message as T;
    } catch (error) {
      this.#logger.error(error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.#client.chat.completions.create({
        model: this.#config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_completion_tokens: 3,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
