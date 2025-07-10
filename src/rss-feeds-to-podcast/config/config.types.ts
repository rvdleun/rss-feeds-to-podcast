import { RssConfig } from './schemas';
import { PodcastConfig } from './schemas/podcast.schema';

export interface AppConfig {
  podcast: PodcastConfig;
  rss: RssConfig;
}

export type AppConfigKey = keyof AppConfig;
