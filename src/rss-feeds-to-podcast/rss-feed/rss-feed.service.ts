import { Injectable, Logger } from '@nestjs/common';
import { RssConfig, RssFeed, RssFeedSchema } from '../config/schemas';
import * as Parser from 'rss-parser';
import { OutputService } from '../output/output.service';
import slugify from 'slugify';
import { subHours, isAfter, parseISO } from 'date-fns';
import { Item } from 'rss-parser';

console.log(Parser);

@Injectable()
export class RssFeedService {
  #logger = new Logger(this.constructor.name);
  #parser = new Parser();

  constructor(private outputService: OutputService) {}

  async storeItems({ src, title }: RssFeed, maxAgeHours?: number) {
    this.#logger.log(`Fetching RSS Feed from ${src}`);

    const feed = await this.#parser.parseURL(src);
    const key = slugify(feed.title, { lower: true, strict: true });
    const { items } = feed;

    const filteredItems = maxAgeHours
      ? this.#filterItemsWithMaxAgeHours(items, maxAgeHours)
      : items;

    const data = {
      title: title ?? feed.title,
      items: filteredItems.map((item) => ({
        src: item.link,
        title: item.title,
      })),
    };

    this.#logger.log(`Storing RSS Feed to ${key}.json`);

    this.outputService.generateFile(
      `rss-feeds/${key}.json`,
      JSON.stringify(data, null, 2),
    );
  }

  #filterItemsWithMaxAgeHours(items: Item[], maxAgeHours: number) {
    const cutoffTime = subHours(new Date(), maxAgeHours);

    return items.filter((item) => {
      if (!item.pubDate) {
        return false;
      }

      const itemDate = new Date(item.pubDate);
      return isAfter(itemDate, cutoffTime);
    });
  }
}
