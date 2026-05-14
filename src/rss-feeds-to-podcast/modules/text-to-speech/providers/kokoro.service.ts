import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { AppConfig } from '../../config/config.types';
import { ProviderService } from './provider.service';

export class KokoroService implements ProviderService {
  constructor(private config: AppConfig['externalServices']['textToSpeech']) {}

  async generate(content: string, voice: string, outputPath: string) {
    const response = await fetch(`${this.config.href}/v1/audio/speech`, {
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

  async isAvailable() {
    try {
      const response = await fetch(`${this.config.href}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
