import { Command, CommandRunner } from 'nest-commander';
import { OutputService } from '../../modules/output/output.service';
import { ContentScraperService } from './content-scraper.service';

@Command({
  name: 'scrape-content',
  description: 'Scrapes content from all segments',
})
export class ContentScraperCommand extends CommandRunner {
  constructor(
    private contentScraperService: ContentScraperService,
    private outputService: OutputService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.contentScraperService.scrapeContentFromSegments();
  }
}
