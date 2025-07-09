import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, AppConfigKey } from './config.types';
import { RssConfig } from './schemas';

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);

  constructor(private configService: ConfigService<AppConfig>) {}

  getConfig(key: AppConfigKey): AppConfig {
    return this.configService.get<AppConfig>('config', { infer: true })[key];
  }
}
