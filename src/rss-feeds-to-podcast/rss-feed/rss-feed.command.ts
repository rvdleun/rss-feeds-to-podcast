import { Command, CommandRunner } from 'nest-commander';
import { RssFeedService } from './rss-feed.service';

@Command({
  name: 'retrieve-rss-feeds',
  description: 'Fetches all items from the RSS feeds',
})
export class RssFeedCommand extends CommandRunner {
  constructor(private rssFeedService: RssFeedService) {
    super();
  }

  async run(): Promise<void> {
    await this.rssFeedService.fetchRssFeeds();
  }
}
