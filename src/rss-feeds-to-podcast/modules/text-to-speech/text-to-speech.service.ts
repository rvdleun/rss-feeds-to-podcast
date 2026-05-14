import { Injectable, OnModuleInit } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { AppConfigService } from '../config/config.service';
import { ProviderService } from './providers/provider.service';
import { KokoroService } from './providers/kokoro.service';
import { ChatterboxService } from './providers/chatterbox.service';

@Injectable()
export class TextToSpeechService implements OnModuleInit {
  #providerService: ProviderService;

  constructor(private appConfigService: AppConfigService) {}

  onModuleInit() {
    const config = this.appConfigService.getConfig('externalServices').textToSpeech;

    switch (config.provider) {
      case 'chatterbox':
        this.#providerService = new ChatterboxService(config);
        break;
      case 'kokoro':
        this.#providerService = new KokoroService(config);
        break;
      default:
        throw new Error(
          `Unsupported text-to-speech provider: ${config.provider}`,
        );
    }
  }

  async generate(content: string, voice: string, outputPath: string) {
    await this.#providerService.generate(content, voice, outputPath);
  }

  async isAvailable() {
    return this.#providerService.isAvailable();
  }
}
