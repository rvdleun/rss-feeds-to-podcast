import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { AppConfig } from '../../config/config.types';
import { ProviderService } from './provider.service';

export class ChatterboxService implements ProviderService {
  constructor(private config: AppConfig['externalServices']['textToSpeech']) {}

  async generate(content: string, voice: string, outputPath: string) {
    const response = await fetch(`${this.config.href}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content,
        temperature: 0.8,
        exaggeration: 1.3,
        cfg_weight: 0.5,
        speed_factor: 1,
        seed: 0,
        language: 'en',
        voice_mode: 'predefined',
        split_text: true,
        chunk_size: 240,
        output_format: 'mp3',
        predefined_voice_id: `${voice}.wav`,
      }),
    });

    const fileStream = createWriteStream(outputPath);
    await pipeline(response.body, fileStream);
  }

  async isAvailable() {
    try {
      const response = await fetch(`${this.config.href}/api/model-info`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
