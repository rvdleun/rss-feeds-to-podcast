import { Injectable, OnModuleInit } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { AppConfigService } from '../config/config.service';
import { AppConfig } from '../config/config.types';

@Injectable()
export class TextToSpeechService implements OnModuleInit {
  #config: AppConfig['externalServices']['textToSpeech'];

  constructor(private appConfigService: AppConfigService) {}

  onModuleInit() {
    this.#config =
      this.appConfigService.getConfig('externalServices').textToSpeech;
  }

  async generate(content: string, voice: string, outputPath: string) {
    const response = await fetch(`${this.#config.href}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        download_format: 'mp3',
        input: content,
        response_format: 'mp3',
        return_download_link: true,
        speed: 1,
        stream: true,
        voice,
      }),
    });

    const fileStream = createWriteStream(outputPath);
    await pipeline(response.body, fileStream);
  }
}
