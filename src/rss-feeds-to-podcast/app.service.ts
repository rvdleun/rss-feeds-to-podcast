import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from './modules/config/config.service';
import { execSync } from 'child_process';
import { LlmService } from './modules/llm/llm.service';
import { TextToSpeechService } from './modules/text-to-speech/text-to-speech.service';
import { WebScraperService } from './modules/web-scraper/web-scraper.service';

@Injectable()
export class AppService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private llmService: LlmService,
    private textToSpeechService: TextToSpeechService,
    private webScraperService: WebScraperService,
  ) {}

  async verifyExternalServices() {
    this.#logger.log('');
    this.#logger.log('Verifying external services');
    this.#logger.log('---------------------------');
    this.#logger.log('');

    const availableIcon = (available: boolean) =>
      `[${available ? '✅' : '❌'}]`;

    let ffmpegAvailable = false;
    try {
      execSync('ffmpeg -version');
      ffmpegAvailable = true;
    } catch {}
    this.#logger.log(`${availableIcon(ffmpegAvailable)} FFmpeg`);

    const llmAvailable = await this.llmService.isAvailable();
    this.#logger.log(`${availableIcon(llmAvailable)} LLM`);
    const textToSpeechAvailable = await this.textToSpeechService.isAvailable();
    this.#logger.log(`${availableIcon(textToSpeechAvailable)} TextToSpeech`);
    const webScraperAvailable = await this.webScraperService.isAvailable();
    this.#logger.log(`${availableIcon(webScraperAvailable)} Webscraper`);
    this.#logger.log('');

    return [
      ffmpegAvailable,
      llmAvailable,
      textToSpeechAvailable,
      webScraperAvailable,
    ].every((available) => available);
  }
}
