import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExternalServicesConfig } from '../config/schemas/external-services.schema';
import { AppConfigService } from '../config/config.service';
import { Logger } from '@nestjs/common';
import { ScrapperArticle, ScrapperPing } from './web-scraper.types';

@Injectable()
export class WebScraperService implements OnModuleInit {
  #logger = new Logger(this.constructor.name);
  #scrapperConfig: ExternalServicesConfig['webScraper'];

  constructor(private appConfigService: AppConfigService) {}

  onModuleInit() {
    this.#scrapperConfig =
      this.appConfigService.getConfig('externalServices').webScraper;
  }

  async isAvailable(): Promise<boolean> {
    try {
      this.#logger.debug(`Pinging web scraper service`);

      const request = await fetch(`${this.#scrapperConfig.href}/ping`);
      const json = await request.json();

      return json.isConnected;
    } catch {
      return false;
    }
  }

  async scrapeContent(path: string): Promise<ScrapperArticle> {
    const { cache, incognito, timeout, waitUntil } = this.#scrapperConfig;

    const searchParams = new URLSearchParams();
    searchParams.set('url', path);
    searchParams.set('cache', cache.toString());
    searchParams.set('incognito', incognito.toString());
    searchParams.set('timeout', timeout.toString());
    searchParams.set('wait-until', waitUntil.toString());

    try {
      const href = `${this.#scrapperConfig.href}/api/article?${searchParams.toString()}`;
      this.#logger.debug(`Making request to scrapper: ${href}`);

      const request = await fetch(href);

      if (!request.ok) {
        throw new Error(`Request failed with status ${request.status}`);
        return undefined;
      }

      return await request.json();
    } catch (error) {
      this.#logger.log('Error while scraping content.');
      this.#logger.error(error);
    }
  }
}
