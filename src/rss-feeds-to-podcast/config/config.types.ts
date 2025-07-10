import { RssConfig } from './schemas';
import { PodcastConfig } from './schemas/podcast.schema';
import { ExternalServicesConfig } from './schemas/external-services.schema';

export interface AppConfig {
  externalServices: ExternalServicesConfig;
  podcast: PodcastConfig;
  rss: RssConfig;
}

export type AppConfigKey = keyof AppConfig;
