import { RssConfig } from './schemas';

export interface AppConfig {
  rss: RssConfig;
}

export type AppConfigKey = keyof AppConfig;
