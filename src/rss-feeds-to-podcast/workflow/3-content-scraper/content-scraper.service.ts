import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OutputService } from '../../modules/output/output.service';
import { AppConfigService } from '../../modules/config/config.service';
import { ScrapperArticle, ScrapperPing } from './content-scraper.types';
import { Segment } from '../../types/segment';
import { ExternalServicesConfig } from '../../modules/config/schemas/external-services.schema';
import { generateSegmentDescription } from '../../utils/segment';
import { DIVIDER } from '../../utils/console';

@Injectable()
export class ContentScraperService implements OnModuleInit {
  #logger = new Logger(this.constructor.name);
  #scrapperConfig: ExternalServicesConfig['webScraper'];

  constructor(
    private appConfigService: AppConfigService,
    private outputService: OutputService,
  ) {}

  onModuleInit() {
    this.#scrapperConfig =
      this.appConfigService.getConfig('externalServices').webScraper;
  }

  async scrapeContentFromSegments() {
    this.#logger.log('Scraping content from segments');

    const { isConnected } =
      await this.#makeScrapperRequest<ScrapperPing>('/ping');

    if (!isConnected) {
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

      const { cache, incognito, timeout, waitUntil } = this.#scrapperConfig;

      const searchParams = new URLSearchParams();
      searchParams.set('url', segment.item.src);
      searchParams.set('cache', cache.toString());
      searchParams.set('incognito', incognito.toString());
      searchParams.set('timeout', timeout.toString());
      searchParams.set('wait-until', waitUntil.toString());

      const response = await this.#makeScrapperRequest<ScrapperArticle>(
        '/api/article?' + searchParams.toString(),
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

  async #makeScrapperRequest<T>(endpoint: string): Promise<T> {
    try {
      const href = this.#scrapperConfig.href + endpoint;
      this.#logger.debug(`Making request to scrapper: ${href}`);

      const request = await fetch(href);

      if (!request.ok) {
        throw new Error(`Request failed with status ${request.status}`);
        return undefined;
      }

      const json = await request.json();

      return json as T;
    } catch (error) {
      this.#logger.log('Error while scraping content.');
      this.#logger.error(error);
    }
  }
}
