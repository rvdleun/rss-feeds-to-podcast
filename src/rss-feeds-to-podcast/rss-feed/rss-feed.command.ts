import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { RssFeedService } from './rss-feed.service';

@Command({
  name: 'retrieve-rss-feeds',
  description: 'Fetches all items from the RSS feeds',
})
export class RssFeedCommand extends CommandRunner {
  #logger: Logger = new Logger(this.constructor.name);

  constructor(
    private appConfigService: AppConfigService,
    private rssFeedService: RssFeedService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const { feeds } = this.appConfigService.getConfig('rss');
    await Promise.all(
      feeds.map((feed) => this.rssFeedService.storeItems(feed)),
    );
  }
}
