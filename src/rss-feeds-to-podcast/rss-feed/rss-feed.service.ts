import { Injectable, Logger } from '@nestjs/common';
import { RssConfig, RssFeed, RssFeedSchema } from '../config/schemas';
import * as Parser from 'rss-parser';
import { OutputService } from '../output/output.service';
import slugify from 'slugify';

console.log(Parser);

@Injectable()
export class RssFeedService {
  #logger = new Logger(this.constructor.name);
  #parser = new Parser();

  constructor(private outputService: OutputService) {}

  async storeItems({ src, title }: RssFeed) {
    this.#logger.log(`Fetching RSS Feed from ${src}`);

    const feed = await this.#parser.parseURL(src);

    const key = slugify(feed.title, { lower: true, strict: true });
    const data = {
      title: title ?? feed.title,
      items: feed.items.map((item) => ({
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
}
