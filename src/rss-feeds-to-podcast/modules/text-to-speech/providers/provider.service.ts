import { NotImplementedException } from '@nestjs/common';
import { AppConfig } from '../../config/config.types';

export class ProviderService {
  async generate(content: string, voice: string, outputPath: string): Promise<void> {
    throw NotImplementedException;
  }

  async isAvailable(): Promise<boolean> {
    throw NotImplementedException;
  }
}