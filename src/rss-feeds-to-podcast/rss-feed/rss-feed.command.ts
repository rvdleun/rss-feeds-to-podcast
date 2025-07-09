import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { RssFeedService } from './rss-feed.service';
import { subHours } from 'date-fns';

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
    const { feeds, maxAgeHours } = this.appConfigService.getConfig('rss');

    if (maxAgeHours) {
      const cutoffTime = subHours(new Date(), maxAgeHours);
      this.#logger.log(
        `Filtering items to last ${maxAgeHours} hours (since ${cutoffTime.toISOString()})`,
      );
    }

    await Promise.all(
      feeds.map((feed) => this.rssFeedService.storeItems(feed, maxAgeHours)),
    );
  }
}
