import { Injectable, Logger } from '@nestjs/common';
import { OutputService } from '../../modules/output/output.service';
import { AppConfigService } from '../../modules/config/config.service';
import { ScrapperArticle } from '../../modules/web-scraper/web-scraper.types';
import { Segment } from '../../types/segment';
import { generateSegmentDescription } from '../../utils/segment';
import { DIVIDER } from '../../utils/console';
import { WebScraperService } from '../../modules/web-scraper/web-scraper.service';

@Injectable()
export class ContentScraperService {
  #logger = new Logger(this.constructor.name);

  constructor(
    private outputService: OutputService,
    private webScraperService: WebScraperService,
  ) {}

  async scrapeContentFromSegments() {
    this.#logger.log('Scraping content from segments');

    const isAvailable = await this.webScraperService.isAvailable();
    if (!isAvailable) {
      this.#logger.error(
        'Scrapper is not available. Make sure that it is running locally and the right href is set in external-services.yaml',
      );
      return;
    }

    const segments =
      this.outputService.getDataFromDirectory<Segment>('segments');

    if (!segments || segments.length === 0) {
      this.#logger.warn('No segments found. Run "create-segments" first');
      return;
    }

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      this.#logger.log(
        `Scraping content for segment ${generateSegmentDescription(segment)}`,
      );

      if (segment.content) {
        this.#logger.warn(`Segment already has content.`);
        continue;
      }

      this.#logger.log(`Scraping content...`);

      const response = await this.webScraperService.scrapeContent(
        segment.item.src,
      );

      if (!response) {
        this.#logger.error('No response from scrapper');
        continue;
      }

      const { siteName, textContent } = response;

      if (!textContent) {
        this.#logger.error('No content found');
        continue;
      }

      segment.content = textContent;
      segment.siteName = siteName;

      this.outputService.saveSegment(segment);
      this.#logger.log(DIVIDER);
    }

    this.#logger.log('Content scraped.');
  }
}
