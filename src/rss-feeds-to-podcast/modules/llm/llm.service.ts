import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { OpenAI } from 'openai';
import { AppConfig } from '../config/config.types';

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

  async generateText(prompt: string) {
    try {
      this.#logger.debug(`Generating text with the following prompt:

${prompt}`);

      const result = await this.#client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.#config.model,
      });

      const message = result.choices[0].message.content;

      this.#logger.debug(`Response: `, message);

      return message;
    } catch (error) {
      this.#logger.error(error);
    }
  }
}
